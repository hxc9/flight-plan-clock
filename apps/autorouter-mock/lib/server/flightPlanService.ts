import {redis} from "./dbService";
import {FlightPlanNotFoundError, fplCtotKey, fplKey, IllegalFlightPlanStatusTransition} from "./utils";
import {Status} from "autorouter-dto"
import {buildFplStatusChangeMessage} from "./data/messageData";
import {defaultFlightPlan, pickRoute} from "./data/flightPlanData";
import {error} from "next/dist/build/output/log";
import dayjs from "dayjs";
import {
    changeFlightPlanCtot,
    readFlightPlanCtot
} from "./ctotService";
import {addMessage, deleteMessagesForFlightPlan} from "./messageService";

export async function listFlightPlans(): Promise<Array<Object>> {
    let res1 = await redis.lrange("flightPlans", 0, -1)
    if (res1.length === 0) return []
    let res2 = await redis.json_mget(res1.map((key) => fplKey(key)), '$')
    return (<Array<Array<Object>> | null>res2)?.map((v) => v[0]) ?? []
}

export async function getFlightPlan(fplId: number) {
    // @ts-ignore
    const [data] = await redis.json_get(fplKey(fplId), '$')??[]
    return data
}

export async function createFlightPlan() {
    let uuid = await redis.incr("last_fplid")
    let res1 = await redis.json_set(fplKey(uuid), '$', {
        ...defaultFlightPlan,
        flightplanid: uuid,
        ...pickRoute()
    })
    if (res1 !== "OK") error("Cannot save to Redis: " + res1)
    let res2 = await redis.lpush("flightPlans", uuid)
    if (res2 === 0) error("Wrong return value when adding flight plan to index: " + res2)
}

export async function changeFlightPlanStatus(fplId: number, newStatusStr: string) {
    let newStatus = Status.fromString(newStatusStr)

    let oldStatusStr = await getFplField(fplId, 'status');
    if (!oldStatusStr) throw new FlightPlanNotFoundError()

    let oldStatus = Status.fromString(oldStatusStr)

    if (!newStatus.allowedTransitionFrom(oldStatus)) {
        throw new IllegalFlightPlanStatusTransition()
    }

    await setFplField(fplId, 'status', newStatus.name)

    await addMessage(buildFplStatusChangeMessage(fplId, oldStatus, newStatus))
}

export async function changeFlightPlanEobt(fplId: number, newEobt: number) {
    await setFplField(fplId, 'eobt', newEobt)

    const ctot = await readFlightPlanCtot(fplId)
    if (ctot && dayjs.unix(newEobt).utc().isSameOrAfter(ctot)) {
        await changeFlightPlanCtot(fplId, null)
    }
}

export async function deleteFlightPlan(fplId: number) {
    // delete messages
    await deleteMessagesForFlightPlan(fplId)

    // delete CTOT
    redis.del(fplCtotKey(fplId))

    // delete flight plans
    await redis.lrem("flightPlans", 0, fplId)
    let res1 = await redis.del(fplKey(fplId))
    if (res1 === 0) throw new FlightPlanNotFoundError()
}

const getFplField = async (fplId: number, field: string) => {
    let result = await redis.json_get(fplKey(fplId), `$.${field}`)
    return !result ? null : (<Array<any>>result)[0]
}

async function setFplField(fplId: number, field: string, value: any) {
    let res = await redis.json_set(fplKey(fplId), '$.' + field, value, 'XX')

    if (res !== 'OK') throw new FlightPlanNotFoundError()
}
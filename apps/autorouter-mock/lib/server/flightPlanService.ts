import {redis} from "./dbService";
import {
    FlightPlanNotFoundError,
    fplCtotKey,
    fplKey,
    IllegalFlightPlanStatusTransition,
    IllegalStatusForEobtChange
} from "./utils";
import {allowedTransitionFrom, eobtCanBeChanged, FlightPlan, Status} from "autorouter-dto"
import {
    buildFplBroughtForwardMessage,
    buildFplCancelledMessage,
    buildFplDelayedMessage,
    buildFplDesuspendedMessage,
    buildFplFiledMessage,
    buildFplQueuedMessage,
    buildFplRejectedMessage,
    buildFplStatusChangeMessage,
    buildFplSuspendedMessage
} from "./data/messageData";
import { generateFlightPlan } from "./data/flightPlanData";
import {error} from "next/dist/build/output/log";
import dayjs from "dayjs";
import {changeFlightPlanCtot, readFlightPlanCtot} from "./ctotService";
import {addMessage, deleteMessagesForFlightPlan} from "./messageService";

export async function listFlightPlans(): Promise<Array<FlightPlan>> {
    let res1 = await redis.lrange("flightPlans", 0, -1)
    if (res1.length === 0) return []
    let res2 = await redis.json_mget(res1.map((key) => fplKey(key)), '$')
    return (<Array<Array<FlightPlan>> | null>res2)?.map((v) => v[0]) ?? []
}

export async function getFlightPlan(fplId: number): Promise<FlightPlan | null> {
    // @ts-ignore
    const [data] = await redis.json_get(fplKey(fplId), '$') ?? []
    return data
}

async function nextFlightPlanId() {
    return redis.incr("last_fplid");
}

export async function createFlightPlan(fplId?: number, template?: FlightPlan): Promise<number> {
    let uuid = fplId || await nextFlightPlanId()
    let res1 = await redis.json_set(fplKey(uuid), '$', {
        ...(template || generateFlightPlan()),
        flightplanid: uuid
    })
    if (res1 !== "OK") error("Cannot save to Redis: " + res1)
    let res2 = await redis.lpush("flightPlans", uuid)
    if (res2 === 0) error("Wrong return value when adding flight plan to index: " + res2)
    return uuid
}

export async function changeFlightPlanStatus(fplId: number, newStatus: Status) {
    let oldStatus = await getFplField(fplId, 'status') as Status;
    if (!oldStatus) throw new FlightPlanNotFoundError()

    if (!allowedTransitionFrom(oldStatus, newStatus)) {
        throw new IllegalFlightPlanStatusTransition()
    }

    let transaction = redis.multi();

    await setFplField(fplId, 'status', newStatus)
    await addMessage(buildFplStatusChangeMessage(fplId, oldStatus, newStatus), transaction)
    switch (newStatus) {
        case Status.Filed:
            oldStatus === Status.Created && await addMessage(buildFplFiledMessage(fplId, false), transaction)
            oldStatus === Status.Suspended && await addMessage(buildFplDesuspendedMessage(fplId), transaction)
            break;
        case Status.ManualCorrection:
            await addMessage(buildFplFiledMessage(fplId, false), transaction)
            await addMessage(buildFplQueuedMessage(fplId, false), transaction)
            break;
        case Status.Rejected:
            await addMessage(buildFplRejectedMessage(fplId), transaction)
            break;
        case Status.Suspended:
            await addMessage(buildFplSuspendedMessage(fplId), transaction)
            break;
        case Status.Cancelled:
            await addMessage(buildFplCancelledMessage(fplId), transaction)
            break;
        default:
            break;
    }
    await transaction.exec()
}

export async function changeFlightPlanEobt(fplId: number, newEobt: number) {
    const existingFlightPlan = await getFlightPlan(fplId)
    if (!existingFlightPlan) {
        throw new FlightPlanNotFoundError()
    }
    if (!eobtCanBeChanged(existingFlightPlan.status)) {
        throw new IllegalStatusForEobtChange()
    }

    const oldEobt = existingFlightPlan?.eobt

    const transaction = redis.multi()

    if (oldEobt < newEobt) {
        // Delay
        await setFplField(fplId, 'eobt', newEobt)
        await addMessage(buildFplDelayedMessage(fplId, newEobt, oldEobt), transaction)
        const ctot = await readFlightPlanCtot(fplId)
        if (ctot && dayjs.unix(newEobt).utc().isSameOrAfter(ctot)) {
            await changeFlightPlanCtot(fplId, null, transaction)
        }
    } else {
        // Bring forward
        // 1. Cancel old flight plan
        await setFplField(fplId, 'status', Status.Cancelled)
        await addMessage(buildFplStatusChangeMessage(fplId, existingFlightPlan.status, Status.Cancelled), transaction)
        await addMessage(buildFplCancelledMessage(fplId, true), transaction)

        // 2. Refile with new EOBT
        const newFplId = await nextFlightPlanId()
        await createFlightPlan(newFplId, {...existingFlightPlan, eobt: newEobt})
        await addMessage(buildFplStatusChangeMessage(newFplId, Status.Created, existingFlightPlan.status), transaction)
        await addMessage(buildFplFiledMessage(newFplId, true), transaction)
        if (existingFlightPlan.status === Status.ManualCorrection) {
            await addMessage(buildFplQueuedMessage(newFplId, true), transaction)
        }
        await addMessage(buildFplBroughtForwardMessage(newFplId, newEobt, fplId, oldEobt), transaction)
    }
    await transaction.exec()
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
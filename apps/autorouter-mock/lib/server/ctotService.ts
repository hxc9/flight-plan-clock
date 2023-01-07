import {buildFplSlotCancelledMessage, buildFplSlotMessage} from "./data/messageData";
import dayjs, {Dayjs} from "dayjs";
import utc from "dayjs/plugin/utc"
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"
import {FlightPlanNotFoundError, fplCtotKey, fplKey} from "./utils";
import {redis} from "./dbService";
import {addMessage} from "./messageService";

dayjs.extend(utc)
dayjs.extend(isSameOrAfter)

export async function readFlightPlanCtot(fplId: number|string) : Promise<Dayjs|null> {
    const timestampAsString = await redis.get(fplCtotKey(fplId))
    if (!timestampAsString) return null

    const timestamp : number = +timestampAsString
    return dayjs.unix(timestamp).utc()
}

export async function changeFlightPlanCtot(fplId: number, newCtotTimestamp: number|null) {
    if ((await redis.exists(fplKey(fplId))) !== 1) {
        throw new FlightPlanNotFoundError()
    }
    const hasExistingCtot = (await redis.exists(fplCtotKey(fplId))) === 1

    if (newCtotTimestamp) {
        await redis.set(fplCtotKey(fplId), newCtotTimestamp)
        await addMessage(buildFplSlotMessage(fplId, dayjs.unix(newCtotTimestamp).utc().format('HHmm'), hasExistingCtot))
    } else {
        await redis.del(fplCtotKey(fplId))
        if (hasExistingCtot) {
            await addMessage(buildFplSlotCancelledMessage(fplId))
        }
    }
}


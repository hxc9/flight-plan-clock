import dayjs, {Dayjs} from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"
import utc from "dayjs/plugin/utc"
import {ChainableCommander} from "ioredis";

import {buildFplSlotCancelledMessage, buildFplSlotMessage} from "./data/messageData";
import {redis} from "./dbService";
import { FlightPlanNotFoundError } from './errors';
import {addMessage} from "./messageService";
import { fplCtotKey, fplKey} from "./utils";

dayjs.extend(utc)
dayjs.extend(isSameOrAfter)

export async function readFlightPlanCtot(fplId: number|string) : Promise<Dayjs|null> {
    const timestampAsString = await redis.get(fplCtotKey(fplId))
    if (!timestampAsString) return null

    const timestamp : number = +timestampAsString
    return dayjs.unix(timestamp).utc()
}

export async function changeFlightPlanCtot(fplId: number, newCtotTimestamp: number|null, transaction?: ChainableCommander) {
    const commander = transaction || redis

    if ((await redis.exists(fplKey(fplId))) !== 1) {
        throw new FlightPlanNotFoundError()
    }
    const hasExistingCtot = (await redis.exists(fplCtotKey(fplId))) === 1

    if (newCtotTimestamp) {
        await commander.set(fplCtotKey(fplId), newCtotTimestamp)
        await addMessage(buildFplSlotMessage(fplId, dayjs.unix(newCtotTimestamp).utc().format('HHmm'), hasExistingCtot), transaction)
    } else {
        await commander.del(fplCtotKey(fplId))
        if (hasExistingCtot) {
            await addMessage(buildFplSlotCancelledMessage(fplId), transaction)
        }
    }
}


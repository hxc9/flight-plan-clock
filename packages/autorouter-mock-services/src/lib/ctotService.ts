import dayjs, {Dayjs} from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"
import utc from "dayjs/plugin/utc"
import {ChainableCommander} from "ioredis";

import {buildFplSlotCancelledMessage, buildFplSlotMessage} from "./data/messageData";
import {redis} from "./dbService";
import { FlightPlanNotFoundError } from './errors';
import {addMessage} from "./messageService";
import {DbKeys, ID} from "./dbKeys";

dayjs.extend(utc)
dayjs.extend(isSameOrAfter)

export async function readFlightPlanCtot(userId: ID, fplId: ID) : Promise<Dayjs|null> {
    const timestampAsString = await redis.get(DbKeys.fplCtotKey(userId, fplId))
    if (!timestampAsString) return null

    const timestamp : number = +timestampAsString
    return dayjs.unix(timestamp).utc()
}

export async function changeFlightPlanCtot(userId: ID, fplId: number, newCtotTimestamp: number|null, transaction?: ChainableCommander) {
    const commander = transaction || redis

    if ((await redis.exists(DbKeys.fplKey(userId, fplId))) !== 1) {
        throw new FlightPlanNotFoundError()
    }
    const hasExistingCtot = (await redis.exists(DbKeys.fplCtotKey(userId, fplId))) === 1

    if (newCtotTimestamp) {
        await commander.set(DbKeys.fplCtotKey(userId, fplId), newCtotTimestamp)
        await addMessage(userId, buildFplSlotMessage(fplId, dayjs.unix(newCtotTimestamp).utc().format('HHmm'), hasExistingCtot), transaction)
    } else {
        await commander.del(DbKeys.fplCtotKey(userId, fplId))
        if (hasExistingCtot) {
            await addMessage(userId, buildFplSlotCancelledMessage(fplId), transaction)
        }
    }
}


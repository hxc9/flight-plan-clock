import {ChainableCommander} from "ioredis";
import {FplMessage, FplMessages, FplMessageType} from "autorouter-dto";
import {defaultExpiry, fplKey, redis, schemaPrefix} from "./dbClient";

export function storeMessage(pipeline: ChainableCommander, msg: FplMessage) {
    let key = messageKey(msg);
    let listKey = fplMessageListKey(msg.message.fplid);
    pipeline
        .setex(key, defaultExpiry, JSON.stringify(msg))
        .lpush(listKey, key)
        .expire(listKey, defaultExpiry)
}

export async function getMessagesForFlightPlan(fplId: number) : Promise<FplMessages> {
    const keys = await redis.lrange(fplMessageListKey(fplId), 0, -1)
    if (keys.length === 0) {
        return []
    }
    return (await redis.mget(keys))
        .filter((m) => m !== null)
        .map((m) => JSON.parse(m as string))
}

function messageKey(msg: FplMessage) {
    return `${schemaPrefix}message:${msg.id}`;
}

function fplMessageListKey(fplId: number) {
    return `${fplKey(fplId)}:messages`
}

export function overviewRefreshRequired(msg: FplMessage) {
    switch (msg.type) {
        case FplMessageType.fplan_status_changed:
        case FplMessageType.fplan_filed:
        case FplMessageType.fplan_queued:
        case FplMessageType.fplan_rejected:
        case FplMessageType.fplan_delayed:
        case FplMessageType.fplan_cancelled:
        case FplMessageType.fplan_broughtforward:
            return true
        default:
            return false
    }
}
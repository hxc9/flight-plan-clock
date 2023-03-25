import {FplMessage, FplMessages} from "autorouter-dto";
import {ChainableCommander} from "ioredis";

import {redis} from "./dbService";
import {mapStreamData} from "./messageStreamService";
import {DbKeys, ID} from "./dbKeys";


export async function addMessage(userId: ID, message: FplMessage, transaction?: ChainableCommander) {
    const commander = transaction || redis

    message.id = await redis.incr(DbKeys.lastMsgId)

    await commander.xadd(DbKeys.userMsgKey(userId), 'MAXLEN', '~', 200, "" + message.id,
        'content', JSON.stringify(message),
        'fplId', message.message.fplid)

    await commander.sadd(DbKeys.fplMsgKey(userId, message.message.fplid), message.id)
}

export async function readAllMessages(userId: ID): Promise<FplMessages> {
    const res = await redis.xrange(DbKeys.userMsgKey(userId), '-', '+')
    return res.map(([, data]) => {
        return JSON.parse(mapStreamData(data)['content'])
    })
}

export async function deleteMessagesForFlightPlan(userId: ID, fplId: number) {
  const fplMsgKey = DbKeys.fplMsgKey(userId, fplId);
  const keys = await redis.smembers(fplMsgKey)

    if (keys.length > 0) {
        await redis.xdel(DbKeys.userMsgKey(userId), ...keys)
    }

    await redis.del(fplMsgKey)
}

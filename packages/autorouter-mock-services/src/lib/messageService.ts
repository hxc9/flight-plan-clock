import {FplMessage, FplMessages} from "autorouter-dto";
import {ChainableCommander} from "ioredis";

import {redis} from "./dbService";
import {mapStreamData} from "./messageStreamService";


export async function addMessage(message: FplMessage, transaction?: ChainableCommander) {
    const commander = transaction || redis

    message.id = await redis.incr("last_msgId")

    await commander.xadd('messages', 'MAXLEN', '~', 1000, "" + message.id,
        'content', JSON.stringify(message),
        'fplId', message.message.fplid)

    await commander.sadd(`flightPlan:${message.message.fplid}:messages`, message.id)
}

export async function readAllMessages(): Promise<FplMessages> {
    const res = await redis.xrange('messages', '-', '+')
    return res.map(([, data]) => {
        return JSON.parse(mapStreamData(data)['content'])
    })
}

export async function deleteMessagesForFlightPlan(fplId: number) {
    const keys = await redis.smembers(`flightPlan:${fplId}:messages`)

    if (keys.length > 0) {
        await redis.xdel('messages', ...keys)
    }

    await redis.del(`flightPlan:${fplId}:messages`)
}

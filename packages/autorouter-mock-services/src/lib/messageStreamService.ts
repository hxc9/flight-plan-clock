import {FplMessages} from "autorouter-dto";
import Redis from "ioredis-rejson";
import {redisPool} from "./dbService";
import {DbKeys, ID} from "./dbKeys";

export async function readMessages(userId: ID, count: number, timeout: number): Promise<FplMessages> {
    return await redisPool.use(async (redis) => {
        const messages: MsgData[] = []

      const userMsgKey = DbKeys.userMsgKey(userId);
      const pendingMessages = await groupReadAndClean(userMsgKey, redis, redis.xreadgroup("GROUP", "messageGroup", "api",
          "COUNT", count, "STREAMS", userMsgKey, "0"));
        messages.push(...pendingMessages)

        if (messages.length > 0 || timeout === 0) {
            // immediate return
            if (messages.length < count) {
                // non-blocking additional query
                const newMessages = await groupReadAndClean(userMsgKey, redis, redis.xreadgroup("GROUP", "messageGroup", "api",
                    "COUNT", count - messages.length, "STREAMS", userMsgKey, ">"))
                messages.push(...newMessages)
            }
        } else {
            // blocking query
            const newMessages = await groupReadAndClean(userMsgKey, redis, redis.xreadgroup("GROUP", "messageGroup", "api",
                "COUNT", count, "BLOCK", timeout * 1000, "STREAMS", userMsgKey, ">"))
            messages.push(...newMessages)
        }

        return messages.map((e) => JSON.parse(e['content']))
    })
}

export async function countMessages(userId: ID) : Promise<number> {
    return await redisPool.use(async (redis) => {
        // pull new messages to pending queue
      const userMsgKey = DbKeys.userMsgKey(userId);
      await redis.xreadgroup("GROUP", "messageGroup", "api",
            "STREAMS", userMsgKey, ">")
        const [pendingCount]
          = <[pendingCount: number]>await redis.xpending(userMsgKey, "messageGroup")
        return pendingCount
    })
}

export async function acknowledgeMessages(userId: ID, ...ids: number[]) {
    await redisPool.use(async (redis) => {
        await redis.xack(DbKeys.userMsgKey(userId), "messageGroup", ...ids)
    })
}

type XReadGroupResult = [[unknown, StreamEntry[]]]

async function groupReadAndClean(userMsgKey: string, redis: Redis, res: Promise<unknown[]>): Promise<MsgData[]> {
    const result = <XReadGroupResult>await res

    if (!result) {
        return []
    }

    const [[, data]] = result

    const {valid, deleted} = data.reduce((sp: { valid: MsgData[], deleted: string[] }, v) => {
        const [key, msg] = v
        if (msg) {
            sp.valid.push(mapStreamData(msg))
        } else {
            sp.deleted.push(key)
        }
        return sp
    }, {
        valid: [],
        deleted: []
    })

    if (deleted.length > 0) {
        await redis.xack(userMsgKey, "messageGroup", ...deleted)
    }

    return valid
}

export function mapStreamData(data: StreamData): MsgData {
    return data.reduce((acc: MsgData, _v, i, arr) => {
        if (i % 2 == 0) {
            acc[arr[i]] = arr[i + 1]
        }
        return acc
    }, {})
}

type MsgData = Record<string, string>

type StreamEntry = [string, Array<string>|null]

type StreamData = string[]

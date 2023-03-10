import {FplMessages} from "autorouter-dto";
import genericPool from "generic-pool"
import Redis from "ioredis-rejson";

const redisPool = genericPool.createPool({
    create: async function () {
        return new Redis(process.env.REDIS_URL)
    },
    destroy: async function (client: Redis) {
        client.disconnect()
    }
}, {
    max: 10, // maximum size of the pool
    min: 2 // minimum size of the pool
});

export async function readMessages(count: number, timeout: number): Promise<FplMessages> {
    return await redisPool.use(async (redis) => {
        const messages: MsgData[] = []

        const pendingMessages = await groupReadAndClean(redis, redis.xreadgroup("GROUP", "messageGroup", "api",
          "COUNT", count, "STREAMS", "messages", "0"));
        messages.push(...pendingMessages)

        if (messages.length > 0 || timeout === 0) {
            // immediate return
            if (messages.length < count) {
                // non-blocking additional query
                const newMessages = await groupReadAndClean(redis, redis.xreadgroup("GROUP", "messageGroup", "api",
                    "COUNT", count - messages.length, "STREAMS", "messages", ">"))
                messages.push(...newMessages)
            }
        } else {
            // blocking query
            const newMessages = await groupReadAndClean(redis, redis.xreadgroup("GROUP", "messageGroup", "api",
                "COUNT", count, "BLOCK", timeout * 1000, "STREAMS", "messages", ">"))
            messages.push(...newMessages)
        }

        return messages.map((e) => JSON.parse(e['content']))
    })
}

export async function countMessages() : Promise<number> {
    return await redisPool.use(async (redis) => {
        // pull new messages to pending queue
        await redis.xreadgroup("GROUP", "messageGroup", "api",
            "STREAMS", "messages", ">")
        const [pendingCount]
          = <[pendingCount: number]>await redis.xpending("messages", "messageGroup")
        return pendingCount
    })
}

export async function acknowledgeMessages(...ids: number[]) {
    await redisPool.use(async (redis) => {
        await redis.xack("messages", "messageGroup", ...ids)
    })
}

type XReadGroupResult = [[unknown, StreamEntry[]]]

async function groupReadAndClean(redis: Redis, res: Promise<unknown[]>): Promise<MsgData[]> {
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
        await redis.xack("messages", "messageGroup", ...deleted)
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

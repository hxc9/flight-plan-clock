import Redis from "ioredis-rejson";

export const redis = createDb()

function createDb() {
    const redis = new Redis(process.env.REDIS_URL)
    initDb(redis).catch(console.error)
    return redis
}

async function initDb(redis: Redis) {
    const schemaVersion : number = +((await redis.get("schemaVersion"))??"0")

    if (schemaVersion !== 1) {
        redis.xgroup("CREATE", "messages", "messageGroup", "0", "MKSTREAM")
        redis.set("schemaVersion", "1")
        console.log("Schema set")
    }

    return redis
}

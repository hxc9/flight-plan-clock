import Redis from "ioredis-rejson";
import genericPool from "generic-pool";
import {DbKeys} from "./dbKeys";


export const redis = createDb()

export const redisPool = genericPool.createPool({
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

function createDb() {
    const redis = new Redis(process.env.REDIS_URL)
    initDb(redis).catch(console.error)
    return redis
}

async function initDb(redis: Redis) {
    const schemaVersion : number
      = +((await redis.get(DbKeys.schemaVersion))??(await redis.get("schemaVersion"))??"0")

    /*if (schemaVersion < 1) {
        redis.xgroup("CREATE", "messages", "messageGroup", "0", "MKSTREAM")
        redis.set("schemaVersion", "1")
        console.log("Schema set")
    }*/
    if (schemaVersion === 1) {
      const fplKeys = await redis.keys("flightPlan:*")
      redis.del("schemaVersion", "messages", "flightPlans", "last_msgId", "last_fplid", ...fplKeys)
    }
    if (schemaVersion < 2) {
      redis.set(DbKeys.schemaVersion, 2)
      console.log("Schema set V2")
    }

    return redis
}

import {DbKeys, ID} from "./dbKeys";
import {redis} from "./dbService";
import {deleteFlightPlan} from "./flightPlanService";
import {generateUser} from "./data/userData";

export async function allUsers() : Promise<number[]> {
  const res1 = await redis.lrange(DbKeys.userListKey, 0, -1)
  return res1.map(e => +e).reverse()
}

export async function exists(userId: ID) {
  return await redis.exists(DbKeys.userMsgKey(userId)) === 1
}

export async function getUser(userId: ID) {
  const res = await redis.call("JSON.GET", DbKeys.userKey(userId))
  return JSON.parse(res)
}

export async function createUser() {
  const id = await redis.incr(DbKeys.lastUserId)
  await redis.pipeline()
    .lpush(DbKeys.userListKey, id)
    .call("JSON.SET", DbKeys.userKey(id), "$", JSON.stringify(generateUser(id)))
    .xgroup("CREATE", DbKeys.userMsgKey(id), "messageGroup", "0", "MKSTREAM")
    .exec()
  return id
}

export async function deleteUser(userId: ID) {
  const flightPlans = await redis.lrange(DbKeys.fplListKey(userId), 0, -1)
  flightPlans.forEach(fpl => deleteFlightPlan(userId, +fpl))
  await redis.pipeline()
    .del(DbKeys.fplListKey(userId), DbKeys.userMsgKey(userId), DbKeys.userKey(userId))
    .lrem(DbKeys.userListKey, 0, userId)
    .exec()
}

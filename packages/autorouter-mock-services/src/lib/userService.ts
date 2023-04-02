import {DbKeys, ID} from "./dbKeys";
import {redis} from "./dbService";
import {deleteFlightPlan} from "./flightPlanService";

export async function allUsers() : Promise<number[]> {
  const res1 = await redis.lrange(DbKeys.userListKey, 0, -1)
  return res1.map(e => +e).reverse()
}

export async function createUser() {
  const id = await redis.incr(DbKeys.lastUserId)
  await redis.pipeline()
    .lpush(DbKeys.userListKey, id)
    .xgroup("CREATE", DbKeys.userMsgKey(id), "messageGroup", "0", "MKSTREAM")
    .exec()
  return id
}

export async function deleteUser(userId: ID) {
  const flightPlans = await redis.lrange(DbKeys.fplListKey(userId), 0, -1)
  flightPlans.forEach(fpl => deleteFlightPlan(userId, +fpl))
  await redis.pipeline()
    .del(DbKeys.fplListKey(userId) ,DbKeys.userMsgKey(userId))
    .lrem(DbKeys.userListKey, 0, userId)
    .exec()
}

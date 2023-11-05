const schemaPrefix = "mockoRouter"

export function schemaKey(next: string) {
  return extendKey(schemaPrefix, next)
}

export type ID = number | string

function userKey(userId: ID) {
  return schemaKey(extendKey('user', '' + userId))
}

function fplKey(userId: ID, fplId: ID) {
  return extendKey(userKey(userId), 'flightPlan', '' + fplId)
}

export function extendKey(key: string, ...newParts: string[]) {
  let newKey = key
  for (const part of newParts) {
    newKey += ':' + part
  }
  return newKey
}

const oauth2Key = schemaKey("oauth2")

export const DbKeys = {
  schemaVersion: schemaKey("schemaVersion"),
  lastFplId: schemaKey("last_fpl_id"),
  lastMsgId: schemaKey("last_msg_id"),
  lastUserId: schemaKey("last_user_id"),
  fplKey,
  fplListKey: (userId: ID) => extendKey(userKey(userId), 'flightPlans'),
  fplCtotKey: (userId: ID, fplId: ID) => extendKey(fplKey(userId, fplId), "ctot"),
  fplMsgKey: (userId: ID, fplId: ID) => extendKey(fplKey(userId, fplId), 'messages'),
  userListKey: schemaKey("users"),
  userKey: (userId: ID) => userKey(userId),
  userMsgKey: (userId: ID) => extendKey(userKey(userId), 'messages'),
  oauth2AuthorizationKey: (code: string) => extendKey(oauth2Key, "authorization", code),
  oauth2AccessTokenKey: (token: string) => extendKey(oauth2Key, "accessToken", token),
}

import {redis, userKey, userSessionKey} from './dbClient'

function accessTokenKey(userId: number) {
  return `${userKey(userId)}:accessToken`;
}

export async function saveAccessToken(userId: number, accessToken: string, expiresIn: number) {
    // save the access token
    await redis.setex(accessTokenKey(userId), expiresIn, accessToken)
}

export async function getKnownUsers() {
    const keys = await redis.keys(userKey('*'))
    return keys.map(key => parseInt(key.split(':')[1]))
}

export async function logoutUser(userId: number, logoutAll: boolean) {
  const keys = await redis.keys(userSessionKey(userId) + ':*')
  if (logoutAll || keys.length == 0) {
    await redis.del([...keys, accessTokenKey(userId)])
  }
}

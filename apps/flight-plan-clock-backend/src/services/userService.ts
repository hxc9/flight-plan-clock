import {redis, userKey} from './dbClient'

function accessTokenKey(userId: number) {
  return `${userKey(userId)}:accessToken`;
}

export async function saveAccessToken(userId: number, accessToken: string, expiresIn: number) {
    // save the access token
    await redis.setex(accessTokenKey(userId), expiresIn, accessToken)
}

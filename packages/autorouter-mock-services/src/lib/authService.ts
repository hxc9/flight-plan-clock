import { AuthorizationCode, Token } from 'oauth2-server';
import {DbKeys} from "./dbKeys";
import {redis} from "./dbService";

export async function saveAuthorizationCode(code: AuthorizationCode) {
  await redis.json_set(DbKeys.oauth2AuthorizationKey(code.authorizationCode), '$', code)
}

export async function getAuthorizationCode(authorizationCode: string) {
  const [code] = <[AuthorizationCode] | null>await redis.json_get(DbKeys.oauth2AuthorizationKey(authorizationCode), '$')??[]
  return code
}

export async function deleteAuthorizationCode(code: AuthorizationCode) {
  return await redis.del(DbKeys.oauth2AuthorizationKey(code.authorizationCode)) === 1
}

type AccessToken = Omit<Token, "client"> & {clientId: string}

export async function saveAccessToken(token: AccessToken) {
  await redis.json_set(DbKeys.oauth2AccessTokenKey(token.accessToken), '$', token)
}

export async function getAccessToken(accessToken: string) {
  const [token] = <[AccessToken] | null>await redis.json_get(DbKeys.oauth2AccessTokenKey(accessToken), '$')??[]
  return token
}

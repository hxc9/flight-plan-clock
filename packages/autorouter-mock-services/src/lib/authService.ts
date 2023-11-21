import OAuth2Server, { AuthorizationCode, Token } from 'oauth2-server';
import { DbKeys } from './dbKeys';
import { redis } from './dbService';

async function saveAuthorizationCode(code: AuthorizationCode) {
  const key = DbKeys.oauth2AuthorizationKey(code.authorizationCode);
  await redis.json_set(key, '$', code)
  await redis.expireat(key, Math.floor(code.expiresAt.getTime() / 1000))
  return code
}

async function getAuthorizationCode(authorizationCode: string) {
  const [code] = <[AuthorizationCode] | null>await redis.json_get(DbKeys.oauth2AuthorizationKey(authorizationCode), '$')??[]
  return code ? { ...code, expiresAt: new Date(code.expiresAt) } : null
}

async function deleteAuthorizationCode(code: AuthorizationCode) {
  return await redis.del(DbKeys.oauth2AuthorizationKey(code.authorizationCode)) === 1
}

type AccessToken = Omit<Token, "client"> & {clientId: string}

async function saveAccessToken(token: AccessToken) {
  const key = DbKeys.oauth2AccessTokenKey(token.accessToken);
  await redis.json_set(key, '$', token)
  await redis.expireat(key, Math.floor(token.expiresAt.getTime() / 1000))
}

async function getAccessToken(accessToken: string) {
  const [token] = <[AccessToken] | null>await redis.json_get(DbKeys.oauth2AccessTokenKey(accessToken), '$')??[]
  return token
}

export async function getClient(clientId: string, clientSecret?: string) {
  if (clientId === 'flight-plan-clock' && (!clientSecret || clientSecret === 'fpl-clock-secret')) {
    return {
      id: 'flight-plan-clock',
      grants: ['authorization_code'],
      redirectUris: ['http://localhost:3002/api/user/callback'],
    }
  }
}

const model : OAuth2Server.AuthorizationCodeModel = {
  getAccessToken: async function(accessToken: string) {
    const token = await getAccessToken(accessToken);
    if (!token) return null;
    const client = await getClient(token.clientId, '');
    if (!client) return null;
    return {
      accessToken: token.accessToken,
      accessTokenExpiresAt: new Date(token.expiresAt),
      scope: token.scope,
      client,
      user: token.user
    };
  },
  getAuthorizationCode,
  getClient,
  revokeAuthorizationCode: deleteAuthorizationCode,
  saveAuthorizationCode: async function(code: OAuth2Server.AuthorizationCode, client: OAuth2Server.Client, user: OAuth2Server.User) {
    return await saveAuthorizationCode({...code, client, user});
  },
  saveToken: async function(token: OAuth2Server.Token, client: OAuth2Server.Client, user: OAuth2Server.User) {
    const accessToken = {
      accessToken: token.accessToken,
      expiresAt: token.accessTokenExpiresAt,
      scope: token.scope,
      clientId: client.id,
      user,
    }
    /*    const refreshToken = {
          refreshToken: token.refreshToken,
          expiresAt: token.refreshTokenExpiresAt,
          scope: token.scope,
          client: {id: client.id},
          user: {id: user.id},
        }*/
    await saveAccessToken(accessToken);
    return {...token, client, user}
  },
  verifyScope: async function(token: OAuth2Server.Token, scope: string | string[]): Promise<boolean> {
    if (!token.scope) {
      return false;
    }
    let requestedScopes = Array.isArray(scope) ? scope : scope.split(' ');
    let authorizedScopes = Array.isArray(token.scope) ? token.scope: token.scope.split(' ');
    return requestedScopes.every(s => authorizedScopes.indexOf(s) >= 0);
  }
}

export const oauth2 = new OAuth2Server({model,
  accessTokenLifetime: 24 * 60 * 60,
});

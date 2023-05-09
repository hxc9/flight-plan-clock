import OAuth2Server from 'oauth2-server';
import { authService } from 'autorouter-mock-services';


export const model : OAuth2Server.AuthorizationCodeModel = {
  getAccessToken: async function(accessToken: string) {
    const token = await authService.getAccessToken(accessToken);
    if (!token) return null;
    const client = await this.getClient(token.clientId, '');
    if (!client) return null;
    return {
      accessToken: token.accessToken,
      accessTokenExpiresAt: token.expiresAt,
      scope: token.scope,
      client,
      user: token.user
    };
  },
  getAuthorizationCode: async function(authorizationCode: string) {
    return await authService.getAuthorizationCode(authorizationCode);
  },
  getClient: async function(clientId: string, clientSecret: string) {
    if (clientId === 'flight-plan-clock') {
      return {
        id: 'flight-plan-clock',
        grants: ['authorization_code'],
        redirectUris: ['http://localhost:3003/oauth2'],
      }
    }
  },
  revokeAuthorizationCode: async function(code: OAuth2Server.AuthorizationCode, callback?: OAuth2Server.Callback<boolean>): Promise<boolean> {
    return await authService.deleteAuthorizationCode(code);
  },
  saveAuthorizationCode: async function(code: OAuth2Server.AuthorizationCode, client: OAuth2Server.Client, user: OAuth2Server.User) {
    await authService.saveAuthorizationCode(code);
    return code;
  },
  saveToken: async function(token: OAuth2Server.Token, client: OAuth2Server.Client, user: OAuth2Server.User) {
    const accessToken = {
      accessToken: token.accessToken,
      expiresAt: token.accessTokenExpiresAt,
      scope: token.scope,
      clientId: client.id,
      user: {id: user.id},
    }
/*    const refreshToken = {
      refreshToken: token.refreshToken,
      expiresAt: token.refreshTokenExpiresAt,
      scope: token.scope,
      client: {id: client.id},
      user: {id: user.id},
    }*/
    await authService.saveAccessToken(accessToken);
    return token;
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

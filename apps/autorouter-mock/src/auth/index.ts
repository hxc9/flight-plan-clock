import {authService, userService} from "autorouter-mock-services";
import express, { Request, Response, Router } from 'express';
import OAuth2, { OAuthError } from 'oauth2-server';

const router : Router = express.Router()

async function authorize(req: Request, response: Response) {
    try {
      const request = new OAuth2.Request(req);
      const authCode = await authService.oauth2.authorize(request, new OAuth2.Response(response), {authenticateHandler: {
                handle: async function(request: OAuth2.Request) {
                    const user = request.query?.user
                    if (user && await userService.exists(user)) {
                        return user
                    }
                }
            }})

      const redirectTarget = new URL(authCode.redirectUri)
      redirectTarget.searchParams.append('code', authCode.authorizationCode)
      if (request.query?.state) redirectTarget.searchParams.append('state', request.query.state)

      response.redirect(302, redirectTarget.toString())
    } catch (e) {
      console.log(e)
      response.status(e instanceof  OAuthError ? e.code :500).json(e)
    }
}

async function token(req: Request, res: Response) {
  const request = new OAuth2.Request(req);
  const response = new OAuth2.Response(res);

  try {
    const token = await authService.oauth2.token(request, response);

    res.status(200).json(token);
  } catch (e) {
    console.log(e)
    res.status(e instanceof  OAuthError ? e.code :500).json(e)
  }
}

async function helloWorld(req: Request, res: Response) {
  const request = new OAuth2.Request(req);
  const response = new OAuth2.Response(res);

  try {
    const token = await authService.oauth2.authenticate(request, response);

    res.status(200).json({ message: `Hello ${token.user}` });
  } catch (e) {
    console.log(e)
    res.status(e instanceof  OAuthError ? e.code :500).json(e)
  }
}

router.get('/authorize', authorize)
router.post('/api/oauth2/token', token)
router.get('/api/oauth2/test', helloWorld)

export default router

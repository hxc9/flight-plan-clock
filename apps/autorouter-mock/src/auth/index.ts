import {authService, userService} from "autorouter-mock-services";
import express, { Request, Response, Router } from 'express';
import OAuth2 from "oauth2-server";

const router : Router = express.Router()

export async function authorize(req: Request, response: Response) {
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

      console.log(authCode)

      const redirectTarget = new URL(authCode.redirectUri)
      redirectTarget.searchParams.append('code', authCode.authorizationCode)
      if (request.query?.state) redirectTarget.searchParams.append('state', request.query.state)

      response.redirect(302, redirectTarget.toString())
    } catch (e) {
      console.log(e)
      response.status(500).json(e)
    }
}

router.get('/authorize', authorize)

export default router

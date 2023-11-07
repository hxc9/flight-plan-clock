import OAuth2 from "oauth2-server";
import {NextFunction, Request, Response} from "express";
import {authService} from "autorouter-mock-services";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  authService.oauth2.authenticate(new OAuth2.Request(req), new OAuth2.Response(res)).then((token) => {
    req.auth = token
    req.user = +token.user
    next()
  }).catch((err) => {
    console.error(err)
    res.status(500).json(err)
  })
}

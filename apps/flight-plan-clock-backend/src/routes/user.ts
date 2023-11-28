import express, {Request, Response, Router} from "express";
import passport from "passport"
import OAuth2Strategy, {VerifyCallback} from "passport-oauth2";
import fetch from "node-fetch";
import {
  logoutUser,
  saveAccessToken
} from "../services/userService";
import {User} from "autorouter-dto";
import {OrchestratorService} from "../services/orchestratorService";

const autorouterOauth2Strategy = new OAuth2Strategy(
  {
    authorizationURL: "http://localhost:3001/authorize",
    tokenURL: "http://localhost:3000/api/oauth2/token",
    clientID: "flight-plan-clock",
    clientSecret: "fpl-clock-secret",
    state: true,
    callbackURL: "http://localhost:3002/api/user/callback",
  },
  async function (
    accessToken: string,
    _refreshToken: string,
    params,
    profile: User,
    cb: VerifyCallback
  ) {
    const { expires_in: expiresIn } = params;
    await saveAccessToken(profile.uid, accessToken, expiresIn ?? 3600);
    cb(null, profile);
  }
);

autorouterOauth2Strategy.userProfile = async function (accessToken, done) {
  const user = await fetch("http://localhost:3000/api/user/0", {
    headers: {
      Authorization: "Bearer " + accessToken
    }
  }).then(r => r.json())
  done(null, user)
}

passport.use(autorouterOauth2Strategy);

passport.serializeUser(function (user, done) {
  done(null, user);
})

passport.deserializeUser(function (user: Express.User, done) {
  done(null, user);
})

const router: Router = express.Router()

router.get('/login', passport.authenticate("oauth2"))
router.get('/callback', passport.authenticate("oauth2", {failureRedirect: '/login'}), async (req: Request, res: Response) => {
  console.log("Authentication success!", req.user)
  const orchestratorService = await OrchestratorService.getInstance()
  orchestratorService.create((req.user as User).uid)
  res.redirect('http://localhost:3003/')
})

router.post('/logout', function(req, res, next) {
  const uid = (req.user as User).uid
  res.clearCookie('connect.sid');
  req.logout(function(err) {
    if (err) { return next(err); }
    req.session.destroy(function() {
        logoutUser(uid, Boolean(req.query.all)).then(() => {
          res.status(200).end();
        })
    })
  });
});

router.get('/me', (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    res.json(req.user)
  } else {
    res.status(401).end()
  }
})

export default router

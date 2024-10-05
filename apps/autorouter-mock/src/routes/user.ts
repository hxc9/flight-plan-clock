import express, { Request, Response, Router } from 'express';
import {User} from "autorouter-dto";
import { userService } from "autorouter-mock-services"
import {authMiddleware} from "../auth/middleware";

const router : Router = express.Router()

router.use(authMiddleware)

router.get('/0', async (req: Request, res: Response<User>) => {
  const data = await userService.getUser(req.user)
  res.status(200).json(data)
})

export default router

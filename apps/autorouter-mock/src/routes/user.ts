import express, { Request, Response, Router } from 'express';
import {User} from "autorouter-dto";
import { userService } from "autorouter-mock-services"

const router : Router = express.Router()

router.get('/0', async (req: Request, res: Response<User>) => {
  const data = await userService.getUser(1) // TODO get user id from token
  res.status(200).json(data)
})

export default router

import { FplMessages } from 'autorouter-dto';
import express, { Request, Response, Router } from 'express';
import {
  acknowledgeMessages,
  countMessages,
  readMessages
} from '../lib/server/messageStreamService';

const router : Router = express.Router()

router.get('/', async (req: Request, res: Response<FplMessages>) => {
  const { query: {limit= "10", timeout="30"}} = req

    res.status(200).json(await readMessages((+limit), (+timeout)))
})
router.get('/count', async (req: Request, res: Response<number>) => {
  res.status(200).json(await countMessages())
})
router.post('/acknowledge', async (req: Request, res: Response) => {
  const { body } = req

    if (body && body.length > 0) {
      await acknowledgeMessages(body)
      res.status(200).end()
    } else {
      res.status(400).end()
    }
})
router.post('/:id/acknowledge', async (req: Request, res: Response) => {
  const { params: {id}} = req

    if (id) {
      await acknowledgeMessages(+id)
      res.status(200).end()
    } else {
      res.status(400).end()
    }
})

export default router

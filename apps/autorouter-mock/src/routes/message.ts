import { FplMessages } from 'autorouter-dto';
import express, { Request, Response, Router } from 'express';
import { messageStreamService } from 'autorouter-mock-services';
import {authMiddleware} from "../auth/middleware";

const router: Router = express.Router();

const TODO_USER_ID = 1

//router.use(authMiddleware)

router.get('/', async (req: Request, res: Response<FplMessages>) => {
  const { query: { limit = '10', timeout = '30' } } = req;

  res.status(200).json(await messageStreamService.readMessages(TODO_USER_ID, (+limit), (+timeout)));
});
router.get('/count', async (req: Request, res: Response<number>) => {
  res.status(200).json(await messageStreamService.countMessages(TODO_USER_ID));
});
router.post('/acknowledge', async (req: Request, res: Response) => {
  const { body } = req;

  if (body && body.length > 0) {
    await messageStreamService.acknowledgeMessages(TODO_USER_ID, body);
    res.status(200).end();
  } else {
    res.status(400).end();
  }
});
router.post('/:id/acknowledge', async (req: Request, res: Response) => {
  const { params: { id } } = req;

  if (id) {
    await messageStreamService.acknowledgeMessages(TODO_USER_ID, +id);
    res.status(200).end();
  } else {
    res.status(400).end();
  }
});

export default router;

import dotenv from 'dotenv';
import express, { Express, Request, Response } from 'express';
import flightPlan from './routes/flightPlan';
import message from './routes/message';

dotenv.config({path: `.env.${process.env.NODE_ENV || 'local'}`})

const app: Express = express();

app.get('/', (_req: Request, res: Response) => {
  res.send('Autorouter mock server');
});

app.use(express.json());

app.use('/api/flightPlan', flightPlan);
app.use('/api/message', message);

export default app

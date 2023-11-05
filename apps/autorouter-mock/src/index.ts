import dotenv from 'dotenv';
import express, { Express, Request, Response } from 'express';
import flightPlan from './routes/flightPlan';
import message from './routes/message';
import auth from './auth';
import user from "./routes/user";

import {authService} from "autorouter-mock-services";

dotenv.config({path: `.env.${process.env.NODE_ENV || 'local'}`})

const app: Express = express();
const port = process.env.AR_MOCK_PORT || 3000;

app.get('/', (_req: Request, res: Response) => {
  res.send('Autorouter mock server');
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/flightPlan', flightPlan);
app.use('/api/message', message);
app.use('/api/user', user)
app.use('/', auth);

const server = app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

process.on('SIGINT', () => server.close());
process.on('SIGTERM', () => server.close());

export default app

import dotenv from 'dotenv';
import express, { Express, Request, Response } from 'express';
import OAuthServer from 'express-oauth-server';
import { model } from './auth';
import flightPlan from './routes/flightPlan';
import message from './routes/message';

dotenv.config({path: `.env.${process.env.NODE_ENV || 'local'}`})

const app: Express = express();
const port = process.env.AR_MOCK_PORT || 3000;

const oAuth = new OAuthServer({
  model
});

app.get('/', (_req: Request, res: Response) => {
  res.send('Autorouter mock server');
});

app.use(express.json());
app.use(oAuth.authorize())

app.use('/api/flightPlan', flightPlan);
app.use('/api/message', message);

const server = app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

process.on('SIGINT', () => server.close());
process.on('SIGTERM', () => server.close());

export default app

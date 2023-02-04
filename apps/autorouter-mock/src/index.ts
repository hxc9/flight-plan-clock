import dotenv from 'dotenv';
dotenv.config();
import express, { Express, Request, Response } from 'express';

import flightPlan from './routes/flightPlan';
import message from './routes/message';

const app: Express = express();
const port = process.env.PORT || 3000;

app.get('/', (_req: Request, res: Response) => {
  res.send('Autorouter mock server');
});

app.use(express.json())

app.use('/api/flightPlan', flightPlan)
app.use('/api/message', message)

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

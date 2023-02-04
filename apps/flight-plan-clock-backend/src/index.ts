import dotenv from 'dotenv';

dotenv.config();
import express, { Express, Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PORT } from './config';

import flightPlans from './routes/flightPlans';
import { PollingService } from './services/pollingService';

const app: Express = express();
const port = PORT || 3002;

app.get('/', (_req: Request, res: Response) => {
  res.send('Autorouter mock server');
});

app.use(express.json());

app.get('/api/ping', (req: Request, res: Response) => {
  res.status(200).end();
});
app.use('/api/flightPlans', flightPlans);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    optionsSuccessStatus: 204
  }
});

const pollingService = new PollingService(io);
pollingService.start();

process.on('exit', function() {
  io.disconnectSockets(true);
});

httpServer.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

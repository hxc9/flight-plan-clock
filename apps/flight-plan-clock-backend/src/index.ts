import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
import express, { Express, Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { FPC_BACKEND_PORT } from './config';

import flightPlans from './routes/flightPlans';
import oauth2Callback from './routes/oauth2Callback';
import { PollingService } from './services/pollingService';
import session from "express-session";

const app: Express = express();
const port = FPC_BACKEND_PORT || 3002;

app.get('/', (_req: Request, res: Response) => {
  res.send('FlightPlanClock server');
});

app.use(express.json());
app.use(session({secret: "secret"}))
app.use(cors())

app.get('/api/ping', (req: Request, res: Response) => {
  res.status(200).end();
});
app.use('/api/flightPlans', flightPlans);
app.use('/api/oauth2', oauth2Callback)

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

process.on('SIGINT', () => httpServer.close());
process.on('SIGTERM', () => httpServer.close());

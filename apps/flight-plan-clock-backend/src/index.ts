import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
import express, { Express, Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import {FPC_BACKEND_PORT, FRONTEND_HOST, SESSION_SECRET} from './config';

import flightPlans from './routes/flightPlans';
import oauth2Callback from './routes/oauth2Callback';
import { PollingService } from './services/pollingService';
import session from "express-session";
import metar from "./routes/metar";
import passport from "passport";
import RedisStore from "connect-redis";
import {redis, schemaPrefix} from "./services/dbClient";

const app: Express = express();
const port = FPC_BACKEND_PORT || 3002;

app.get('/', (_req: Request, res: Response) => {
  res.send('FlightPlanClock server');
});

let redisStore = new RedisStore({
  client: redis,
  prefix: schemaPrefix + 'session:'
})

app.use(express.json());
app.use(session({
  store: redisStore,
  resave: false,
  saveUninitialized: false,
  secret: SESSION_SECRET!
}))
app.use(cors({
  credentials: true,
  origin: FRONTEND_HOST
}))
app.use(passport.initialize())
app.use(passport.session())

app.all('*', (req: Request, res: Response, next) => {
  if (req.path.startsWith('/api/oauth2') || req.path === '/api/ping') {
    next()
  } else {
    if (req.isAuthenticated()) {
      next()
    } else {
      res.status(401).end()
    }
  }
})

app.get('/api/ping', (req: Request, res: Response) => {
  console.log('SESSION', req.session)
  console.log('SESSION ID', req.sessionID)
  console.log('USER', req.user)
  res.status(200).end();
});
app.use('/api/flightPlans', flightPlans);
app.use('/api/oauth2', oauth2Callback)
app.use('/api/metar', metar)

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

import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
import express, {
  Express,
  Handler,
  NextFunction,
  Request,
  Response
} from 'express';
import { createServer } from 'http';
import {Server, Socket} from 'socket.io';
import {FPC_BACKEND_PORT, FRONTEND_HOST, SESSION_SECRET} from './config';

import flightPlans from './routes/flightPlans';
import user from './routes/user';
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
const sessionMiddleware = session({
  store: redisStore,
  resave: false,
  saveUninitialized: false,
  secret: SESSION_SECRET!
});

app.use(sessionMiddleware)
app.use(cors({
  credentials: true,
  origin: FRONTEND_HOST
}))
app.use(passport.initialize())
app.use(passport.session())

app.all('*', (req: Request, res: Response, next) => {
  if (req.path.startsWith('/api/user') || req.path === '/api/ping') {
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
app.use('/api/user', user)
app.use('/api/metar', metar)

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_HOST,
    methods: ['GET', 'POST'],
    optionsSuccessStatus: 204,
    credentials: true
  }
});

function wrap(middleware: Handler) {
  return (socket: Socket, next: any) => middleware(socket.request as Request, {} as any, next)
}

io.use(wrap(sessionMiddleware))
io.use(wrap(passport.initialize()))
io.use(wrap(passport.session()))

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

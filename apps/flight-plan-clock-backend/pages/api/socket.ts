import type { Server as HTTPServer } from 'http'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { Socket as NetSocket } from 'net'
import type { Server as IOServer } from 'socket.io'
import {Server} from "socket.io";
import {PollingService} from "../../lib/pollingService";
import { runCorsMiddleware } from '../../lib/middleware/cors';

interface SocketServer extends HTTPServer {
    io?: IOServer | undefined
}

interface SocketWithIO extends NetSocket {
    server: SocketServer
}

interface NextApiResponseWithSocket extends NextApiResponse {
    socket: SocketWithIO
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponseWithSocket
) {
    await runCorsMiddleware(req, res)

    if (res.socket.server.io) {
        console.log("socket is already running")
    } else {
        console.log("initializing socket")
        const io = new Server(res.socket.server, {cors: {
            origin: "*",
            methods: ["GET", "POST"],
            optionsSuccessStatus: 204
        }})
        res.socket.server.io = io

        const pollingService = new PollingService(io)
        pollingService.start()
    }
    res.status(200).end()
}
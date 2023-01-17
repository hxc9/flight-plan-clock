import type { Server as HTTPServer } from 'http'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { Socket as NetSocket } from 'net'
import type { Server as IOServer } from 'socket.io'
import { runCorsMiddleware } from '../../lib/middleware/cors';
import {runSocketInitMiddleware} from "../../lib/middleware/socketInit";

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
    await runSocketInitMiddleware(req, res)

    res.status(200).end()
}
import type { Server as HTTPServer } from 'http'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { Socket as NetSocket } from 'net'
import type { Server as IOServer } from 'socket.io'
import {Server} from "socket.io";
import {PollingService} from "../../lib/pollingService";

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
    if (res.socket.server.io) {
        console.log("socket is already running")
    } else {
        console.log("initializing socket")
        const io = new Server(res.socket.server)
        res.socket.server.io = io

        io.on('connection', socket => {
            PollingService.subscribe(socket)
            socket.on('disconnect', () => {
                PollingService.unsubscribe(socket)
            })
        })
    }
    res.end()
}
import {NextApiRequest, NextApiResponse} from "next";
import {Server as HTTPServer} from "http";
import {Server, Server as IOServer} from "socket.io";
import {Socket as NetSocket} from "net";
import {PollingService} from "../pollingService";
import {runMiddleware} from "./utils";

interface SocketServer extends HTTPServer {
    io?: IOServer | undefined
}

interface SocketWithIO extends NetSocket {
    server: SocketServer
}

interface NextApiResponseWithSocket extends NextApiResponse {
    socket: SocketWithIO
}

export function SocketInitMiddleware(
    req: NextApiRequest,
    res: NextApiResponseWithSocket,
    next: (result?: any) => any) {
    if (!res.socket.server.io) {
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
    next()
}

export function runSocketInitMiddleware(
    req: NextApiRequest,
    res: NextApiResponse
) {
    return runMiddleware(req, res, SocketInitMiddleware)
}
import {Server, Socket} from "socket.io";
import {ackMessages, fetchMessages} from "./apiClient";
import {redis} from "./dbClient";
import {deleteFplCtot, setFplCtot} from "./ctotService";
import {
    FlightPlanFull,
    FplMessage,
    fplMessageIs,
    FplMessages,
    WsMessage
} from "autorouter-dto";
import {storeMessage} from "./messageService";
import {setLastUpdated} from "./lastUpdateService";

const batchSize = 30

export class PollingService {
    private io: Server
    private subscribers: Socket[] = []
    private timerId: NodeJS.Timeout | undefined
    private running = false

    constructor(io: Server) {
        this.io = io
    }

    start() {
        this.io.on('connection', socket => {
            this.subscribe(socket)
            socket.on('disconnect', () => {
                this.unsubscribe(socket)
            })

        })
    }

    private subscribe(socket: Socket): void {
        this.subscribers.push(socket)
        if (this.subscribers.length > 0 && !this.running) {
            this.running = true
            this.timerId = setTimeout(this.poll.bind(this), 0)
            console.log("Polling started")
        }
    }

    private unsubscribe(socket: Socket): void {
        this.subscribers = this.subscribers.filter(v => v !== socket)
        if (this.subscribers.length === 0) {
            this.timerId && clearTimeout(this.timerId)
            this.running = false
            console.log("Polling stopped")
        }
    }

    private async poll() {
        try {
            const foundMessages = await this.pollMessages(batchSize)
            if (foundMessages) {
                console.log("Notifying of new messages...")
                this.io.emit("new-messages")
            }
        } catch (e) {
            console.error(e)
        }
        if (this.running) {
            this.timerId = setTimeout(this.poll.bind(this), 5000)
        }
    }

    private async pollMessages(timeout: number) {
        let messageCount
        let totalMessages = 0

        do {
            messageCount = await this.processMessages(batchSize, timeout)
            totalMessages += messageCount
            timeout = 0
        } while (messageCount === batchSize)

        return totalMessages > 0
    }

    private async processMessages(count: number, timeout: number = 0) {
        let messages: FplMessages = await fetchMessages(count, timeout)
        if (messages.length === 0) {
            return 0
        }

        const pipeline = redis.pipeline()

        messages.forEach((msg: FplMessage) => {
            if (fplMessageIs.slot(msg)) {
                setFplCtot(pipeline, msg.message.fplid, msg.message.ctot)
            } else if (fplMessageIs.slotCancelled(msg)) {
                deleteFplCtot(pipeline, msg.message.fplid)
            }

            storeMessage(pipeline, msg)

            if (fplMessageIs.statusChanged(msg)) {
                this.relayUpdateMessage(msg, {status: msg.message.status})
            } else if (fplMessageIs.slot(msg)) {
                this.relayUpdateMessage(msg, {ctot: msg.message.ctot})
            } else if (fplMessageIs.slotCancelled(msg)) {
                this.relayUpdateMessage(msg, {ctot: undefined})
            } else if (fplMessageIs.delayed(msg)) {
                this.relayUpdateMessage(msg, {eobt: msg.message.eobt})
            } else if (fplMessageIs.broughtForward(msg)) {
                this.relayFplMessage('fpl-refiled', {
                    fplId: msg.message.previous_fplid,
                    timestamp: msg.timestamp,
                    refiledAs: msg.message.fplid})
            }
        })

        setLastUpdated(pipeline, Math.max(...messages.map(m => m.timestamp)))

        await pipeline.exec()
        await ackMessages(messages.map((m: FplMessage) => m.id))
        return messages.length
    }

    private relayFplMessage<T extends WsMessage>(type: string, msg: T) {
        this.io.to('' + msg.fplId).emit(type, msg)
    }

    private relayUpdateMessage(msg: FplMessage, payload: Partial<FlightPlanFull>) {
        this.relayFplMessage('fpl-change', { fplId: msg.message.fplid, timestamp: msg.timestamp, update: payload})
    }
}

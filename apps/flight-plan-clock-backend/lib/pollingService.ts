import {Server, Socket} from "socket.io";
import {ackMessages, fetchMessages} from "./apiClient";
import {redis} from "./dbClient";
import {deleteFplCtot, setFplCtot} from "./ctotService";
import {
    FplBroughtForwardMessage,
    FplDelayedMessge,
    FplMessage,
    FplMessages,
    FplMessageType,
    FplSlotMessage,
    FplStatusChangeMessage,
    isFplSlotCancelledMessage,
    isFplSlotMessage
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
            if (isFplSlotMessage(msg)) {
                setFplCtot(pipeline, msg.message.fplid, msg.message.ctot)
            } else if (isFplSlotCancelledMessage(msg)) {
                deleteFplCtot(pipeline, msg.message.fplid)
            }
            storeMessage(pipeline, msg)
            const room = this.io.to('' + msg.message.fplid)
            switch (msg.type) {
                case FplMessageType.fplan_status_changed:
                    const statusChangeMsg = (msg as FplStatusChangeMessage).message
                    room.emit('fplChange', {status: statusChangeMsg.status})
                    break;
                case FplMessageType.fplan_slot_allocated:
                case FplMessageType.fplan_slot_revised:
                    const slotMsg = (msg as FplSlotMessage).message
                    room.emit('fplChange', {ctot: slotMsg.ctot})
                    break;
                case FplMessageType.fplan_slot_cancelled:
                    room.emit('fplChange', {ctot: null})
                    break;
                case FplMessageType.fplan_delayed:
                    const delayMsg = (msg as FplDelayedMessge).message
                    room.emit('fplChange', {eobt: delayMsg.eobt})
                    break;
                case FplMessageType.fplan_broughtforward:
                    const bfMsg = (msg as FplBroughtForwardMessage).message
                    room.emit('fplRefiled', bfMsg.fplid)
                    break;
                default:
                    break;
            }
        })

        setLastUpdated(pipeline, Math.max(...messages.map(m => m.timestamp)))

        await pipeline.exec()
        await ackMessages(messages.map((m: FplMessage) => m.id))
        return messages.length
    }
}

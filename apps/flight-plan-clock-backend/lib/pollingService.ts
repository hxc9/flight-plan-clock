import {Socket} from "socket.io";
import {ackMessages, fetchMessages} from "./apiClient";
import {redis} from "./dbClient";
import {deleteFplCtot, setFplCtot} from "./ctotService";
import {FplMessage, FplMessages, isFplSlotCancelledMessage, isFplSlotMessage} from "autorouter-dto";
import {storeMessage} from "./messageService";
import {setLastUpdated} from "./lastUpdateService";

let subscribers : Socket[] = []
let timerId : NodeJS.Timeout|undefined

let running = false

async function poll() {
    try {
        const foundMessages = await pollMessages(30)
        if (foundMessages) {
            console.log("Notifying of new messages...")
            subscribers.forEach(socket => socket.emit("new-messages"))
        }
    } catch (e) {
        console.error(e)
    }
    if (running) {
        timerId = setTimeout(poll, 5000)
    }
}

export const PollingService : IPollingService = {
    subscribe: (socket: Socket) => {
        subscribers.push(socket)
        if (subscribers.length > 0 && !running) {
            running = true
            timerId = setTimeout(poll, 0)
            console.log("Polling started")
        }
    },
    unsubscribe: (socket: Socket) => {
        subscribers = subscribers.filter(v => v !== socket)
        if (subscribers.length === 0) {
            timerId && clearTimeout(timerId)
            running = false
            console.log("Polling stopped")
        }
    },
}

interface IPollingService {
    subscribe: (socket: Socket) => void
    unsubscribe: (socket: Socket) => void
}

const batchSize = 30

export async function pollMessages(timeout: number) : Promise<boolean> {
    let messageCount
    let totalMessages = 0

    do {
        messageCount = await processMessages(batchSize, timeout)
        totalMessages += messageCount
        timeout = 0
    } while (messageCount === batchSize)

    totalMessages += await processMessages(batchSize, 1)

    return totalMessages > 0
}

async function processMessages(count: number, timeout: number=0) {
    let messages : FplMessages = await fetchMessages(count, timeout)
    if (messages.length === 0) {
        return 0
    }

    const pipeline = redis.pipeline()

    messages.forEach((msg : FplMessage) => {
        if (isFplSlotMessage(msg)) {
            setFplCtot(pipeline, msg.message.fplid, msg.message.ctot)
        } else if (isFplSlotCancelledMessage(msg)) {
            deleteFplCtot(pipeline, msg.message.fplid)
        }
        storeMessage(pipeline, msg)
    })

    setLastUpdated(pipeline, Math.max(...messages.map(m => m.timestamp)))

    await pipeline.exec()
    await ackMessages(messages.map((m : FplMessage) => m.id))
    return messages.length
}
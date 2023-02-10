import {FlightPlanFull, UpdateMessage, WsMessage} from "flight-plan-clock-dto";
import {Server, Socket} from "socket.io";
import {ackMessages, fetchFlightPlan, fetchMessages} from "./apiClient";
import {redis} from "./dbClient";
import {deleteFplCtot, getFplCtot, setFplCtot} from "./ctotService";
import {
    FplMessage,
    fplMessageIs,
    FplMessages,
} from "autorouter-dto"
import {overviewRefreshRequired, storeMessage} from "./messageService";
import {getLastUpdated, setLastUpdated} from "./lastUpdateService";
import {parseRoute} from "./routeService";
import throttle from "lodash/throttle";
import {clearImmediate} from "timers";
import { flightPlanToMini } from './utils';

const batchSize = 30

export class PollingService {
    private io: Server
    private subscribers: Socket[] = []
    private timerId: NodeJS.Immediate | undefined
    private running = false

    constructor(io: Server) {
        this.io = io
    }

    private watchedFlightPlans : {[key: string] : number} = {}

    start() {
        this.io.on('connection',  socket => {
            this.subscribe(socket)
            socket.on('watch-flightPlan', async (id: number) => {
                if (this.watchedFlightPlans[socket.id]) {
                    socket.leave('fpl:' + this.watchedFlightPlans[socket.id])
                }
                socket.join('fpl:' + id)
                this.watchedFlightPlans[socket.id] = id
                const fpl = await fetchFlightPlan(id)
                if (fpl) {
                    const msg : UpdateMessage = {
                        fplId: id,
                        timestamp: await getLastUpdated(),
                        update: {
                            ...flightPlanToMini(fpl),
                            ctot: (await getFplCtot(id))??undefined,
                            route: parseRoute(fpl)
                        }
                    }
                    socket.emit('fpl-change', msg)
                }
            })
            socket.on('unwatch-flightPlan', () => {
                if (this.watchedFlightPlans[socket.id]) {
                    socket.leave('fpl:' + this.watchedFlightPlans[socket.id])
                    delete this.watchedFlightPlans[socket.id]
                }
            })
            socket.on('disconnect', () => {
                this.unsubscribe(socket)
            })
        })
    }

    private subscribe(socket: Socket): void {
        this.subscribers.push(socket)
        if (this.subscribers.length > 0 && !this.running) {
            this.running = true
            this.timerId = setImmediate(this.poll.bind(this))
            console.log("Polling started")
        }
    }

    private unsubscribe(socket: Socket): void {
        this.subscribers = this.subscribers.filter(v => v !== socket)
        if (this.subscribers.length === 0) {
            this.timerId && clearImmediate(this.timerId)
            this.running = false
            console.log("Polling stopped")
        }
    }

    private notifyChanges = throttle(() => {
        this.io.emit("refresh-overview")
    }, 3_000)

    private async poll() {
        if (!this.running) {
            return
        }
        try {
            const [,refreshRequired] = await this.pollMessages(batchSize)
            if (refreshRequired) {
                this.notifyChanges()
            }
        } catch (e) {
            console.error(e)
        }
        if (this.running) {
            this.timerId = setImmediate(this.poll.bind(this))
        }
    }

    private async pollMessages(timeout: number) {
        let messageCount
        let totalMessages = 0
        let overviewRefreshRequired = false

        do {
            let refresh
            [messageCount, refresh] = await this.processMessages(batchSize, timeout)
            totalMessages += messageCount
            overviewRefreshRequired ||= refresh
            timeout = 0
        } while (messageCount === batchSize)

        return [totalMessages > 0, overviewRefreshRequired]
    }

    private async processMessages(count: number, timeout: number = 0) : Promise<[number, boolean]> {
        let messages: FplMessages = (await fetchMessages(count, timeout))??[]
        if (messages.length === 0) {
            return [0, false]
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
                this.relayUpdateMessage(msg, {ctot: null})
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
        return [messages.length, messages.some(msg => overviewRefreshRequired(msg))]
    }

    private relayFplMessage<T extends WsMessage>(type: string, msg: T) {
        this.io.to('fpl:' + msg.fplId).emit(type, msg)
    }

    private relayUpdateMessage(msg: FplMessage, payload: Partial<FlightPlanFull>) {
        this.relayFplMessage('fpl-change', { fplId: msg.message.fplid, timestamp: msg.timestamp, update: payload})
    }
}

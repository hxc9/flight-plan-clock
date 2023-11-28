import {getKnownUsers} from "./userService";
import {Socket} from "socket.io";
import AsyncLock from "async-lock";
import {io, SocketRequest} from "../index";
import {processMessages} from "./messageProcessingService";
import {clearTimeout} from "timers";
import {
    getFlightPlan
} from "autorouter-mock-services/dist/lib/flightPlanService";
import {UpdateMessage} from "flight-plan-clock-dto";
import {getLastUpdated} from "./lastUpdateService";
import {flightPlanToMini} from "./utils";
import {getFplCtot} from "./ctotService";
import {parseRoute} from "./routeService";

const lock = new AsyncLock()

export class OrchestratorService {
    private static instance: OrchestratorService
    private knownUsers: Map<number, UserState>

    private constructor(users: number[]) {
        console.log('Creating orchestrator service', users)
        this.knownUsers = new Map<number, UserState>(users.map(u =>
            [u, new UserState(u)] as [number, UserState])
        )
        io.on('connection', (socket: Socket) => {
            const userId = (socket.request as SocketRequest).user!!.uid
            if (userId) {
                this.connect(userId, socket)
            }
        })
    }

    static async getInstance() {
        if (this.instance) {
            return this.instance
        }
        await lock.acquire('orchestrator', async () => {
            if (this.instance) {
                return this.instance
            }
            const users = await getKnownUsers()
            this.instance = new OrchestratorService([...users])
        })
        return this.instance
    }

    public create(userId: number) {
        if (this.knownUsers.has(userId)) {
            return
        }
        this.knownUsers.set(userId, new UserState(userId))
    }

    delete(userId: number) {
        this.knownUsers.get(userId)?.destroy()
        this.knownUsers.delete(userId)
    }

    connect(userId: number, socket: Socket) {
        this.knownUsers.get(userId)?.connect(socket)
    }

    disconnect(userId: number, socket: Socket) {
        this.knownUsers.get(userId)?.disconnect(socket)
    }

    destroy() {
        this.knownUsers.forEach(u => u.destroy())
        this.knownUsers.clear()
    }
}

class UserState {
    uid: number
    connections = new Set<Socket>()
    pollingSettings: Readonly<PollingSettings> = slowPollingSettings
    timeoutId: NodeJS.Timeout | undefined
    stopping = false

    constructor(uid: number) {
        this.uid = uid
        this.enableSlowPolling()
        this.timeoutId = setTimeout(() => this.poll(), 0)
    }

    connect(socket: Socket) {
        this.connections.add(socket)
        this.enableFastPolling()
        socket.join('user:' + this.uid)
      console.log("joined room", 'user:' + this.uid)
        socket.on("watch-flightPlan", async (id: number, callback) => {
            [...socket.rooms].filter(room => room.startsWith('fpl:') && room != "fpl:" + id)
                .forEach(room => socket.leave(room))
            socket.join('fpl:' + id)
            const fpl = await getFlightPlan(this.uid, id)
            if (fpl) {
                const msg: UpdateMessage = {
                    fplId: id,
                    timestamp: await getLastUpdated(),
                    update: {
                        ...flightPlanToMini(fpl),
                        ctot: (await getFplCtot(id)) ?? undefined,
                        route: parseRoute(fpl)
                    }
                }
                callback(msg)
            }
        })
        socket.on("unwatch-flightPlan", (id: number) => {
            socket.leave('fpl:' + id)
        })
        socket.on('disconnect', () => {
            this.disconnect(socket)
        })
    }

    disconnect(socket: Socket) {
        this.connections.delete(socket)
        if (this.connections.size == 0) {
            this.enableSlowPolling()
        }
    }

    destroy() {
        this.stopping = true
        this.timeoutId && clearTimeout(this.timeoutId)
        this.connections.forEach(c => {
            c.emit("logout")
            c.disconnect(true)
        })
    }

    private async enableFastPolling() {
        console.log('enable fast polling', this.uid)
        this.timeoutId && clearTimeout(this.timeoutId)
        this.pollingSettings = fastPollingSettings
        this.timeoutId = setTimeout(() => this.poll(), 0)
    }

    private async enableSlowPolling() {
        console.log('enable slow polling', this.uid)
        this.pollingSettings = slowPollingSettings
    }

    private async poll() {
        let hasError: boolean = false
        try {
            await processMessages(this.uid, this.pollingSettings.timeout)
        } catch (e) {
            hasError = true
            console.error(e)
        }
        if (this.stopping) {
            this.timeoutId = setTimeout(() => this.poll(), hasError ? this.pollingSettings.intervalOnError : this.pollingSettings.interval)
        }
    }
}

type PollingSettings = {
    interval: number,
    intervalOnError: number,
    timeout: number
}

const slowPollingSettings: Readonly<PollingSettings> = {
    interval: 5 * 60 * 1000,
    intervalOnError: 5 * 60 * 1000,
    timeout: 0
}

const fastPollingSettings: Readonly<PollingSettings> = {
    interval: 0,
    intervalOnError: 60 * 1000,
    timeout: 60
}

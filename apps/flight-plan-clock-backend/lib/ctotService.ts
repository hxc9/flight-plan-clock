import {ChainableCommander} from "ioredis";
import {defaultExpiry, fplKey, redis} from "./dbClient";
import dayjs, {Dayjs} from "dayjs";

export async function getFplCtot(fplId: number): Promise<string | null> {
    return redis.get(ctotKey(fplId))
}

export function setFplCtot(pipeline: ChainableCommander, fplId: number, ctot: string) {
    let key = ctotKey(fplId);
    pipeline
        .setex(key, defaultExpiry, ctot)
}

export function deleteFplCtot(pipeline: ChainableCommander, fplId: number) {
    pipeline.del(ctotKey(fplId))
}

function ctotKey(fplId: number) {
    return `${fplKey(fplId)}:ctot`;
}

export function parseCtot(ctotString: string | null, eobt: number | Dayjs): Dayjs | null {
    if (!ctotString) {
        return null
    }

    const parsedCtot = /^(\d\d):?(\d\d)$/.exec(ctotString)
    if (!parsedCtot) {
        return null
    }
    const [, hours, minutes] = parsedCtot

    if (typeof eobt === 'number') {
        eobt = dayjs.unix(eobt).utc()
    }
    let ctot = eobt.hour(+hours).minute(+minutes)
    if (ctot.isBefore(eobt)) {
        ctot = ctot.add(1, 'day')
    }
    return ctot
}
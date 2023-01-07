import {ChainableCommander} from "ioredis";
import {defaultExpiry, fplKey, redis} from "./dbClient";

export async function getFplCtot(fplId: number) : Promise<string|null> {
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

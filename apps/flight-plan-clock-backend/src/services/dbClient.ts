// @ts-ignore
import Redis from "ioredis";

export const redis = new Redis(process.env.REDIS_URL as string)

export const schemaPrefix = "fplClock:"

export const defaultExpiry = 3_600 * 24 * 14;

export function fplKey(fplId: number) {
    return `${schemaPrefix}flightPlan:${fplId}`;
}

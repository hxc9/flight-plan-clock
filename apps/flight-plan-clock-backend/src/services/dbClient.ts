// @ts-ignore
import Redis from "ioredis";
import { REDIS_URL } from '../config';

export const redis = new Redis(REDIS_URL as string)

export const schemaPrefix = "fplClock:"

export const defaultExpiry = 3_600 * 24 * 14;

export function fplKey(fplId: number) {
    return `${schemaPrefix}flightPlan:${fplId}`;
}

export function userKey(userId: number) {
  return `${schemaPrefix}user:${userId}`;
}

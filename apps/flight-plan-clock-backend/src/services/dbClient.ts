// @ts-ignore
import * as IORedis from "ioredis";
import { REDIS_URL } from '../config';

export const redis = new IORedis.Redis(REDIS_URL as string)

export const schemaPrefix = "fplClock:"

export const defaultExpiry = 3_600 * 24 * 14;

export function fplKey(fplId: number) {
    return `${schemaPrefix}flightPlan:${fplId}`;
}

export function userKey(userId: number|string) {
  return `${schemaPrefix}user:${userId}`;
}

export function userSessionKey(userId: number|string) {
  return `${userKey(userId)}:session`
}

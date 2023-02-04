import {redis, schemaPrefix} from "./dbClient";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc"
import {ChainableCommander} from "ioredis";

dayjs.extend(utc)

export async function getLastUpdated() : Promise<number> {
    let res : string|number|null = await redis.get(lastUpdatedKey)
    if (!res) {
        res = dayjs().utc().unix()
        redis.set(lastUpdatedKey, res)
    }
    return +res
}

export function setLastUpdated(pipeline: ChainableCommander, lastUpdatedTimestamp: number) {
    pipeline.set(lastUpdatedKey, lastUpdatedTimestamp)
}

const lastUpdatedKey = `${schemaPrefix}lastUpdated`
import {
  allowedTransitionFrom,
  eobtCanBeChanged,
  FlightPlan,
  Status
} from 'autorouter-dto';
import dayjs from 'dayjs';

import { changeFlightPlanCtot, readFlightPlanCtot } from './ctotService';
import { generateFlightPlan } from './data/flightPlanData';
import {
  buildFplBroughtForwardMessage,
  buildFplCancelledMessage,
  buildFplDelayedMessage,
  buildFplDesuspendedMessage,
  buildFplFiledMessage,
  buildFplQueuedMessage,
  buildFplRejectedMessage,
  buildFplStatusChangeMessage,
  buildFplSuspendedMessage
} from './data/messageData';
import { redis } from './dbService';
import {
  FlightPlanNotFoundError,
  IllegalFlightPlanStatusTransition,
  IllegalStatusForEobtChange
} from './errors';
import { addMessage, deleteMessagesForFlightPlan } from './messageService';
import {
  ID, DbKeys
} from './dbKeys';

export async function listFlightPlans(userId: ID, showClosed: boolean): Promise<Array<FlightPlan>> {
  const res1 = await redis.lrange(DbKeys.fplListKey(userId), 0, -1);
  if (res1.length === 0) return [];
  const res2 = await redis.json_mget(res1.map((key) => DbKeys.fplKey(userId, key)), '$');
  return (<Array<Array<FlightPlan>> | null>res2)
    ?.map((v) => v[0])
    .filter(fpl => showClosed || (fpl.status !== Status.Closed && fpl.status !== Status.Cancelled)) ?? [];
}

export async function getFlightPlan(userId: ID, fplId: number): Promise<FlightPlan | undefined> {
  const [data] = <[FlightPlan] | null>await redis.json_get(DbKeys.fplKey(userId, fplId), '$') ?? [];
  return data;
}

async function nextFlightPlanId() {
  return redis.incr(DbKeys.lastFplId);
}

export async function createFlightPlan(userId: ID, fplId?: number, template?: FlightPlan): Promise<number> {
  const uuid = fplId || await nextFlightPlanId();
  const res1 = await redis.json_set(DbKeys.fplKey(userId, uuid), '$', {
    ...(template || generateFlightPlan()),
    flightplanid: uuid
  });
  if (res1 !== 'OK') throw new Error('Cannot save to Redis: ' + res1);
  const res2 = await redis.lpush(DbKeys.fplListKey(userId), uuid);
  if (res2 === 0) throw new Error('Wrong return value when adding flight plan to index: ' + res2);
  return uuid;
}

export async function changeFlightPlanStatus(userId: ID, fplId: number, newStatus: Status) {
  const oldStatus = await getFplField(userId, fplId, 'status') as Status;
  if (!oldStatus) throw new FlightPlanNotFoundError();

  if (!allowedTransitionFrom(oldStatus, newStatus)) {
    throw new IllegalFlightPlanStatusTransition();
  }

  const transaction = redis.multi();

  await setFplField(userId, fplId, 'status', newStatus);
  await addMessage(userId, buildFplStatusChangeMessage(fplId, oldStatus, newStatus), transaction);
  switch (newStatus) {
    case Status.Filed:
      oldStatus === Status.Created && await addMessage(userId, buildFplFiledMessage(fplId, false), transaction);
      oldStatus === Status.Suspended && await addMessage(userId, buildFplDesuspendedMessage(fplId), transaction);
      break;
    case Status.ManualCorrection:
      await addMessage(userId, buildFplFiledMessage(fplId, false), transaction);
      await addMessage(userId, buildFplQueuedMessage(fplId, false), transaction);
      break;
    case Status.Rejected:
      await addMessage(userId, buildFplRejectedMessage(fplId), transaction);
      break;
    case Status.Suspended:
      await addMessage(userId, buildFplSuspendedMessage(fplId), transaction);
      break;
    case Status.Cancelled:
      await addMessage(userId, buildFplCancelledMessage(fplId), transaction);
      break;
    default:
      break;
  }
  await transaction.exec();
}

export async function changeFlightPlanEobt(userId: ID, fplId: number, newEobt: number) {
  const existingFlightPlan = await getFlightPlan(userId, fplId);
  if (!existingFlightPlan) {
    throw new FlightPlanNotFoundError();
  }
  if (!eobtCanBeChanged(existingFlightPlan.status)) {
    throw new IllegalStatusForEobtChange();
  }

  const oldEobt = existingFlightPlan?.eobt;

  const transaction = redis.multi();

  if (oldEobt < newEobt) {
    // Delay
    await setFplField(userId, fplId, 'eobt', newEobt);
    await addMessage(userId, buildFplDelayedMessage(fplId, newEobt, oldEobt), transaction);
    const ctot = await readFlightPlanCtot(userId, fplId);
    if (ctot && dayjs.unix(newEobt).utc().isSameOrAfter(ctot)) {
      await changeFlightPlanCtot(userId, fplId, null, transaction);
    }
  } else {
    // Bring forward
    // 1. Cancel old flight plan
    await setFplField(userId, fplId, 'status', Status.Cancelled);
    await addMessage(userId, buildFplStatusChangeMessage(fplId, existingFlightPlan.status, Status.Cancelled), transaction);
    await addMessage(userId, buildFplCancelledMessage(fplId, true), transaction);

    // 2. Refile with new EOBT
    const newFplId = await nextFlightPlanId();
    await createFlightPlan(userId, newFplId, { ...existingFlightPlan, eobt: newEobt });
    await addMessage(userId, buildFplStatusChangeMessage(newFplId, Status.Created, existingFlightPlan.status), transaction);
    await addMessage(userId, buildFplFiledMessage(newFplId, true), transaction);
    if (existingFlightPlan.status === Status.ManualCorrection) {
      await addMessage(userId, buildFplQueuedMessage(newFplId, true), transaction);
    }
    await addMessage(userId, buildFplBroughtForwardMessage(newFplId, newEobt, fplId, oldEobt), transaction);
  }
  await transaction.exec();
}

export async function deleteFlightPlan(userId: ID, fplId: number) {
  // delete messages
  await deleteMessagesForFlightPlan(userId, fplId);

  // delete CTOT
  redis.del(DbKeys.fplCtotKey(userId, fplId));

  // delete flight plans
  await redis.lrem(DbKeys.fplListKey(userId), 0, fplId);
  const res1 = await redis.del(DbKeys.fplKey(userId, fplId));
  if (res1 === 0) throw new FlightPlanNotFoundError();
}

async function getFplField<T>(userId: ID, fplId: number, field: string): Promise<T | undefined> {
  const [result] = (<[T] | null>await redis.json_get(DbKeys.fplKey(userId, fplId), `$.${field}`))??[];
  return result;
}

async function setFplField<T>(userId: ID, fplId: number, field: string, value: T) {
  const res = await redis.json_set(DbKeys.fplKey(userId, fplId), '$.' + field, value, 'XX');

  if (res !== 'OK') throw new FlightPlanNotFoundError();
}


import {ackMessages, fetchMessages} from "./apiClient";
import {FplMessage, fplMessageIs, FplMessages} from "autorouter-dto";
import {redis} from "./dbClient";
import {deleteFplCtot, setFplCtot} from "./ctotService";
import {overviewRefreshRequired, storeMessage} from "./messageService";
import {setLastUpdated} from "./lastUpdateService";
import {FlightPlanFull, WsMessage} from "flight-plan-clock-dto";
import {io} from "../index";

const batchSize = 30

export async function processMessages(userId: number, timeout: number = 0, count: number = batchSize) {
  console.log("Entering message processing loop", 'user:' + userId)
  let messageCount
  let totalMessages = 0
  let overviewRefreshRequired = false

  do {
    let refresh
    [messageCount, refresh] = await pollMessages(userId, count, timeout)
    totalMessages += messageCount
    overviewRefreshRequired ||= refresh
    timeout = 0
  } while (messageCount === batchSize)

  console.log("Processed " + totalMessages + " messages")
  if (overviewRefreshRequired) {
    console.log("Overview refresh required", 'user:' + userId)
    io.to('user:' + userId).emit('refresh-overview')
  }
}

async function pollMessages(userId: number, count: number, timeout: number = 0) : Promise<[number, boolean]> {
  let messages: FplMessages = (await fetchMessages(userId, count, timeout))??[]
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
      relayUpdateMessage(msg, {status: msg.message.status})
    } else if (fplMessageIs.slot(msg)) {
      relayUpdateMessage(msg, {ctot: msg.message.ctot})
    } else if (fplMessageIs.slotCancelled(msg)) {
      relayUpdateMessage(msg, {ctot: null})
    } else if (fplMessageIs.delayed(msg)) {
      relayUpdateMessage(msg, {eobt: msg.message.eobt})
    } else if (fplMessageIs.broughtForward(msg)) {
      relayFplMessage('fpl-refiled-' + msg.message.previous_fplid, {
        fplId: msg.message.previous_fplid,
        timestamp: msg.timestamp,
        refiledAs: msg.message.fplid})
    }
  })

  setLastUpdated(pipeline, Math.max(...messages.map(m => m.timestamp)))

  await pipeline.exec()
  await ackMessages(userId, messages.map((m: FplMessage) => m.id))
  return [messages.length, messages.some(msg => overviewRefreshRequired(msg))]
}

function relayFplMessage<T extends WsMessage>(type: string, msg: T) {
  io.to('fpl:' + msg.fplId).emit(type, msg)
}

function relayUpdateMessage(msg: FplMessage, payload: Partial<FlightPlanFull>) {
  const fplId = msg.message.fplid;
  relayFplMessage('fpl-change-' + fplId, { fplId, timestamp: msg.timestamp, update: payload})
}

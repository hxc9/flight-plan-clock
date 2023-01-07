import type { NextApiRequest, NextApiResponse } from 'next'
import {ackMessages, fetchMessages} from "../../lib/apiClient";
import { FplSlotMessage} from "autorouter-dto";
import {deleteFplCtot, setFplCtot} from "../../lib/ctotService";
import {redis} from "../../lib/dbClient";
import {storeMessage} from "../../lib/messageService";

const batchSize = 30

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }

  let messageCount
  let totalMessages = 0
  let timeout = 15

  do {
    messageCount = await processMessages(batchSize, timeout)
    totalMessages += messageCount
    timeout = 0
  } while (messageCount === batchSize)

  totalMessages += await processMessages(batchSize, 1)

  res.status(200).json(totalMessages !== 0)
}

async function processMessages(count: number, timeout: number=0) {
  let messages = await fetchMessages(count, timeout)
  if (messages.length === 0) {
    return 0
  }

  const pipeline = redis.pipeline()

  messages.forEach((msg) => {
    if (msg.type === 'fplan_slot_revised' || msg.type === 'fplan_slot_allocated') {
      setFplCtot(pipeline, msg.message.fplid, (msg.message as FplSlotMessage).ctot)
    } else if (msg.type === 'fplan_slot_cancelled') {
      deleteFplCtot(pipeline, msg.message.fplid)
    }
    storeMessage(pipeline, msg)
  })

  await pipeline.exec()
  await ackMessages(messages.map((m) => m.id))
  return messages.length
}
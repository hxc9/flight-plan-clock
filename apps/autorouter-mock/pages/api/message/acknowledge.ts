import type { NextApiRequest, NextApiResponse } from 'next'

import {acknowledgeMessages} from "../../../lib/server/messageStreamService";


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { body, method} = req

    if (method === 'POST') {
        if (body && body.length > 0) {
            await acknowledgeMessages(body)
            res.status(200).end()
        } else {
            res.status(400).end()
        }
    } else {
        res.status(405).end()
    }
}

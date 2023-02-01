import type { NextApiRequest, NextApiResponse } from 'next'

import {acknowledgeMessages} from "../../../../lib/server/messageStreamService";


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { query: {id}, method} = req

    if (method === 'POST') {
        if (id) {
            await acknowledgeMessages(+id)
            res.status(200).end()
        } else {
            res.status(400).end()
        }
    } else {
        res.status(405).end()
    }
}

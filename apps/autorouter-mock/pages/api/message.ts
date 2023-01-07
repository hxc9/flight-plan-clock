import type { NextApiRequest, NextApiResponse } from 'next'

import {readMessages} from "../../lib/server/messageStreamService";


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { query: {limit= "10", timeout="30"}, method} = req

    if (method === 'GET') {
        res.status(200).json(await readMessages((+limit), (+timeout)))
    } else {
        res.status(405).end()
    }
}

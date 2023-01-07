import type { NextApiRequest, NextApiResponse } from 'next'

import {countMessages} from "../../../lib/server/messageStreamService";


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const {method} = req

    if (method === 'GET') {
        res.status(200).json(await countMessages())
    } else {
        res.status(405).end()
    }
}

import type { NextApiRequest, NextApiResponse } from 'next'

import {readMessages} from "../../lib/server/messageStreamService";
import {FplMessages} from "autorouter-dto";


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<FplMessages>
) {
    const { query: {limit= "10", timeout="30"}, method} = req

    if (method === 'GET') {
        res.status(200).json(await readMessages((+limit), (+timeout)))
    } else {
        res.status(405).end()
    }
}

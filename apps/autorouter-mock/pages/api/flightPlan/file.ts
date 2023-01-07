import type { NextApiRequest, NextApiResponse } from 'next'

import {listFlightPlans} from "../../../lib/server/flightPlanService";


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        res.status(405).end()
        return
    }

    let data = await listFlightPlans()

    res.status(200).json(data)
}

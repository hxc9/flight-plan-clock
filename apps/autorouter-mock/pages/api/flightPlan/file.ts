import type { NextApiRequest, NextApiResponse } from 'next'

import {listFlightPlans} from "../../../lib/server/flightPlanService";
import {FlightPlan} from "autorouter-dto/dist";


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<FlightPlan[]>
) {
    if (req.method !== 'GET') {
        res.status(405).end()
        return
    }

    let data = await listFlightPlans()

    res.status(200).json(data)
}

import type { NextApiRequest, NextApiResponse } from 'next'

import {listFlightPlans} from "../../../lib/server/flightPlanService";
import {FlightPlansResult} from "autorouter-dto";


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<FlightPlansResult>
) {
    const {method, query: {sidx}} = req
    if (method !== 'GET') {
        res.status(405).end()
        return
    }

    let data = await listFlightPlans()

    if (sidx === 'eobt') {
        data.sort((a, b) => a.eobt - b.eobt)
    }

    res.status(200).json({total: data.length, rows: data})
}

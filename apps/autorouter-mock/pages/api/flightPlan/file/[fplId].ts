import type { NextApiRequest, NextApiResponse } from 'next'
import {getFlightPlan} from "../../../../lib/server/flightPlanService";
import {FlightPlan} from "autorouter-dto/dist";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<FlightPlan>
) {
    const {method, query: {fplId}} = req

    if (method !== 'GET') {
        res.status(405).end()
        return
    }

    if (!fplId) {
        res.status(400).end()
        return
    }

    let data = await getFlightPlan(+fplId)

    if (!data) {
        res.status(404).end()
        return
    }

    res.status(200).json(data)
}

import type { NextApiRequest, NextApiResponse } from 'next'

import {createFlightPlan} from "../../../lib/server/flightPlanService";


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "PUT") {
        try {
            await createFlightPlan()
            res.status(200).end()
        } catch (e) {
            console.error(e)
            res.status(500).end()
        }
    } else {
        res.status(405).end()
    }
}

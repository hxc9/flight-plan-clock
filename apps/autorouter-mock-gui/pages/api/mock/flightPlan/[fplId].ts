import type {NextApiRequest, NextApiResponse} from 'next'

import {
    ctotService, FlightPlanNotFoundError, flightPlanService
} from 'autorouter-mock-services';


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const {query: {fplId: fplIdStr}, method, body: {newStatus, newEobt, newCtot}} = req

    if (!fplIdStr) {
        res.status(404).end()
        return
    }

    const fplId: number = +fplIdStr

    try {
        if (method === "DELETE") {
            await flightPlanService.deleteFlightPlan(fplId)
            res.status(200).end()
        } else if (method === "POST") {
            if (newStatus) {
                await flightPlanService.changeFlightPlanStatus(fplId, newStatus)
            }
            if (newEobt) {
                await flightPlanService.changeFlightPlanEobt(fplId, newEobt)
            }
            if (newCtot !== undefined) {
                await ctotService.changeFlightPlanCtot(fplId, newCtot)
            }
            res.status(200).end()
        } else {
            res.status(405).end()
        }
    } catch (e) {
        if (e instanceof FlightPlanNotFoundError) {
            res.status(404).end()
        } else {
            console.log(e)
            res.status(500).end()
        }
    }
}

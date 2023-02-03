import {FlightPlanResponse} from "flight-plan-clock-dto";
import {NextApiRequest, NextApiResponse} from "next";
import { FlightPlan} from "autorouter-dto";
import {runCorsMiddleware} from "../../../lib/middleware/cors";
import {flightPlanToMini} from "../../../lib/apiClient";
import {runSocketInitMiddleware} from "../../../lib/middleware/socketInit";
import {getLastUpdated} from "../../../lib/lastUpdateService";
import {getFplCtot} from "../../../lib/ctotService";
import {parseRoute} from "../../../lib/routeService";


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<FlightPlanResponse>
) {
    await runCorsMiddleware(req, res)
    await runSocketInitMiddleware(req, res)

    const {method, query: {fplId}} = req

    if (method !== 'GET') {
        res.status(405).end()
        return
    }

    if (!fplId) {
        res.status(404).end()
        return
    }

    let url = process.env.AUTOROUTER_API_URL + '/flightPlan/file/' + fplId;
    let apiResponse
    try {
        apiResponse = await fetch(url, {next: {revalidate: 10}})
    } catch (e) {
        console.error(`Cannot fetch flight plan (${url})`, e)
        res.status(500).end()
        return
    }

    if (apiResponse && !apiResponse.ok) {
        console.error("Cannot fetch flight plans: " + apiResponse.status + ' ' + await apiResponse.text())
        res.status(500).end()
        return
    }

    const fpl: FlightPlan = await apiResponse.json()

    res.status(200).json({
        flightPlan: {...flightPlanToMini(fpl), ctot: await getFplCtot(+fplId), route: parseRoute(fpl)},
        lastUpdated: await getLastUpdated()
    })
}

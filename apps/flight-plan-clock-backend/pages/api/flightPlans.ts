import {FlightPlanMini, FlightPlansResponse} from "flight-plan-clock-dto";
import {NextApiRequest, NextApiResponse} from "next";
import {FlightPlan, FlightPlansResult} from "autorouter-dto";
import uniqBy from "lodash/uniqBy"
import {getLastUpdated} from "../../lib/lastUpdateService";
import { runCorsMiddleware } from "../../lib/middleware/cors";
import {flightPlanToMini} from "../../lib/apiClient";
import {runSocketInitMiddleware} from "../../lib/middleware/socketInit";


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<FlightPlansResponse>
) {
    await runCorsMiddleware(req, res)
    await runSocketInitMiddleware(req, res)

    const flightPlans = []
    let total = 0
    let rows: FlightPlan[]

    do {
        let url = process.env.AUTOROUTER_API_URL + '/flightPlan/file?'
            + new URLSearchParams({
                offset: flightPlans.length.toString(),
                sidx: 'eobt'
            });
        let apiResponse
        let error = false
        try {
            apiResponse = await fetch(url, {next: {revalidate: 10}})
        } catch (e) {
            console.error(`Cannot fetch flight plans (${url})`, e)
            error = true
            if (flightPlans.length === 0) {
                res.status(500).end()
                return
            } else {
                continue
            }
        }

        if (!apiResponse.ok) {
            console.error("Cannot fetch flight plans: " + apiResponse.status + ' ' + await apiResponse.text())
            error = true
        }

        if (error) {
            if (flightPlans.length === 0) {
                res.status(500).end()
                return
            } else {
                continue
            }
        }

        ({total, rows} = (await apiResponse.json()) as FlightPlansResult)

        flightPlans.push(...rows)
    } while (total > flightPlans.length)

    const data: FlightPlanMini[] = uniqBy(flightPlans, fpl => fpl.flightplanid).map(flightPlanToMini)

    res.status(200).json({flightPlans: data, lastUpdated: await getLastUpdated()})
}

import {NextApiRequest, NextApiResponse} from "next";
import {FlightPlan, FlightPlansResult, FlightPlanMini, FlightPlansResponse} from "autorouter-dto";
import uniqBy from "lodash/uniqBy"
import Cors from 'cors'
import {getLastUpdated} from "../../lib/lastUpdateService";

// Initializing the cors middleware
// You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
const cors = Cors({})

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(
    req: NextApiRequest,
    res: NextApiResponse,
    fn: Function
) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result: any) => {
            if (result instanceof Error) {
                return reject(result)
            }

            return resolve(result)
        })
    })
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<FlightPlansResponse>
) {
    await runMiddleware(req, res, cors)

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

    const data: FlightPlanMini[] = uniqBy(flightPlans, fpl => fpl.flightplanid).map(({
                                                                                         flightplanid,
                                                                                         callsign,
                                                                                         eobt,
                                                                                         departure,
                                                                                         destination,
                                                                                         status
                                                                                     }) => {
        return {
            id: flightplanid,
            callSign: callsign,
            eobt,
            departure,
            destination,
            status
        }
    })

    res.status(200).json({flightPlans: data, lastUpdated: await getLastUpdated()})
}

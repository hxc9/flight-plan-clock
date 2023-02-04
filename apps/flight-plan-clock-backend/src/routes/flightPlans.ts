import { FlightPlan, FlightPlansResult } from 'autorouter-dto';
import express, { Request, Response, Router } from 'express';
import { FlightPlanMini, FlightPlansResponse } from 'flight-plan-clock-dto';
import uniqBy from 'lodash/uniqBy';
import fetch from 'node-fetch';
import { getFplCtot } from '../services/ctotService';
import { getLastUpdated } from '../services/lastUpdateService';
import { parseRoute } from '../services/routeService';
import { flightPlanToMini } from '../services/utils';

const router : Router = express.Router()

router.get('/', async (req: Request, res: Response<FlightPlansResponse>) => {
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
      apiResponse = await fetch(url)
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

    ({total, rows} = <FlightPlansResult>await apiResponse.json())

    flightPlans.push(...rows)
  } while (total > flightPlans.length)

  const data: FlightPlanMini[] = uniqBy(flightPlans, fpl => fpl.flightplanid).map(flightPlanToMini)

  res.status(200).json({flightPlans: data, lastUpdated: await getLastUpdated()})
})

router.get("/:fplId", async (req: Request, res: Response) => {
  const { params: {fplId}} = req

  if (!fplId) {
    res.status(404).end()
    return
  }

  let url = process.env.AUTOROUTER_API_URL + '/flightPlan/file/' + fplId;
  let apiResponse
  try {
    apiResponse = await fetch(url)
  } catch (e) {
    console.error(`Cannot fetch flight plan (${url})`, e)
    res.status(500).end()
    return
  }

  if (apiResponse && !apiResponse.ok) {
    console.error("Cannot fetch flight plans: " + apiResponse.status + ' ' + await apiResponse.text())
    res.status(apiResponse.status === 404 ? 404 : 500).end()
    return
  }

  const fpl: FlightPlan = await apiResponse.json()

  res.status(200).json({
    flightPlan: {...flightPlanToMini(fpl), ctot: await getFplCtot(+fplId), route: parseRoute(fpl)},
    lastUpdated: await getLastUpdated()
  })
})

export default router

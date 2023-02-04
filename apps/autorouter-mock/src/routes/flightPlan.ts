import { FlightPlan, FlightPlansResult } from 'autorouter-dto';
import express, { Request, Response, Router } from 'express';
import { flightPlanService } from "autorouter-mock-services"

const router : Router = express.Router()

router.get('/file', async (req: Request, res: Response<FlightPlansResult>) => {
  const {query: {sidx, showclosed}} = req

  const data = await flightPlanService.listFlightPlans(showclosed === 'yes')

  if (sidx === 'eobt') {
    [...data].sort((a, b) => a.eobt - b.eobt)
  }

  res.status(200).json({total: data.length, rows: data})
})
router.get('/file/:fplId', async (req: Request, res: Response<FlightPlan>) => {
  const {params: {fplId}} = req


  if (!fplId) {
    res.status(400).end()
    return
  }

  const data = await flightPlanService.getFlightPlan(+fplId)

  if (!data) {
    res.status(404).end()
    return
  }

  res.status(200).json(data)
})

export default router

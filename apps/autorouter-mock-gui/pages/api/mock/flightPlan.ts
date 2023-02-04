import type { NextApiRequest, NextApiResponse } from 'next';

import { flightPlanService } from 'autorouter-mock-services';


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'PUT') {
    try {
      await flightPlanService.createFlightPlan();
      res.status(200).end();
    } catch (e) {
      console.error(e);
      res.status(500).end();
    }
  } else {
    res.status(405).end();
  }
}

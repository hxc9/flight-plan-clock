import express, {Router} from "express";
import fetch from "node-fetch";
import {getMetar} from "../services/metarService";

const router : Router = express.Router()

router.get('/:icaoCode', async (req, res) => {
  const { params: {icaoCode}} = req

  if (!icaoCode) {
    res.status(404).end()
    return
  }

  const metar = await getMetar(icaoCode)

  if (metar) {
    res.status(200).json(metar)
  } else {
    res.status(204).send()
  }
})

export default router

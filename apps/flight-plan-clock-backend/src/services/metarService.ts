import fetch from "node-fetch";
import {redis, schemaPrefix} from "./dbClient";

async function fetchMetar(icaoCode: string) {
  const url = `https://aviationweather.gov/cgi-bin/data/metar.php?ids=${icaoCode}&format=raw&taf=false`
  const apiResponse = await fetch(url)

  if (!apiResponse.ok) {
    console.error("Cannot fetch METAR: " + apiResponse.status + ' ' + await apiResponse.text())
    return
  }

  const res =  (await apiResponse.text()) || "N/A"

  await redis.setex(metarKey(icaoCode), 5 * 60, res)

  return res
}

export async function getMetar(icaoCode: string) {
  let res : string | null | undefined = await redis.get(metarKey(icaoCode))

  if (!res)
    res = await fetchMetar(icaoCode)

  return res === "N/A" ? null : res
}

function metarKey(icaoCode: string) {
  return `${schemaPrefix}metar:${icaoCode}`
}

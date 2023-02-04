import { FlightPlan, FlightPlansResult, FplMessages } from 'autorouter-dto';
import fetch, { RequestInit } from 'node-fetch';

export async function fetchFlightPlans(): Promise<FlightPlan[]> {
    return (await fetchFromAutoRouterWithBody<FlightPlansResult>('/flightPlan/file'))?.rows
}

export async function fetchFlightPlan(id: number): Promise<FlightPlan | null> {
    return await fetchFromAutoRouterWithBody('/flightPlan/file/' + id)
}

export async function fetchMessages(limit: number, timeout: number): Promise<FplMessages> {
    return await fetchFromAutoRouterWithBody(`/message?timeout=${timeout}&limit=${limit}`)
}

export async function ackMessages(keys: number[]) {
    return await fetchFromAutoRouter('/message/acknowledge', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(keys)
    })
}

async function fetchFromAutoRouter(uri: string, init?: RequestInit | undefined) {
    const res = await fetch(process.env.AUTOROUTER_API_URL + uri, init)

    if (!res.ok) {
      throw new Error("Unable to fetch flight plans: " + res.status + ' ' + res.url)
    }
}

async function fetchFromAutoRouterWithBody<T>(uri: string, init?: RequestInit | undefined) : Promise<T | null> {
  const res = await fetch(process.env.AUTOROUTER_API_URL + uri, init)

  if (!res.ok) {
    if (res.status === 404) {
      return null
    }
    throw new Error("Unable to fetch flight plans: " + res.status + ' ' + res.url)
  }

    return <T>await res.json()
}

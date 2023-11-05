import { FlightPlan, FlightPlansResult, FplMessages } from 'autorouter-dto';
import fetch, { RequestInit } from 'node-fetch';
import { AUTOROUTER_API_URL } from '../config';

export async function fetchFlightPlans(): Promise<FlightPlan[]|undefined> {
    return (await fetchFromAutoRouterWithBody<FlightPlansResult>('/flightPlan/file'))?.rows
}

export async function fetchFlightPlan(id: number): Promise<FlightPlan | undefined> {
    return await fetchFromAutoRouterWithBody<FlightPlan>('/flightPlan/file/' + id)
}

export async function fetchMessages(limit: number, timeout: number): Promise<FplMessages|undefined> {
    return await fetchFromAutoRouterWithBody<FplMessages>(`/message?timeout=${timeout}&limit=${limit}`)
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

export async function getUser() {
    return await fetchFromAutoRouterWithBody<any>('/user')
}

async function fetchFromAutoRouter(uri: string, init?: RequestInit | undefined) {
    const res = await fetch(AUTOROUTER_API_URL + uri, init)

    if (!res.ok) {
      throw new Error("Unable to fetch flight plans: " + res.status + ' ' + res.url)
    }
}

async function fetchFromAutoRouterWithBody<T>(uri: string, init?: RequestInit | undefined) : Promise<T | undefined> {
  const res = await fetch(AUTOROUTER_API_URL + uri, init)

  if (!res.ok) {
    if (res.status === 404) {
      return
    }
    throw new Error("Unable to fetch flight plans: " + res.status + ' ' + res.url)
  }

    return <T>await res.json()
}

import { FlightPlan, FlightPlansResult, FplMessages } from 'autorouter-dto';
import fetch, { RequestInit } from 'node-fetch';
import { AUTOROUTER_API_URL } from '../config';
import {getAccessToken, logoutUser} from "./userService";

export async function fetchFlightPlans(userId: number): Promise<FlightPlan[]|undefined> {
    return (await fetchFromAutoRouterWithBody<FlightPlansResult>('/flightPlan/file', userId))?.rows
}

export async function fetchFlightPlan(userId: number, fplLd: number): Promise<FlightPlan | undefined> {
    return await fetchFromAutoRouterWithBody<FlightPlan>('/flightPlan/file/' + fplLd, userId)
}

export async function fetchMessages(userId: number, limit: number, timeout: number): Promise<FplMessages|undefined> {
    return await fetchFromAutoRouterWithBody<FplMessages>(`/message?timeout=${timeout}&limit=${limit}`, userId)
}

export async function ackMessages(userId: number, keys: number[]) {
    return await fetchFromAutoRouter('/message/acknowledge', userId, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(keys)
    })
}

export async function getUser(userId: number) {
    return await fetchFromAutoRouterWithBody<any>('/user', userId)
}

async function fetchFromAutoRouter(uri: string, userId: number, init?: RequestInit | undefined) {
  const authToken = await getAccessToken(userId)

  if (!authToken) {
    await logoutUser(userId, true)
    throw new Error("No available access token")
  }

    const res = await fetch(AUTOROUTER_API_URL + uri, init)

    if (!res.ok) {
      if (res.status === 401) {
        await logoutUser(userId, true)
      }
      throw new Error("Unable to fetch flight plans: " + res.status + ' ' + res.url)
    }
}

async function fetchFromAutoRouterWithBody<T>(uri: string, userId: number, init?: RequestInit | undefined) : Promise<T | undefined> {
  const authToken = await getAccessToken(userId)

  if (!authToken) {
    await logoutUser(userId, true)
    throw new Error("No available access token")
  }

  const res = await fetch(AUTOROUTER_API_URL + uri, {...init, headers: {...init?.headers, Authorization: 'Bearer ' + authToken}})

  if (!res.ok) {
    if (res.status === 401) {
      await logoutUser(userId, true)
      throw new Error("Not authorized")
    }
    if (res.status === 404) {
      return
    }
    throw new Error("Unable to fetch flight plans: " + res.status + ' ' + res.url)
  }

    return <T>await res.json()
}

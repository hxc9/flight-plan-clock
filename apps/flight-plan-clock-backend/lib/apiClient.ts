import {FlightPlan, FplMessages} from "autorouter-dto";

export async function fetchFlightPlans() : Promise<FlightPlan[]> {
    return await fetchFromAutoRouter('/flightPlan/file')
}

export async function fetchFlightPlan(id: number) : Promise<FlightPlan|null> {
    return await fetchFromAutoRouter('/flightPlan/file/' + id)
}

export async function fetchMessages(limit: number, timeout: number) : Promise<FplMessages> {
    return await fetchFromAutoRouter(`/message?timeout=${timeout}&limit=${limit}`)
}

export async function ackMessages(keys: number[]) {
    return await fetchFromAutoRouter('/message/acknowledge', {method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(keys)
    }, false)
}

async function fetchFromAutoRouter(uri: string, init?: RequestInit|undefined, withBody: boolean=true) {
    const res = await fetch(process.env.AUTOROUTER_API_URL + uri, {cache: 'no-store', ...init})

    if (!res.ok) {
        if (res.status === 404) {
            return null
        }
        throw new Error("Unable to fetch flight plans: " + res.status + ' ' + res.url)
    }

    if (withBody) {
        return await res.json()
    }
}
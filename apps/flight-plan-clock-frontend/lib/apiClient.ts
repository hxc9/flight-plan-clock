import useSWR from "swr";
import {FlightPlanResponse} from "flight-plan-clock-dto";

export async function fetchFromBackend<T>(uri: string, init?: RequestInit) : Promise<T|null> {
    const res = await fetch(process.env.BACKEND_URL + uri, init);

    // Recommendation: handle errors
    if (!res.ok) {
        if (res.status === 404) {
            return null
        }
        // This will activate the closest `error.js` Error Boundary
        throw new Error('Failed to fetch data: ' + res.status + ' ' + res.url);
    }

    return (await res.json()) as T;
}

async function fetcher(uri: string) {
    const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + uri);
    return await res.json();
}

export function useBackend<T>(uri: string) {
    return  useSWR<T>(uri, fetcher, { refreshInterval: 60_000 })
}

export function useFlightPlan(id: string) {
    const response = useBackend<FlightPlanResponse>(`/api/flightPlans/${id}`)
    return {...response, flightPlan: response?.data?.flightPlan}
}
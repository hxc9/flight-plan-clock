import useSWR from "swr";

export function useBackend<T>(uri: string | null) {
    return  useSWR<T>(uri, fetcher, { refreshInterval: 60_000 })
}

async function fetcher(uri: string) {
    const res = await fetch(backendUrl + uri, {credentials: "include"});
    if (!res.ok) {
        const error = Error("Unable to fetch flight plans: " + res.status + ' ' + res.url) as FetchError
        error['status'] = res.status
        throw error
    }
    return await res.json();
}

export const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL as string

type FetchError = Error & {status?: number}
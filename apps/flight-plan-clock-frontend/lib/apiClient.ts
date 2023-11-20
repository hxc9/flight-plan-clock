import useSWR from "swr";

export function useBackend<T>(uri: string | null) {
    return  useSWR<T>(uri, fetcher, { refreshInterval: 60_000 })
}

async function fetcher(uri: string) {
    const res = await fetch(backendUrl + uri, {credentials: "include"});
    return await res.json();
}

export const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL as string
export async function fetchFromBackend<T>(uri: string, init?: RequestInit) : Promise<T|null> {
    const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + uri, init);

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
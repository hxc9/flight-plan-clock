"use client"

import { FormEvent, useState, useTransition} from "react";
import {useRouter} from "next/navigation";

export const CreateFlightPlan = () : JSX.Element => {
    const router = useRouter();
    const [, startTransition] = useTransition();
    const [, setIsFetching] = useState(false);
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsFetching(true)
        await fetch(`/api/mock/flightPlan`,
            {method: 'PUT'})
        setIsFetching(false)
        startTransition(() => {
            router.refresh()
        })
    }

    return <form onSubmit={handleSubmit}>
        <input type="submit" value="Create flight plan"/>
    </form>
}
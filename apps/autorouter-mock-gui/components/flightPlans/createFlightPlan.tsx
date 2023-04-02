"use client"

import { fetchFromMock } from '@/components/flightPlans/utils';
import { FormEvent, useState, useTransition} from "react";
import {useRouter} from "next/navigation";

export const CreateFlightPlan = ({userId} : {userId: number}) : JSX.Element => {
    const router = useRouter();
    const [, startTransition] = useTransition();
    const [, setIsFetching] = useState(false);
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsFetching(true)
        await fetchFromMock(`/api/mock/${userId}/flightPlan`,
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
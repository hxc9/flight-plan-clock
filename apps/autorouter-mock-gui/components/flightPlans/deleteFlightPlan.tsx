"use client"

import { fetchFromMock } from '@/components/flightPlans/utils';
import { FormEvent, useState, useTransition} from "react";
import {useRouter} from "next/navigation";

export const DeleteFlightPlan = ({fplId} : {fplId: number}) : JSX.Element => {
    const router = useRouter();
    const [, startTransition] = useTransition();
    const [, setIsFetching] = useState(false);
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsFetching(true)
        await fetchFromMock(`/api/mock/flightPlan/${fplId}`,
            {method: 'DELETE'})
        setIsFetching(false)
        startTransition(() => {
            router.refresh()
        })
    }

    return <div>
        <form onSubmit={handleSubmit}>
        <input type="submit" value="Delete"/>
    </form>
    </div>
}
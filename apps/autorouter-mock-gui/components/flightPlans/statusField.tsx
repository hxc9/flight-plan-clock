"use client"

import { fetchFromMock } from '@/components/flightPlans/utils';
import {Status} from "autorouter-dto"
import { ChangeEvent, useEffect, useMemo, useState, useTransition } from 'react';
import {useRouter} from "next/navigation";
import {allTransitionsFrom} from "autorouter-dto";

export const StatusField = ({userId,
                                fplId,
                                currentStatus
                            }: { userId: number, fplId: number, currentStatus: Status }): JSX.Element => {
    const allowedTransitions = allTransitionsFrom(currentStatus)
    const allOptions = useMemo(() => [currentStatus, ...allowedTransitions], [currentStatus, allowedTransitions])

    const router = useRouter();
    const [, startTransition] = useTransition();
    const [, setIsFetching] = useState(false);
    const [selectedTransition, setTransition] = useState<Status>(allOptions[0])

    useEffect(() => {
        if (allowedTransitions.length === 0) {
            return
        }
        if (!allOptions.includes(selectedTransition)) {
            setTransition(allOptions[0])
        }
    }, [allowedTransitions, allOptions, selectedTransition])

    if (allowedTransitions.length === 0) {
        return <></>
    }

    const handleChange = async (event: ChangeEvent<HTMLSelectElement>) => {
        event.preventDefault()
        const newStatus = event.target.value as Status;
        setTransition(newStatus)
        setIsFetching(true)
        await fetchFromMock(`/api/mock/${userId}/flightPlan/${fplId}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    newStatus: newStatus
                })
            })
        setIsFetching(false)
        startTransition(() => {
            router.refresh()
        })
    }

    return <form>
        <select value={selectedTransition} onChange={handleChange}>
            {allOptions.map((status) => <option key={status}
                                                value={status}>{capitalize(status)}</option>)}
        </select>
    </form>
}

function capitalize(status: Status) {
    return status.charAt(0).toUpperCase() + status.slice(1)
}
"use client"

import {Status} from "autorouter-dto"
import {ChangeEvent, useEffect, useState, useTransition} from "react";
import {useRouter} from "next/navigation";
import {allTransitionsFrom} from "autorouter-dto";

export const StatusField = ({
                                fplId,
                                currentStatus: statusName
                            }: { fplId: number, currentStatus: string }): JSX.Element => {
    const currentStatus = statusName as Status
    const allowedTransitions = allTransitionsFrom(currentStatus)
    const allOptions = [currentStatus, ...allowedTransitions]

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
    }, [allowedTransitions])

    if (allowedTransitions.length === 0) {
        return <></>
    }

    const handleChange = async (event: ChangeEvent<HTMLSelectElement>) => {
        event.preventDefault()
        const newStatus = event.target.value as Status;
        setTransition(newStatus)
        setIsFetching(true)
        await fetch(`/api/mock/flightPlan/${fplId}`,
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
                                                value={status}>{status}</option>)}
        </select>
    </form>
}
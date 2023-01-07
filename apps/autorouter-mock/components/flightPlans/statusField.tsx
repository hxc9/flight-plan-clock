"use client"

import Status from "../../lib/status";
import {ChangeEvent, useEffect, useState, useTransition} from "react";
import {useRouter} from "next/navigation";

export const StatusField = ({
                                 fplId,
                                 currentStatus: statusName
                             }: { fplId: number, currentStatus: string }): JSX.Element => {
    const currentStatus = Status.fromString(statusName)
    const allowedTransitions = currentStatus.canTransitionTo()
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
        const newStatus = Status.fromString(event.target.value);
        setTransition(newStatus)
        setIsFetching(true)
        await fetch(`/api/mock/flightPlan/${fplId}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    newStatus: newStatus.name
                })
            })
        setIsFetching(false)
        startTransition(() => {
            router.refresh()
        })
    }

    return <form>
        <select value={selectedTransition?.name} onChange={handleChange}>
            {allOptions.map((status) => <option key={status.name}
                                                        value={status.name}>{status.name}</option>)}
        </select>
    </form>
}
"use client"

import {MouseEvent, useCallback, useEffect, useTransition} from "react";
import {useRouter} from "next/navigation";

import styles from './refreshGovernor.module.css'


export const RefreshGovernor = () : JSX.Element => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const refreshData = useCallback(() => {
        startTransition(() => { router.refresh() })
    }, [router])

    useEffect(() => {
        let timeout : any|null = null

        const poll = async () => {
            const res = await fetch('/api/poll', {method: "POST"})
            const hasNewMessages = await res.json()
            if (hasNewMessages) {
                refreshData()
            }
            timeout = setTimeout(poll, 5000)
        }
        timeout = setTimeout(poll, 0)

        return () => timeout && clearTimeout(timeout)
    }, [refreshData])

    useEffect(() => {
        const timerId = setInterval(refreshData, 60_000)
        return () => clearInterval(timerId)
    }, [refreshData])

    async function handleClick(event: MouseEvent<HTMLAnchorElement>){
        event.preventDefault()
        refreshData()
    }

    return <a href="#" onClick={handleClick}
              className={styles.refreshGovernor + (isPending ? ' ' + styles.pending : '')}>&#8635;</a>
}
"use client"

import {MouseEvent, useEffect, useTransition} from "react";
import {useRouter} from "next/navigation";

import styles from './refreshGovernor.module.css'


export const RefreshGovernor = () : JSX.Element => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();



    useEffect(() => {
        function refreshData() {
            startTransition(() => { router.refresh() })
        }
        const refreshId = setInterval(refreshData, 15_000)
        return () => {
            clearInterval(refreshId)
        }
    }, [router])

    async function handleClick(event: MouseEvent<HTMLAnchorElement>){
        event.preventDefault()

        startTransition(() => { router.refresh() })
    }

    return <a href="#" onClick={handleClick}
              className={styles.refreshGovernor + (isPending ? ' ' + styles.pending : '')}>&#8635;</a>
}
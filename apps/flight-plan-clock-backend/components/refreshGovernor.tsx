"use client"

import {MouseEvent, useCallback, useEffect, useTransition} from "react";
import {useRouter} from "next/navigation";
import io, {Socket} from "socket.io-client"

import styles from './refreshGovernor.module.css'

let socket : Socket

export const RefreshGovernor = () : JSX.Element => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const refreshData = useCallback(() => {
        startTransition(() => { router.refresh() })
    }, [router])

    async function socketInitializer() {
        await fetch('/api/socket')
        socket = io()

        socket.on('connect', () => {
            console.debug("connected")
            socket.on('new-messages', () => {
                console.debug("Got new messages!")
                refreshData()
            })
        })
    }

    useEffect( () => {
        socketInitializer().catch(console.error)
        return () => { socket && socket.disconnect() }
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
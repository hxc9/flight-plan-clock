"use client"

import {MouseEvent, useContext, useEffect, useTransition} from "react";
import {useRouter} from "next/navigation";

import styles from './refreshGovernor.module.css'
import {SocketContext} from "./socketContext";

export const RefreshGovernor = () : JSX.Element => {
    const router = useRouter();
    const socket = useContext(SocketContext)
    const [isPending, startTransition] = useTransition();

    function refreshData() {
        startTransition(() => {
            router.refresh()
        })
    }

    useEffect( () => {
        if (socket) {
            let newMessageListener = () => {
                console.log("Got message")
                refreshData()
            };
            console.log("Listening for messages...")
            socket.on('new-messages', newMessageListener)
            return () => { socket && socket.off('new-messages', newMessageListener) }
        }
    }, [socket])

    useEffect(() => {
        const timerId = setInterval(refreshData, 60_000)
        return () => clearInterval(timerId)
    }, [])

    async function handleClick(event: MouseEvent<HTMLAnchorElement>){
        event.preventDefault()
        refreshData()
    }

    return <a href="#" onClick={handleClick}
              className={styles.refreshGovernor + (isPending ? ' ' + styles.pending : '')}>&#8635;</a>
}
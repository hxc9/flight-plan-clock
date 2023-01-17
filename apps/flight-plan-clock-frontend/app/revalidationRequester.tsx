"use client"

import {useCallback, useContext, useEffect} from "react";
import {SocketContext} from "../components/socketContext";
import {useSWRConfig} from "swr";

export default function RevalidationRequester() {
    const {mutate} = useSWRConfig()

    const handler = useCallback(async () => {
        await mutate('/api/flightPlans')
    }, [mutate])

    const socket = useContext(SocketContext)

    useEffect(() => {
        if (socket) {
            socket.on("new-messages", handler)
        }
        return () => {socket && socket.off("new-messages", handler)}
    }, [socket, handler])

    return <></>
}
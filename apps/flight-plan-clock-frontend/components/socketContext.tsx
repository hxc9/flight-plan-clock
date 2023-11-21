"use client"

import { backendUrl } from "@/lib/apiClient";
import {Context, createContext, ReactNode, useEffect} from "react";
import {io, Socket} from "socket.io-client";
import { useSWRConfig } from "swr";

export const SocketContext : Context<Socket|undefined> = createContext<Socket|undefined>(undefined)

const socket = io(backendUrl, {autoConnect: false, withCredentials: true})

export default function SocketProvider({children} : {children : ReactNode}) {
    const {mutate} = useSWRConfig()
    useEffect(() => {
        async function initSocket() {
            !socket.connected && socket.connect()
        }
        initSocket().catch(console.error).then(() => console.debug("Socket initialized"))
        const invalidateData = () => {
            // noinspection JSIgnoredPromiseFromCall
            mutate('/api/flightPlans')
        }
        socket.on("refresh-overview", invalidateData)
        return () => {
            socket && socket.off("refresh-overview", invalidateData)
            socket && socket.close()
        }
    }, [mutate]);
    return <SocketContext.Provider value={socket}>
        {children}
    </SocketContext.Provider>
}
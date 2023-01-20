'use client'

import React, {createContext, useEffect } from "react";
import io, {Socket} from "socket.io-client";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL as string

export const SocketContext = createContext<Socket|undefined>(undefined)

const socket = io(backendUrl, {autoConnect: false})

export default function SocketProvider({children} : {children : React.ReactNode}) {
    useEffect(() => {
        async function initSocket() {
            if (!socket.connected) {
                await fetch(backendUrl + '/api/ping').catch(console.error)
                !socket.connected && socket.connect()
            }
            socket.on('connect', () => {
                console.debug("connected")
            })
        }
        initSocket().then(() => console.debug("Socket initialized"))
        return () => { socket && socket.close() }
    }, [])

    return <SocketContext.Provider value={socket}>
        {children}
    </SocketContext.Provider>
}
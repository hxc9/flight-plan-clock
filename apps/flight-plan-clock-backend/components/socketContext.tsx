'use client'

import React, {createContext, useEffect, useState} from "react";
import io, {Socket} from "socket.io-client";

export const SocketContext = createContext<Socket|undefined>(undefined)

export default function SocketProvider({children} : {children : React.ReactNode}) {
    const [socket, setSocket] = useState<Socket>()

    useEffect(() => {
        async function initSocket() {
            let mySocket : Socket
            if (!socket) {
                await fetch('/api/ping').catch(console.error)
                mySocket = io()
                setSocket(mySocket)
            } else {
                mySocket = socket
            }
            mySocket.on('connect', () => {
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

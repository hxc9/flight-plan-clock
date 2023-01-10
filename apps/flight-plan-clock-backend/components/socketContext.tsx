'use client'

import React, {createContext, useEffect} from "react";
import io, {Socket} from "socket.io-client";

fetch('http://localhost:3001/api/socket').catch(console.error)
let socket = io()

export const SocketContext = createContext<Socket>(socket)

export default function SocketProvider({children} : {children : React.ReactNode}) {
    useEffect(() => {
        socket.connect()
        socket.on('connect', () => {
            console.log("connected")
        })
        console.log("set " + socket.connected)
        return () => { socket && socket.close() }
    }, [])

    return <SocketContext.Provider value={socket}>
        {children}
    </SocketContext.Provider>
}
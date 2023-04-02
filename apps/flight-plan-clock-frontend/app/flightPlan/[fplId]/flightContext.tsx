"use client"

import {FlightPlanFull, RefiledMessage, UpdateMessage} from "flight-plan-clock-dto";
import React, {createContext, useContext, useEffect, useRef, useState} from "react";
import {SocketContext} from "../../../components/socketContext";
import { Status} from "autorouter-dto";
import {RefreshContext} from "../../../components/refreshContext";
import {useRouter} from "next/navigation";

export const FlightContext = createContext<Partial<FlightPlanFull>|undefined>(undefined)

export function FlightProvider({children, fplId} : {children: React.ReactNode, fplId: number}) {
    const router = useRouter()
    const socket = useContext(SocketContext)
    const [fpl, updateFpl] = useState<Partial<FlightPlanFull>>()
    const {didRefresh} = useContext(RefreshContext)
    const fplRef = useRef<Partial<FlightPlanFull>>()
    fplRef.current = fpl

    useEffect(() => {
        if (socket) {
            socket.on("fpl-change", (msg: UpdateMessage) => {
                if (msg.fplId === fplId) {
                    const newFpl = {...fplRef.current, ...msg.update}
                    console.log("Got fpl-change msg", newFpl)
                    setTimeout(() => {
                        updateFpl(newFpl)
                        didRefresh(msg.timestamp)
                    }, msg.update.status === Status.Cancelled ? 1_000 : 0)
                }
            })
            socket.on("fpl-refiled", (msg: RefiledMessage) => {
                if (msg.fplId === fplId) {
                    console.log("Processing refile")
                    didRefresh(msg.timestamp)
                    console.log("Navigating")
                    try {
                        router.push('/flightPlan/' + msg.refiledAs)
                    } catch (e) {
                        console.error(e)
                    }
                }
            })
        }
        return () => {
            socket && socket.off("fpl-change")
            socket && socket.off("fpl-refiled")
        }
    }, [socket, fplId, didRefresh, router])

    useEffect(() => {
        if (socket && fplId) {
            socket.emit("watch-flightPlan", fplId)
        }
        return () => { socket && socket.emit("unwatch-flightPlan") }
    }, [fplId, socket])
    return <FlightContext.Provider value={fpl}>
        {children}
    </FlightContext.Provider>
}
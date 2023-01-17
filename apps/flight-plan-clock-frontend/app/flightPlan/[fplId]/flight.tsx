"use client"

import FlightPlanCard from "./flightPlanCard";
import {TimeCard} from "./timeCard";
import styles from './flight.module.css'
import {FlightPlansResponse, FlightPlanFull, RefiledMessage, UpdateMessage} from "autorouter-dto";
import useSWRImmutable from "swr/immutable";
import {fetcher} from "../../../lib/restApi";
import {useContext, useEffect, useMemo, useRef, useState} from "react";
import {RefreshContext} from "../../../components/refreshContext";
import {useRefresh} from "../../../lib/utils";
import {SocketContext} from "../../../components/socketContext";
import {useRouter} from "next/navigation";

export default function Flight({fplId}: { fplId: number }) {
    const router = useRouter()
    const {didRefresh} = useContext(RefreshContext)
    const [fpl, updatedFpl] = useState<FlightPlanFull>()
    const fplRef = useRef<FlightPlanFull>()
    fplRef.current = fpl

    const {
        data
    }: { data: FlightPlansResponse | undefined, error: unknown | undefined, isLoading: boolean }
        = useSWRImmutable('/api/flightPlans', fetcher)

    useRefresh(data)

    const fallback = useMemo(() => data?.flightPlans?.find(fpl => fpl.id === fplId), [data, fplId])

    useEffect(() => {
        fallback && updatedFpl({...fpl??{}, ...fallback})
    }, [fallback])

    const socket = useContext(SocketContext)

    useEffect(() => {
        if (socket) {
            socket.on("fpl-change", (msg: UpdateMessage) => {
                if (fplRef.current && msg.fplId === fplId) {
                    updatedFpl({...fplRef.current, ...msg.update})
                    didRefresh(msg.timestamp)
                }
            })
            socket.on("fpl-refiled", (msg: RefiledMessage) => {
                if (fplRef.current && msg.fplId === fplId) {
                    didRefresh(msg.timestamp)
                    router.push('/flightPlan/' + msg.refiledAs)
                }
            })
        }
        return () => { socket && socket.off("fpl-change") }
    }, [socket])

    return fpl ? <>
        <FlightPlanCard fpl={fpl}/>
        <div className={styles.timesBlock}>
            <TimeCard type="EOBT" time={fpl.eobt}/>
            <TimeCard type="CTOT" time={fpl.ctot}/>
        </div>
    </> : <></>
}

"use client"

import FlightPlanCard from "./flightPlanCard";
import {TimeCard} from "./timeCard";
import styles from './flight.module.css'
import {FlightPlanFull, FlightPlansResponse, RefiledMessage, Status, UpdateMessage} from "autorouter-dto";
import useSWRImmutable from "swr/immutable";
import {fetcher} from "../../../lib/restApi";
import {useContext, useEffect, useMemo, useRef, useState} from "react";
import {RefreshContext} from "../../../components/refreshContext";
import {useRefresh} from "../../../lib/utils";
import {SocketContext} from "../../../components/socketContext";
import {useRouter} from "next/navigation";
import dayjs from "dayjs";
import {SWRResponse} from "swr";

export default function Flight({fplId}: { fplId: number }) {
    const router = useRouter()
    const {didRefresh} = useContext(RefreshContext)
    const [fpl, updatedFpl] = useState<FlightPlanFull>()
    const fplRef = useRef<FlightPlanFull>()
    fplRef.current = fpl

    const {
        data, mutate
    }: SWRResponse<FlightPlansResponse, unknown>
        = useSWRImmutable('/api/flightPlans', fetcher)

    useRefresh(data)

    const fallback = useMemo(() => data?.flightPlans?.find(fpl => fpl.id === fplId), [data, fplId])

    useEffect(() => {
        fallback && updatedFpl({ ...fallback, ...fpl??{}})
    }, [fallback])

    const socket = useContext(SocketContext)

    useEffect(() => {
        if (socket) {
            socket.on("fpl-change", (msg: UpdateMessage) => {
                if (fplRef.current && msg.fplId === fplId) {
                    const newFpl : FlightPlanFull = {...fplRef.current, ...msg.update}
                    setTimeout(() => {
                        updatedFpl(newFpl)
                        didRefresh(msg.timestamp)
                    }, msg.update.status === Status.Cancelled ? 1_000 : 0)
                }
            })
            socket.on("fpl-refiled", (msg: RefiledMessage) => {
                if (fplRef.current && msg.fplId === fplId) {
                    didRefresh(msg.timestamp)
                    mutate().catch(console.warn)
                    router.push('/flightPlan/' + msg.refiledAs)
                }
            })
        }
        return () => { socket && socket.off("fpl-change") }
    }, [socket])

    useEffect(() => {
        if (socket) {
            socket.emit("watch-flightPlan", fplId)
        }
        return () => { socket && socket.emit("unwatch-flightPlan") }
    }, [fplId])

    const parsedCtot = useMemo(() => fpl && parseCtot(fpl.ctot, fpl.eobt), [fpl])

    return fpl ? <>
        <FlightPlanCard fpl={fpl}/>
        <div className={styles.timesBlock}>
            <TimeCard type="EOBT" time={fpl.eobt}/>
            <TimeCard type="CTOT" time={parsedCtot}/>
        </div>
    </> : <></>
}

function parseCtot(ctotString: string | null | undefined, eobtTimestamp: number): number | undefined {
    if (!ctotString) {
        return
    }

    const parsedCtot = /^(\d\d):?(\d\d)$/.exec(ctotString)
    if (!parsedCtot) {
        return
    }
    const [, hours, minutes] = parsedCtot

    const eobt = dayjs.unix(eobtTimestamp).utc()

    let ctot = eobt.hour(+hours).minute(+minutes)
    if (ctot.isBefore(eobt)) {
        ctot = ctot.add(1, 'day')
    }
    return ctot.unix()
}
"use client"

import FlightPlanCard from "./flightPlanCard";
import { TimeCard } from "./timeCard";
import styles from './flight.module.css'
import {FlightPlanMini, FlightPlansResponse} from "autorouter-dto";
import useSWRImmutable from "swr/immutable";
import { fetcher } from "../../../lib/restApi";
import {useContext, useEffect, useMemo} from "react";
import {RefreshContext} from "../../../components/refreshContext";

export default function Flight({fplId}: {fplId: number}) {
    const {
        data
    }: { data: FlightPlansResponse | undefined, error: unknown | undefined, isLoading: boolean }
        = useSWRImmutable('/api/flightPlans', fetcher, {onSuccess: function () {
            console.log("success")
        }})

    const {didRefresh} = useContext(RefreshContext)

    useEffect(() => {
        if (data?.lastUpdated) {
            didRefresh(data.lastUpdated)
        }
    }, [didRefresh, data?.lastUpdated])

    const mini = useMemo(() => data?.flightPlans?.find(fpl => fpl.id === fplId), [data, fplId])

    let fpl : FlightPlanFull|undefined = mini

    return fpl ? <>
        <FlightPlanCard fpl={fpl}/>
        <div className={styles.timesBlock}>
            <TimeCard type="EOBT" time={fpl.eobt}/>
            <TimeCard type="CTOT" time={fpl.ctot}/>
        </div>
    </> : null
}

export type FlightPlanFull = FlightPlanMini & {
    ctot?: number,
    route?: string
}
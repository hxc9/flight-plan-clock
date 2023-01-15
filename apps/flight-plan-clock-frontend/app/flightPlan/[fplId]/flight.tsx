"use client"

import FlightPlanCard from "./flightPlanCard";
import { TimeCard } from "./timeCard";
import styles from './flight.module.css'
import {FlightPlansResponse, FlightPlanFull} from "autorouter-dto";
import useSWRImmutable from "swr/immutable";
import { fetcher } from "../../../lib/restApi";
import {useContext, useEffect, useMemo, useState} from "react";
import {RefreshContext} from "../../../components/refreshContext";

export default function Flight({fplId}: {fplId: number}) {
    const [fpl, updatedFpl] = useState<FlightPlanFull>()

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

    const fallback = useMemo(() => data?.flightPlans?.find(fpl => fpl.id === fplId), [data, fplId])

    useEffect(() => {
        fallback && updatedFpl(fallback)
        }, [fallback])

    return fpl ? <>
        <FlightPlanCard fpl={fpl}/>
        <div className={styles.timesBlock}>
            <TimeCard type="EOBT" time={fpl.eobt}/>
            <TimeCard type="CTOT" time={fpl.ctot}/>
        </div>
    </> : null
}

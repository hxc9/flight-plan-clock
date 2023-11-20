"use client"

import {FlightPlanMini, FlightPlansResponse} from "flight-plan-clock-dto";
import {useBackend} from "@/lib/apiClient";
import dayjs from "@/lib/dayjs";
import CallSign from "@/components/callSign";
import styles from "./flightPlanTableBody.module.css"
import {useRouter} from "next/navigation";
import {AppRouterInstance} from "next/dist/shared/lib/app-router-context.shared-runtime";
import {useContext, useEffect} from "react";
import {RefreshContext} from "@/components/refreshContext";


export default function FlightPlanTableBody() {
    const {data, error, isLoading} = useBackend<FlightPlansResponse>('/api/flightPlans')
    const router = useRouter()

    const refreshContext = useContext(RefreshContext)
    
    useEffect(() => {
        if (data) {
            refreshContext.didRefresh(data.lastUpdated)
        }
        }, [data?.lastUpdated])

    if (isLoading) {
        return <tbody>
        <tr>
            <td>Loading...</td>
        </tr>
        </tbody>
    }

    if (error || !data) {
        return <tbody>
        <tr>
            <td>Unable to load flight plans</td>
        </tr>
        </tbody>
    }

    const {flightPlans} = data

    if (flightPlans.length === 0) {
        return <tbody>
        <tr>
            <td>No upcoming flights</td>
        </tr>
        </tbody>
    }

    return <tbody>
    {flightPlans.map(fpl => <FplRow key={fpl.id} fpl={fpl} router={router}/>)}
    </tbody>
}

function FplRow({fpl, router}: { fpl: FlightPlanMini, router: AppRouterInstance }) {
    const eobt = dayjs.unix(fpl.eobt).utc()

    return <tr className={styles.link} onClick={() => router.push("/flightPlan/" + fpl.id)}>
        <td>{eobt.format('YYYY/MM/DD')}</td>
        <td>{eobt.format('HH:mm[Z]')}</td>
        <td><CallSign callSign={fpl.callSign}/></td>
        <td>{fpl.departure} <br/> → {fpl.destination}</td>
        <td>{'>'}</td>
    </tr>
}
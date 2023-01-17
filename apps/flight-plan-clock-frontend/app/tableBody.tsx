'use client'

import useSWR from 'swr';
import {FlightPlansResponse, FlightPlanMini} from "autorouter-dto";
import styles from "./page.module.css"
import {useRouter} from "next/navigation";
import {fetcher} from "../lib/restApi"
import Callsign from "../components/callsign";
import dayjs from "../lib/dayjs";
import {useRefresh} from "../lib/utils";
import {useEffect} from "react";

export default function TableBody(): JSX.Element {
    const router = useRouter()
    const {
        data,
        error,
        isLoading
    }: { data: FlightPlansResponse | undefined, error: unknown | undefined, isLoading: boolean }
        = useSWR('/api/flightPlans', fetcher, {
        refreshInterval: 60_000
    })

    useRefresh(data)

    useEffect(() => {
        if (data && data.flightPlans.length > 0) {
            router.prefetch('/flightPlan/' + data.flightPlans[0].id)
        }
    }, [data?.flightPlans?.at(0)?.id])

    if (!data || error || isLoading) {
        return <tr>
            <td colSpan={4}><i>{error ? "Error loading flight plans" : "Loading..."}</i></td>
        </tr>
    }

    const {flightPlans} = data

    return <>
        {flightPlans.map(fpl => <FplRow key={fpl.id} fpl={fpl}/>)}
    </>
}

function FplRow({fpl}: { fpl: FlightPlanMini }): JSX.Element {
    const router = useRouter()
    const {eobt: eobtTimestamp, callSign, departure, destination} = fpl
    const eobt = dayjs.unix(eobtTimestamp).utc()
    return <tr className={styles.link} onClick={() => {router.push("/flightPlan/" + fpl.id)}}>
        <td>{eobt.format('YYYY-MM-DD')}</td>
        <td>{eobt.format('HH:mm[Z]')}</td>
        <td><Callsign callsign={callSign}/></td>
        <td>{departure}→{destination}</td>
    </tr>
}
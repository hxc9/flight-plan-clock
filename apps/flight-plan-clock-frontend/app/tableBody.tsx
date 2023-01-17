'use client'

import useSWR from 'swr';
import {FlightPlansResponse, FlightPlanMini} from "autorouter-dto";
import styles from "./page.module.css"
import {useRouter} from "next/navigation";
import {fetcher} from "../lib/restApi"
import Callsign from "../components/callsign";
import dayjs from "../lib/dayjs";
import {useContext, useEffect} from 'react';
import {RefreshContext} from "../components/refreshContext";

export default function TableBody(): JSX.Element {
    const {
        data,
        error,
        isLoading
    }: { data: FlightPlansResponse | undefined, error: unknown | undefined, isLoading: boolean }
        = useSWR('/api/flightPlans', fetcher, {
        refreshInterval: 60_000
    })

    const {didRefresh} = useContext(RefreshContext)

    useEffect(() => {
        if (data?.lastUpdated) {
            didRefresh(data.lastUpdated)
        }
        }, [didRefresh, data?.lastUpdated])

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
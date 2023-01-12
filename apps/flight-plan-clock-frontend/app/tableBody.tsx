'use client'

import useSWR from 'swr';
import {FlightPlanMini} from "autorouter-dto";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc"
import styles from "./page.module.css"
import {useRouter} from "next/navigation";

dayjs.extend(utc)

const fetcher = (url: string) => fetch(process.env.NEXT_PUBLIC_BACKEND_URL + url).then(r => r.json())

export default function TableBody(): JSX.Element {
    const {
        data,
        error,
        isLoading
    }: { data: FlightPlanMini[] | undefined, error: unknown | undefined, isLoading: boolean }
        = useSWR('/api/flightPlans', fetcher, {
        refreshInterval: 30_000
    })

    if (!data || error || isLoading) {
        return <tr>
            <td colSpan={4}><i>{error ? "Error loading flight plans" : "Loading..."}</i></td>
        </tr>
    }

    return <>
        {data.map(fpl => <FplRow key={fpl.id} fpl={fpl}/>)}
    </>
}

function FplRow({fpl}: { fpl: FlightPlanMini }): JSX.Element {
    const router = useRouter()
    const {eobt: eobtTimestamp, callSign, departure, destination} = fpl
    const eobt = dayjs.unix(eobtTimestamp).utc()
    return <tr className={styles.link} onClick={() => {router.push("/flightPlan/" + fpl.id)}}>
        <td>{eobt.format('YYYY-MM-DD')}</td>
        <td>{eobt.format('HH:mm[Z]')}</td>
        <td>{callSign}</td>
        <td>{departure}→{destination}</td>
    </tr>
}
import {fetchFromBackend} from "../lib/apiClient";
import styles from './page.module.css'
import {FlightPlanMini, FlightPlansResponse} from "flight-plan-clock-dto";
import dayjs from "../lib/dayjs";
import Callsign from "../components/callsign";
import Link from "next/link";
import React from "react";
import {RefreshCanary} from "../components/refreshCanary";
import RefreshGovernor from "./refreshGovernor";

export default async function Home() {
    const data = await fetchFromBackend<FlightPlansResponse>('/api/flightPlans',
        {next: {revalidate: 0}})

    if (!data) {
        throw new Error("Unable to load flight plans")
    }

    const {flightPlans} = data

    return (
        <div className={styles.container}>
            <h1>Upcoming flights</h1>
            <RefreshCanary timestamp={data?.lastUpdated}/>
            <RefreshGovernor/>
            <div className={styles.content}>
                <table className={styles.flightPlanTable}>
                    <tbody>
                    {flightPlans.map(fpl => <FplRow key={fpl.id} fpl={fpl}/>)}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function FplRow({fpl}: { fpl: FlightPlanMini }): JSX.Element {
    const {eobt: eobtTimestamp, callSign, departure, destination} = fpl
    const eobt = dayjs.unix(eobtTimestamp).utc()

    const linker = (children: React.ReactNode) => <Link href={"/flightPlan/" + fpl.id}>
        {children}
    </Link>

    return <tr className={styles.link}>
        <td>{linker(eobt.format('YYYY/MM/DD'))}</td>
        <td>{linker(eobt.format('HH:mm[Z]'))}</td>
        <td>{linker(<Callsign callsign={callSign}/>)}</td>
        <td>{linker(<>{departure} <br/> → {destination}</>)}</td>
        <td>{linker('>')}</td>
    </tr>
}
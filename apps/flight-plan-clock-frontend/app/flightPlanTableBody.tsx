"use client"

import useSWR from 'swr'
import {useBackend} from "../lib/apiClient";
import {FlightPlanMini, FlightPlansResponse} from "flight-plan-clock-dto";
import React from "react";
import dayjs from "../lib/dayjs";
import Link from "next/link";
import styles from "./page.module.css";
import Callsign from "../components/callsign";
import {RefreshCanary} from "../components/refreshCanary";

export default function FlightPlanTableBody() {

    const {data, error, isLoading} = useBackend<FlightPlansResponse>('/api/flightPlans')

    if (isLoading) {
        return <tbody>
        <tr>
            <td>Loading...</td>
        </tr>
        </tbody>
    }

    if (error) {
        return <tbody>
        <tr>
            <td>Unable to load flightplans</td>
        </tr>
        </tbody>
    }


    const {flightPlans} = data

    if (flightPlans.length === 0) {
        return <tbody>
        <RefreshCanary timestamp={data?.lastUpdated}/>
        <tr>
            <td>No upcoming flights</td>
        </tr>
        </tbody>
    }

    return <tbody>
    <RefreshCanary timestamp={data?.lastUpdated}/>
    {flightPlans.map(fpl => <FplRow key={fpl.id} fpl={fpl}/>)}
    </tbody>
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
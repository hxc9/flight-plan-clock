"use client"

import styles from './flightPlanCard.module.css'
import Callsign from "../../../components/callsign";
import {DateValue, DynamicData, PlainValue} from "./dynamicData";
import Metar from "./metar";
import { useFlightPlan} from "../../../lib/apiClient";
import {RefreshCanary} from "../../../components/refreshCanary";

export default function FlightPlanCard({fplId}: { fplId: string }) {
    const {flightPlan: fpl, data} = useFlightPlan(fplId)

    if (!fpl) return null

    return <div className={styles.flightCard}>
        <RefreshCanary timestamp={data.lastUpdated} />
        <div className={styles.topRow}>
            <h2><Callsign callsign={fpl.callSign}/></h2>
            <h2>{fpl.departure} → {fpl.destination}</h2>
        </div>
        <div className={styles.midRow}>
            <div>
                <h3><DynamicData attr={'eobt'} baseValue={fpl.eobt}>
                    <DateValue format="date"/>
                </DynamicData></h3>
                <h3><DynamicData attr={'eobt'} baseValue={fpl.eobt}>
                    <DateValue format="time"/>
                </DynamicData></h3>
            </div>
            <h2 className={styles.status}>
                <DynamicData attr={'status'} baseValue={fpl.status}>
                    <PlainValue/>
                </DynamicData>
            </h2>
        </div>
        <div className={styles.midRow}>
            <div>
                <Metar icaoCode={fpl.departure}/>
            </div>
            <div>
                <Metar icaoCode={fpl.destination}/>
            </div>
        </div>
        <div className={styles.bottomRow}>
            <p><b>Route:</b></p>
            <p>{fpl.route}</p>
        </div>
    </div>
}

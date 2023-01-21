import styles from './flightPlanCard.module.css'
import Callsign from "../../../components/callsign";
import {FlightPlanFull} from "autorouter-dto";
import {DateValue, DynamicData, PlainValue} from "./dynamicData";

export default function FlightPlanCard({fpl}: { fpl: FlightPlanFull }) {

    return <div className={styles.flightCard}>
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
        <div className={styles.bottomRow}>
            <p><b>Route:</b></p>
            <p>{fpl.route}</p>
        </div>
    </div>
}

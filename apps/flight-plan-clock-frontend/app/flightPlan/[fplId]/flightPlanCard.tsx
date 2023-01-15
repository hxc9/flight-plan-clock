import styles from './flightPlanCard.module.css'
import {FlightPlanFull} from "./flight";
import Callsign from "../../../components/callsign";
import dayjs from '../../../lib/dayjs';

export default function FlightPlanCard({fpl} : {fpl: FlightPlanFull}) {
    const eobt = dayjs.unix(fpl.eobt).utc()
    return <div className={styles.flightCard}>
        <div className={styles.topRow}>
            <h2><Callsign callsign={fpl.callSign}/></h2>
            <h2>{fpl.departure} → {fpl.destination}</h2>
        </div>
        <div className={styles.midRow}>
            <div>
                <h3>{eobt.format('YYYY-MM-DD')}</h3>
                <h3>{eobt.format('HH:mm[Z]')}</h3>
            </div>
            <h2 className={styles.status}>{fpl.status}</h2>
        </div>
        <div className={styles.bottomRow}>
            <p><b>Route:</b></p>
            <p>{fpl.route}</p>
        </div>
    </div>
}
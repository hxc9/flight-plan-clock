import {fetchFlightPlan} from "../../../lib/apiClient";
import styles from './flightPlanGridView.module.css'

export async function FlightPlanGridView({fplId} : {fplId: number}) {
    const fpl = await fetchFlightPlan(fplId)

    if (!fpl) {
        return <em>Flight Plan not found</em>
    }

    return <div className={styles.grid}>
        <div className={styles.dept}>{fpl.departure}</div>
        <div className={styles.callSign}>{fpl.callsign}</div>
        <div className={styles.dest}>{fpl.destination}</div>
    </div>
}
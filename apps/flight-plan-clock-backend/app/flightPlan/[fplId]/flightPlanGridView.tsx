import {fetchFlightPlan} from "../../../lib/apiClient";
import styles from './flightPlanGridView.module.css'

const fplRouteRegex = /\(FPL-\w+-[VIZY][SNGMX]-\d{0,2}\w{2,4}\/[LMHJ] ?-\w+\/\w+-\w{4}\d{4}-[KNM]\d{4}(?:[FSAM]\d{3,4}|VFR) ([A-Z0-9/ ]+)/;

export async function FlightPlanGridView({fplId}: { fplId: number }) {
    const fpl = await fetchFlightPlan(fplId)

    if (!fpl) {
        return <em>Flight Plan not found</em>
    }

    const res = fplRouteRegex.exec(fpl.fplan.replaceAll('\n', ''))
    let route = null
    if (res) {
        [, route] = res
    }

    return <div className={styles.grid}>
        <div className={styles.left}>{fpl.departure}</div>
        <div className={styles.center}>{fpl.callsign}</div>
        <div className={styles.right}>{fpl.destination}</div>
        <div className={styles.center}>{fpl.status.charAt(0).toUpperCase() + fpl.status.slice(1)}</div>
        <div className={styles.wide}>{route}</div>
    </div>
}
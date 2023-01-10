import {fetchFlightPlan} from "../../../lib/apiClient";
import styles from './flightPlanGridView.module.css'
import {FlightPlan} from "autorouter-dto";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc"
import relativeTime from "dayjs/plugin/relativeTime"
import {getFplCtot, parseCtot} from "../../../lib/ctotService";

dayjs.extend(utc)
dayjs.extend(relativeTime)

const fplRouteRegex = /\(FPL-\w+-[VIZY][SNGMX]-\d{0,2}\w{2,4}\/[LMHJ] ?-\w+\/\w+-\w{4}\d{4}-[KNM]\d{4}(?:[FSAM]\d{3,4}|VFR) ([A-Z0-9/ ]+)/;

export async function FlightPlanGridView({fplId}: { fplId: number }) {
    const fpl = await fetchFlightPlan(fplId)

    if (!fpl) {
        return <em>Flight Plan not found</em>
    }

    const route = parseRoute(fpl)

    const eobt = dayjs.unix(fpl.eobt).utc()
    const ctot = parseCtot(await getFplCtot(fplId), eobt)

    return <div className={styles.grid}>
        <div className={styles.left}>{fpl.departure}</div>
        <div className={styles.center}>{fpl.callsign}</div>
        <div className={styles.right}>{fpl.destination}</div>
        <div className={styles.wide}>{eobt.format("YYYY/MM/DD")}</div>
        <div className={styles.center}>{fpl.status.charAt(0).toUpperCase() + fpl.status.slice(1)}</div>
        <div className={styles.center}></div>
        <div className={styles.center}></div>
        <div className={styles.center}>EOBT {eobt.format('HH:mm[Z]')}</div>
        <div className={styles.center}>{eobt.fromNow()}</div>
        {ctot ? <>
                <div className={styles.center}></div>
                <div className={styles.center}>CTOT {ctot.format('HH:mm[Z]')}</div>
                <div className={styles.center}>{ctot.fromNow()}</div>
        </> : null}
        <div className={styles.center}></div>
        <div className={styles.center}></div>
        <div className={styles.wide}>{route}</div>
    </div>
}

function parseRoute(fpl: FlightPlan) : string|null {
    const res = fplRouteRegex.exec(fpl.fplan.replaceAll('\n', ''))
    let route = null
    if (res) {
        [, route] = res
    }
    return route
}

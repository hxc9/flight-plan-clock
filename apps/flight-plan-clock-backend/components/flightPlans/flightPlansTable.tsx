import styles from "../../app/page.module.css";
import {FlightPlanRow} from "./flightPlanRow";
import {fetchFlightPlans} from "../../lib/apiClient";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc"

dayjs.extend(utc)

export const FlightPlansTable = async () : Promise<JSX.Element> => {
    const flightPlans = (await fetchFlightPlans()).sort((a : any, b : any) => a.eobt - b.eobt)
    const now = dayjs().utc().unix()

    const lastPastFpl = flightPlans.find((v, i, arr) => {
        return v.eobt < now && arr[i+1]?.eobt > now
    })?.flightplanid

    return <div>
        <h2>Flight plans ({flightPlans.length})</h2>
        <table className={styles.table}>
            <thead>
            <tr>
                <th>ID</th>
                <th></th>
                <th>Callsign</th>
                <th>Route</th>
                <th>EOBT</th>
                <th>Status</th>
                <th>CTOT</th>
            </tr>
            </thead>
            <tbody>
            {/* @ts-expect-error Server Component */}
            {flightPlans.map(({flightplanid: fplId}) => <FlightPlanRow key={fplId} fplId={fplId} mark={fplId === lastPastFpl}/>)}
            </tbody>
        </table>
    </div>
}
import {CreateFlightPlan} from "./createFlightPlan";
import styles from "../../app/page.module.css";
import {FlightPlanRow} from "./flightPlanRow";
import {listFlightPlans} from "../../lib/server/flightPlanService";

export const revalidate = 0

export const FlightPlansTable = async () : Promise<JSX.Element> => {
    const flightPlans = (await listFlightPlans()).sort((a : any, b : any) => a.eobt - b.eobt)

    return <div>
        <h2>Flight plans ({flightPlans.length})</h2>
        <h3><CreateFlightPlan/></h3>
        <table className={styles.table}>
            <thead>
            <tr>
                <th>ID</th>
                <th>Callsign</th>
                <th>Route</th>
                <th>EOBT</th>
                <th>Status</th>
                <th>CTOT</th>
                <th>Mutate</th>
            </tr>
            </thead>
            <tbody>
            {/* @ts-expect-error Server Component */}
            {flightPlans.map((fpl) => <FlightPlanRow key={fpl.flightplanid} {...fpl} />)}
            </tbody>
        </table>
    </div>
}
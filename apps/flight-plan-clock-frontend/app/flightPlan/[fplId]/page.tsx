import styles from './page.module.css'
import Link from "next/link";
import {FlightPlanResponse} from "autorouter-dto";
import FlightPlanCard from "./flightPlanCard";
import {TimeCardEobt, TimeCardCtot} from "./timeCard";
import {FlightProvider} from "./flightContext";
import {RefreshCanary} from "../../../components/refreshCanary";

export default async function FlightPlan({params: {fplId}}: { params: { fplId: string } }) {
    const data = (await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/api/flightPlans/' + fplId,
        {next: {revalidate: 0}})
        .then(r => r.json())) as FlightPlanResponse

    const {flightPlan: fpl} = data

    return (
        <div className={styles.container}>
            <RefreshCanary timestamp={data.lastUpdated}/>
            <div className={styles.header}>
                <p><Link href={'/'}>{'<'} Back</Link></p>
                <h1>Flight</h1>
            </div>
            <FlightProvider fplId={+fplId}>
                <FlightPlanCard fpl={fpl}/>
                <div className={styles.timesBlock}>
                    <TimeCardEobt time={fpl.eobt}/>
                    <TimeCardCtot ctot={fpl.ctot} eobt={fpl.eobt}/>
                </div>
            </FlightProvider>
        </div>
    )
}




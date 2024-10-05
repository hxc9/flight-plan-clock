import styles from './page.module.css'
import Link from "next/link";
import {FlightPlanCard} from "./flightPlanCard";

export default function FlightPlan({params: {fplId = '1'}}: { params: { fplId: string } }) {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <p><Link href={'/'}>{'<'} Back</Link></p>
                <h1>Flight</h1>
            </div>
            <FlightPlanCard fplId={+fplId}/>
        </div>
    )
}
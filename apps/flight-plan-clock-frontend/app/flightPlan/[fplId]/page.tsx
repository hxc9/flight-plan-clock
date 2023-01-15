import styles from './page.module.css'
import Link from "next/link";
import Flight from "./flight";

export default function FlightPlan({params: {fplId}} : {params: {fplId: string}}) {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <p><Link href={'/'}>{'<'} Back</Link></p>
                <h1>Flight</h1>
            </div>
            <Flight fplId={+fplId}/>
        </div>
    )
}

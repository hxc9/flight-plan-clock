import styles from './page.module.css'
import Link from "next/link";

export default function FlightPlan({params: {fplId}} : {params: {fplId: number}}) {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <p><Link href={'/'}>{'<'} Back</Link></p>
                <h1>Flight</h1>
            </div>
            <div className={styles.flightCard}>
                <div className={styles.topRow}>
                    <h2>HB-DIH</h2>
                    <h2>EDNY → LSZR</h2>
                </div>
                <div className={styles.midRow}>
                    <div>
                        <h3>2022/01/15</h3>
                        <h3>09:20Z</h3>
                    </div>
                    <h2>Filed</h2>
                </div>
                <div className={styles.routeRow}>
                    <p><b>Route:</b></p>
                    <p>OLBEN/N0149F110 IFR N869 BENOT BENOT1R</p>
                </div>
            </div>
            <div className={styles.timesBlock}>
                <div className={styles.eobtCard}>
                    <h1>EOBT</h1>
                </div>
                <div className={styles.ctotCard}>
                    <h1>CTOT</h1>
                </div>
            </div>
            <div className={styles.footer}>
                <div>last updated: 6 minutes ago</div>
                <div>12:00Z</div>
            </div>
        </div>
    )
}

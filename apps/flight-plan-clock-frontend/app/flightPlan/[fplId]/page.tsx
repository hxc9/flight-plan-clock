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
                <div className={styles.bottomRow}>
                    <p><b>Route:</b></p>
                    <p>OLBEN/N0149F110 IFR N869 BENOT BENOT1R</p>
                </div>
            </div>
            <div className={styles.timesBlock}>
                <div className={styles.eobtCard}>
                    <h1 className={styles.topRow}>EOBT</h1>
                    <div className={styles.midRow}>
                        <h1>15:30Z</h1>
                        <p>[15:15 - 15:45]</p>
                    </div>
                    <div className={styles.bottomRow}>in 30 minutes</div>
                </div>
                <div className={styles.ctotCard}>
                    <h1 className={styles.topRow}>CTOT</h1>
                    <div className={styles.midRow}>
                        <h1>15:30Z</h1>
                        <p>[15:15 - 15:45]</p>
                    </div>
                    <div className={styles.bottomRow}>in 30 minutes</div>
                </div>
            </div>
        </div>
    )
}

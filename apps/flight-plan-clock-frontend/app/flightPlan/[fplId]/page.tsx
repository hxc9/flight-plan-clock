import styles from './page.module.css'

export default function FlightPlan({params: {fplId}} : {params: {fplId: number}}) {
    return (
        <>
            <div className={styles.header}>
                <p>{'<'} Back</p>
                <h2>Flight</h2>
            </div>
            <div className={styles.flightCard}>
                <div className={styles.topRow}>
                    <h3>HB-DIH</h3>
                    <h3>EDNY → LSZR</h3>
                </div>
                <h3>2022/01/15 09:20Z</h3>
                <p><b>Status: </b>Filed</p>
                <p><b>Route: </b>OLBEN/N0149F110 IFR N869 BENOT BENOT1R</p>
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
                Footer
            </div>
        </>
    )
}

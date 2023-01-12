import styles from './page.module.css'

export default function FlightPlan({params: {fplId}} : {params: {fplId: number}}) {
    return (
        <>
            <div className={styles.header}>
                Header
            </div>
            <div className={styles.flightCard}>
                Top (Flight plan {fplId})
            </div>
            <div className={styles.timesBlock}>
                <div className={styles.eobtCard}>Bottom left</div>
                <div className={styles.ctotCard}>Bottom right</div>
            </div>
            <div className={styles.footer}>
                Footer
            </div>
        </>
    )
}

import styles from './page.module.css'
import FlightPlanTableBody from "@/app/flightPlanTableBody";

export default function Home() {
    return (
        <div className={styles.container}>
            <h1>Upcoming flights</h1>
            <div className={styles.content}>
                <table className={styles.flightPlanTable}>
                  <FlightPlanTableBody/>
                </table>
            </div>
        </div>
    )
}

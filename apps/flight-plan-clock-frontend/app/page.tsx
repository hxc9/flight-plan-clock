import styles from './page.module.css'
import TableBody from "./tableBody";

export default function Home() {
  return (
    <>
        <h1>Upcoming flights</h1>
        <div className={styles.content}>
            <table className={styles.flightPlanTable}>
                <tbody>
                <TableBody/>
                </tbody>
            </table>
        </div>
    </>
  )
}

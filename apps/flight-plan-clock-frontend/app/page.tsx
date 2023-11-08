import styles from './page.module.css'
import React from "react";
import RefreshGovernor from "./refreshGovernor";
import FlightPlanTableBody from "./flightPlanTableBody";

export default async function Home() {
    return (
        <div className={styles.container}>
            <h1>Upcoming flights</h1>
            <RefreshGovernor/>
            <div className={styles.content}>
                <table className={styles.flightPlanTable}>
                    <FlightPlanTableBody/>
                </table>
            </div>
        </div>
    )
}

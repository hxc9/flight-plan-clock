import {Fira_Code} from '@next/font/google'
import styles from './page.module.css'

import {FlightPlansTable} from "../components/flightPlans/flightPlansTable";
import {MessagesTable} from "../components/messages/messagesTable";
import {ZuluClock} from "../components/time/zuluClock";
import {RefreshGovernor} from "../components/refreshGovernor";
import {Suspense} from "react";

const firaCode = Fira_Code({subsets: ['latin']})

export default async function Home() {
    return (
        <main className={styles.main + ' ' + firaCode.className}>
            <div className={styles.description}>
                <p>
                    Mock server for the AutoRouter API
                </p>
                <div>
                    <h3><ZuluClock/></h3>
                    <RefreshGovernor/>
                </div>
            </div>
            <Suspense fallback={<div>Loading</div>}>
                {/* @ts-expect-error Server Component */}
                <FlightPlansTable/>
            </Suspense>
            <Suspense fallback={<div>Loading</div>}>
                {/* @ts-expect-error Server Component */}
                <MessagesTable/>
            </Suspense>
        </main>
    )
}

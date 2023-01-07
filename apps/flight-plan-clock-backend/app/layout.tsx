import './globals.css'
import ClockProvider from "../components/clockContext";
import styles from "./page.module.css";
import {ZuluClock} from "../components/time/zuluClock";
import {RefreshGovernor} from "../components/refreshGovernor";
import {Fira_Code} from "@next/font/google";
import React from "react";
import Navigation from "./navigation";

const firaCode = Fira_Code({subsets: ['latin']})

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en">
        {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
        <head/>
        <body>
        <ClockProvider>
            <main className={styles.main + ' ' + firaCode.className}>
                <div className={styles.description}>
                    <p>
                        Flight Plan Clock backend
                    </p>
                    <Navigation/>
                    <div>
                        <h3><ZuluClock/></h3>
                        <RefreshGovernor/>
                    </div>
                </div>
                {children}
            </main>
        </ClockProvider>
        </body>
        </html>
    )
}

import './globals.css'
import {Roboto_Flex} from '@next/font/google'
import styles from './layout.module.css'
import React from "react";
import ClockProvider from "../components/clockContext";
import Clock from './clock';
import {RefreshContextProvider} from "../components/refreshContext";
import UpdateInfo from "./updateInfo";
import SocketProvider from "../components/socketContext";

const roboto = Roboto_Flex({subsets: ['latin']})

export const metadata = {
    title: 'FPL Clock',
    viewport: {
        width: 'device-width',
        initialScale: 1
    },
    description: 'Flight plan clock application',
    icons: {
        icon: '/favicon.ico'
    }
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <body>
        <ClockProvider>
            <SocketProvider>
                <RefreshContextProvider>
                    <main className={styles.main + ' ' + roboto.className}>
                        {children}
                        <div className={styles.footer}>
                            <div><UpdateInfo/></div>
                            <div><Clock/></div>
                        </div>
                    </main>
                </RefreshContextProvider>
            </SocketProvider>
        </ClockProvider>
        </body>
        </html>
    )
}

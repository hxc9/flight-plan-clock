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

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
        <head/>
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

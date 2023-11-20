import type { Metadata } from 'next'
import { Roboto_Flex } from 'next/font/google'
import './globals.css'
import styles from './layout.module.css'
import SocketProvider from "@/components/socketContext";
import { ReactNode } from "react";
import {ClockProvider} from "@/components/clockContext";
import Clock from "@/app/clock";
import {RefreshContextProvider} from "@/components/refreshContext";
import RefreshInfo from "@/app/refreshInfo";

const roboto = Roboto_Flex({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FPL Clock',
  description: 'Flightplan clock application',
  icons: {
    icon: '/favicon.ico',
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body className={roboto.className}>
      <main className={styles.main + ' ' + roboto.className}>
        <ClockProvider>
          <RefreshContextProvider>
          <SocketProvider>
              {children}
          </SocketProvider>
        <div className={styles.footer}>
          <div><RefreshInfo/></div>
          <div><Clock/></div>
        </div>
          </RefreshContextProvider>
        </ClockProvider>
      </main>
      </body>
    </html>
  )
}

import './globals.css'
import { Roboto_Flex } from '@next/font/google'
import styles from './layout.module.css'
import React from "react";

const roboto = Roboto_Flex({ subsets: ['latin'] })

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
      <head />
      <body>
      <main className={styles.main + ' ' + roboto.className}>
          {children}
          <div className={styles.footer}>
              <div>last updated: 6 minutes ago</div>
              <div>12:00Z</div>
          </div>
      </main>
      </body>
    </html>
  )
}

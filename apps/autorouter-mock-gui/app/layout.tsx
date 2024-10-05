import './globals.css'
import { RefreshGovernor } from '@/components/refreshGovernor';
import { ZuluClock } from '@/components/time/zuluClock';
import { getServerSession } from 'next-auth';
import { Fira_Code } from 'next/font/google';
import React from "react";
import styles from './page.module.css';

export const metadata = {
    title: 'MockoRouter',
    description: 'Mock for the autorouter API',
    icons: {
        icon: '/favicon.ico'
    }
}

export const viewport = {
    width: 'device-width',
    initialScale: 1
}

const firaCode = Fira_Code({ subsets: ['latin'] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession();

  return (
    <html lang="en">
    <body>
    <main className={styles.main + ' ' + firaCode.className}>
      <div className={styles.description}>
        <p>
          Mock server for the AutoRouter API
        </p>
        <div className={styles.right_header}>
          <h3><ZuluClock /></h3>
          <h4>{session && session.user ? `Logged in as: ${session.user.name}` : 'not logged in'}</h4>
          <RefreshGovernor />
        </div>
      </div>
      {children}
    </main>
    </body>
    </html>
  )
}

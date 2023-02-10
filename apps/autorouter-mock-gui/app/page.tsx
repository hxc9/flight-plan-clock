import { Fira_Code } from '@next/font/google';
import { getServerSession } from 'next-auth';
import styles from './page.module.css';

import { FlightPlansTable } from '@/components/flightPlans/flightPlansTable';
import { MessagesTable } from '@/components/messages/messagesTable';
import { ZuluClock } from '@/components/time/zuluClock';
import { RefreshGovernor } from '@/components/refreshGovernor';
import { Suspense } from 'react';

const firaCode = Fira_Code({ subsets: ['latin'] });

export default async function Home() {
  const session = await getServerSession()

  return (
    <main className={styles.main + ' ' + firaCode.className}>
      <div className={styles.description}>
        <p>
          Mock server for the AutoRouter API
        </p>
        <div className={styles.right_header}>
          <h3><ZuluClock /></h3>
          <h4>{session && session.user ? `Logged in as: ${session.user.name}` : "not logged in"}</h4>
          <RefreshGovernor />
        </div>
      </div>
      <Suspense fallback={<div>Loading</div>}>
        {/* @ts-expect-error Server Component */}
        <FlightPlansTable />
      </Suspense>
      <Suspense fallback={<div>Loading</div>}>
        {/* @ts-expect-error Server Component */}
        <MessagesTable />
      </Suspense>
    </main>
  );
}

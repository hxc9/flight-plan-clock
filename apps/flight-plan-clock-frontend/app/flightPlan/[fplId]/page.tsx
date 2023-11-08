import Link from 'next/link';
import { FlightProvider } from './flightContext';
import FlightPlanCard from './flightPlanCard';
import styles from './page.module.css';
import { TimeCardCtot, TimeCardEobt } from './timeCard';

export const dynamic = 'force-dynamic';

export default async function FlightPlan({ params: { fplId = '1' } }: { params: { fplId: string } }) {

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <p><Link href={'/'}>{'<'} Back</Link></p>
        <h1>Flight</h1>
      </div>
      <FlightProvider fplId={+fplId}>
        <FlightPlanCard fplId={fplId}/>
        <div className={styles.timesBlock}>
          <TimeCardEobt fplId={fplId} />
          <TimeCardCtot fplId={fplId} />
        </div>
      </FlightProvider>
    </div>
  );
}

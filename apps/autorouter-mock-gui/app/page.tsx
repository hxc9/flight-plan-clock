import { Fira_Code } from 'next/font/google';
import { getServerSession } from 'next-auth';
import styles from '../page.module.css';

import { FlightPlansTable } from '@/components/flightPlans/flightPlansTable';
import { MessagesTable } from '@/components/messages/messagesTable';
import { ZuluClock } from '@/components/time/zuluClock';
import { RefreshGovernor } from '@/components/refreshGovernor';
import { Users } from '@/components/users/users';


export default async function Home() {
  return (
    <>
      <Users />
</>
  );
}

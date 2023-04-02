import {Fira_Code} from '@next/font/google';
import {getServerSession} from 'next-auth';
import styles from '../page.module.css';

import {FlightPlansTable} from '@/components/flightPlans/flightPlansTable';
import {MessagesTable} from '@/components/messages/messagesTable';
import {ZuluClock} from '@/components/time/zuluClock';
import {RefreshGovernor} from '@/components/refreshGovernor';
import {Suspense} from 'react';
import {Users} from "@/components/users/users";

const firaCode = Fira_Code({subsets: ['latin']});

export default async function Home({params}: { params: { slug?: string[] } }) {
    let userId: number | undefined = undefined
    const slug = params.slug ?? []
    if (slug.length > 0) {
        userId = +slug[0]
    }

    const session = await getServerSession()

    return (
        <main className={styles.main + ' ' + firaCode.className}>
            <div className={styles.description}>
                <p>
                    Mock server for the AutoRouter API
                </p>
                <div className={styles.right_header}>
                    <h3><ZuluClock/></h3>
                    <h4>{session && session.user ? `Logged in as: ${session.user.name}` : "not logged in"}</h4>
                    <RefreshGovernor/>
                </div>
            </div>
            <Suspense fallback={<div>Loading</div>}>
                {/* @ts-expect-error Server Component */}
                <Users userId={userId}/>
            </Suspense>
            {userId ? <>
                {/* @ts-expect-error Server Component */}
                <FlightPlansTable userId={userId}/>
                {/* @ts-expect-error Server Component */}
                <MessagesTable userId={userId}/>
            </> : null}
        </main>
    );
}

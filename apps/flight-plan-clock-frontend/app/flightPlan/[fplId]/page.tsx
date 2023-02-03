import {FlightPlanResponse, FlightPlansResponse} from "flight-plan-clock-dto";
import Link from "next/link";
import {redirect} from "next/navigation";
import {RefreshCanary} from "../../../components/refreshCanary";
import {fetchFromBackend} from "../../../lib/apiClient";
import {FlightProvider} from "./flightContext";
import FlightPlanCard from "./flightPlanCard";
import styles from './page.module.css'
import {TimeCardCtot, TimeCardEobt} from "./timeCard";

export default async function FlightPlan({params: {fplId='1'}}: { params: { fplId: string } }) {
    const data = await fetchFromBackend<FlightPlanResponse>('/api/flightPlans/' + fplId,
        {next: {revalidate: 0}})

    if (!data) {
        redirect('/')
    }

    const {flightPlan: fpl} = data

    return (
        <div className={styles.container}>
            <RefreshCanary timestamp={data.lastUpdated}/>
            <div className={styles.header}>
                <p><Link href={'/'}>{'<'} Back</Link></p>
                <h1>Flight</h1>
            </div>
            <FlightProvider fplId={+fplId}>
                <FlightPlanCard fpl={fpl}/>
                <div className={styles.timesBlock}>
                    <TimeCardEobt time={fpl.eobt}/>
                    <TimeCardCtot ctot={fpl.ctot} eobt={fpl.eobt}/>
                </div>
            </FlightProvider>
        </div>
    )
}

export async function generateStaticParams() : Promise<{fplId: string}[]> {
    return (await fetchFromBackend<FlightPlansResponse>('/api/flightPlans'))
        ?.flightPlans?.map(({id}) => {
            return {fplId: '' + id}
    })??[{fplId: '1'}]
}


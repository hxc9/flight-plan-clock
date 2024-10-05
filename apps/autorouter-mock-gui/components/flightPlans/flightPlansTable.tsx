import { CreateFlightPlan } from './createFlightPlan';
import styles from '../../app/page.module.css';
import { FlightPlanRow } from './flightPlanRow';
import { flightPlanService } from 'autorouter-mock-services';

export const revalidate = 0;

export const FlightPlansTable = async ({userId} : {userId: number}): Promise<JSX.Element> => {
  const flightPlans = (await flightPlanService.listFlightPlans(userId, true))
      .sort((a: any, b: any) => a.eobt - b.eobt);

  return <div>
    <h2>Flight plans ({flightPlans.length})</h2>
    <h3><CreateFlightPlan userId={userId}/></h3>
    <table className={styles.table}>
      <thead>
      <tr>
        <th>ID</th>
        <th>Callsign</th>
        <th>Route</th>
        <th>EOBT</th>
        <th>Status</th>
        <th>CTOT</th>
        <th>Mutate</th>
      </tr>
      </thead>
      <tbody>
      {flightPlans.map((fpl) => <FlightPlanRow key={fpl.flightplanid} userId={userId} {...fpl} />)}
      </tbody>
    </table>
  </div>;
};
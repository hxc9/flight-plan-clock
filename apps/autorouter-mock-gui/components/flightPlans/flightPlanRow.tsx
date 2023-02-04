import { ZuluTimestamp } from '../time/zuluTimestamp';
import { DeleteFlightPlan } from './deleteFlightPlan';
import { ChangeEobt } from './changeEobt';
import { ChangeCtot } from './changeCtot';
import { ctotService } from 'autorouter-mock-services';
import { eobtCanBeChanged, Status } from 'autorouter-dto';
import { StatusField } from './statusField';
import styles from '../../app/page.module.css';

export const FlightPlanRow = async ({ flightplanid: fplId, ...fpl }: any): Promise<JSX.Element> => {
  const ctot = await ctotService.readFlightPlanCtot(fplId);

  const status = fpl.status;
  const isBeforeDeparture = eobtCanBeChanged(status);

  return <tr className={status === Status.Closed ? styles.italic : undefined}>
    <td>{fplId}</td>
    <td>{fpl.callsign}</td>
    <td>{fpl.departure}-{fpl.destination}</td>
    <td>
      <ZuluTimestamp unixTimestamp={fpl.eobt} />
      {isBeforeDeparture ? <ChangeEobt fplId={fplId} eobt={fpl.eobt} /> : null}
    </td>
    <td>
      <StatusField key={fplId} fplId={fplId} currentStatus={fpl.status} />
    </td>
    <td>
      {ctot ? <ZuluTimestamp unixTimestamp={ctot.unix()} /> : null}
      {status === Status.Filed ? <ChangeCtot fplId={fplId} eobt={fpl.eobt} hasCtot={ctot != null} /> : null}
    </td>
    <td>
      <DeleteFlightPlan fplId={fplId} />
    </td>
  </tr>;
};
import {ZuluTimestamp} from "../time/zuluTimestamp";
import {Status} from "autorouter-dto";
import {StatusField} from "./statusField";
import styles from "./flightPlanRow.module.css";
import {fetchFlightPlan} from "../../lib/apiClient";
import {Ctot} from "./ctot";
import {Suspense} from "react";
import Link from "next/link"

const preDepartureStatuses = [Status.Created, Status.ManualCorrection, Status.Filed, Status.Suspended];
const postArrivalStatus = [Status.Arrived, Status.Terminated, Status.Cancelled, Status.Closed]

export const FlightPlanRow = async ({fplId, mark} : {fplId: number, mark: boolean}) : Promise<JSX.Element> => {
    const fpl = await fetchFlightPlan(fplId)

    const status = Status.fromString(fpl.status)
    const isBeforeDeparture = preDepartureStatuses.includes(status)

    let statusLampClass = styles.statusLamp + ' '
    if (status === Status.Suspended || status === Status.ManualCorrection) {
        statusLampClass += styles.suspended
    } else if (isBeforeDeparture) {
        statusLampClass += styles.preDeparture
    } else if (postArrivalStatus.includes(status)) {
        statusLampClass += styles.closed
    } else {
        statusLampClass += styles.inFlight
    }

    // @ts-ignore
    return <tr className={`${status === Status.Closed ? styles.italic : ''} ${mark ? styles.mark : ''}` }>
        <td><Link href={`/flightPlan/${fplId}`}>{fplId}</Link></td>
        <td className={statusLampClass}>{status !== Status.Created ? '\u2b24' : ''}</td>
        <td>{fpl.callsign}</td>
        <td>{fpl.departure}-{fpl.destination}</td>
        <td>
            <ZuluTimestamp unixTimestamp={fpl.eobt} withDelta={true}/>
        </td>
        <td>
            {/* @ts-expect-error Server Component */}
            <StatusField fplId={fplId}/>
        </td>
        <td>
            <Suspense>
                {/* @ts-expect-error Server Component */}
                <Ctot fplId={fplId} eobt={fpl.eobt}/>
            </Suspense>
        </td>
    </tr>
}
import { Status } from "autorouter-dto";
import {fetchFlightPlan} from "../../lib/apiClient";

export const StatusField = async ({fplId}: { fplId: number }): Promise<JSX.Element> => {
    const currentStatus = (await fetchFlightPlan(fplId))?.status as Status

    return <form>
        <select value={currentStatus} disabled={true}>
            <option key={currentStatus} value={currentStatus}>{currentStatus}</option>
        </select>
    </form>
}
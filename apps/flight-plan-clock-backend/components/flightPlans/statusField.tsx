import { Status } from "autorouter-dto";
import {fetchFlightPlan} from "../../lib/apiClient";

export const StatusField = async ({fplId}: { fplId: number }): Promise<JSX.Element> => {
    const currentStatus = Status.fromString((await fetchFlightPlan(fplId)).status)

    return <form>
        <select value={currentStatus.name} disabled={true}>
            <option key={currentStatus.name} value={currentStatus.name}>{currentStatus.name}</option>
        </select>
    </form>
}
import {fetchFlightPlan} from "../../../lib/apiClient";
import {getMessagesForFlightPlan} from "../../../lib/messageService";
import {FlightPlanGridView} from "./flightPlanGridView";
import {redirect} from "next/navigation";

export default async function Page({params: {fplId}} : {params: any, fplId: number}) {
    const fpl = await fetchFlightPlan(fplId)
    if (!fpl) {
        redirect('/')
    }
    const messages = await getMessagesForFlightPlan(fplId)

    return <div>
        <h1>Flight plan {fplId}</h1>
        {/* @ts-expect-error Server Component */}
        <FlightPlanGridView fplId={fplId}/>
        <div>
            <code>{JSON.stringify(fpl, null, 2)}</code>
        </div>
        <div>
            <h3>Messages:</h3>
            {messages && messages.length > 0 ? <ul>
                {messages.map((msg) => <li key={msg.id}><code>{JSON.stringify(msg, null, 2)}</code></li>)}
            </ul> : <i>No messages</i> }
        </div>
    </div>;
}
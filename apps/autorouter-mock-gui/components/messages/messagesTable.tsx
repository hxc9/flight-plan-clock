import styles from "../../app/page.module.css";

import {readAllMessages} from "../../lib/server/messageService";
import {readMessages} from "../../lib/server/messageStreamService";
import {PendingMessage} from "./pendingMessage";
import {FplMessage} from "autorouter-dto";

export const revalidate = 0

export const MessagesTable = async (): Promise<JSX.Element> => {
    const messages = await readAllMessages()
    const queuedMessages = (await readMessages(messages.length, 0))
        .map(({id} : {id:number}) => id)

    return <div>
        <h2>Pending messages ({messages.length})</h2>
        <table className={styles.table}>
            <thead>
            <tr>
                <th>ID</th>
                <th>FPL</th>
                <th>Type</th>
                <th>Content</th>
                <th>Pending</th>
            </tr>
            </thead>
            <tbody>
            {messages.map((msg : FplMessage) => <tr key={msg.id}>
                <td>{msg.id}</td>
                <td>{msg.message.fplid}</td>
                <td>{msg.type}</td>
                <td>
                    <code>{JSON.stringify(msg.message)}</code>
                </td>
                <td>{queuedMessages.includes(msg.id) ? <PendingMessage msgId={msg.id}/> : ' '}</td>
            </tr>)}
            </tbody>
        </table>
    </div>
}
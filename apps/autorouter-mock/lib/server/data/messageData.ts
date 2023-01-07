import {Status} from "autorouter-dto"

import {
    FplDpiUpdated,
    FplSlotCancelledMessage,
    FplSlotMessage,
    FplStatusChangeMessage,
    FplSubMessage,
    Message
} from "autorouter-dto";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc"

dayjs.extend(utc)

export const baseMessage = {
    /* unique message ID, 64-bit unsigned integer, used to acknowledge the message */
    "id": 12345,
    /* the user ID, integer the message applies to */
    "uid": 1,
    /* timestamp in seconds since the Unix epoch from when the message originates */
    "timestamp": 1474191842,
    /* message type identifier */
    "type": "fplan_status_changed",
    /* message specific data */
    "message":
        {}
}

export function buildFplStatusChangeMessage(fplId: number, previousStatus: Status, nextStatus: Status) : Message<FplStatusChangeMessage> {
    return buildMessage('fplan_status_changed', {
        "fplid": fplId,
        "status_previous": previousStatus.name,
        "status": nextStatus.name
    })
}

export function buildFplSlotMessage(fplId: number, ctot: string, revision: boolean) : Message<FplSlotMessage> {
    return buildMessage(revision ? 'fplan_slot_revised' : 'fplan_slot_allocated', {
        "fplid": fplId,
        "ctot": ctot,
        "regulations":
            [
                "LSZBA21M"
            ],
        "regcause":
            [
                "CE 81"
            ],
        "ttos":
            [
                {
                    /* altitude in flight level */
                    "fl": "F090",
                    /* target time over in HHMMZ */
                    "to": "0746",
                    /* ident of the point */
                    "ptid": "WIL"
                }
            ]
    })
}

export function buildFplSlotCancelledMessage(fplId: number) : Message<FplSlotCancelledMessage> {
    return buildMessage('fplan_slot_cancelled', {
        "fplid": fplId,
        "reasons":
            [],
        "comments":
            []
    })
}

export function buildFplDpiUpdatedMessage(fplId: number, tobt?: string, taxiTime?: string, ttot?: string, sid?: string) : Message<FplDpiUpdated> {
    return buildMessage('fplan_dpi_updated', {
        "fplid": fplId,
        /* target offblock time in hhmm UTC */
        "tobt": tobt,
        /* taxi time in minutes */
        "taxitime": taxiTime,
        /* target takeoff time in hhmm UTC */
        "ttot": ttot,
        /* assigned SID */
        "sid": sid
    })
}

function buildMessage<T extends FplSubMessage>(type: string, subMsg: T): Message<T> {
    return {
        id: 0,
        uid: 1,
        timestamp: dayjs().utc().unix(),
        type: type,
        message: subMsg
    }
}
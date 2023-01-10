export type FplMessage = {
    /* unique message ID, 64-bit unsigned integer, used to acknowledge the message */
    "id": number,
    /* the user ID, integer the message applies to */
    "uid": number,
    /* timestamp in seconds since the Unix epoch from when the message originates */
    "timestamp": number,
    /* message type identifier */
    "type": string,
    /* message specific data */
    "message": {
        fplid: number,
    }
}

export type FplMessages = Array<FplMessage>

export type FplStatusChangeMessage = FplMessage & {
    type: "fplan_status_changed",
    message: {
        "status_previous": string,
        "status": string
    }
}

type RefileSubMessage =   {
    /* whether it was filed as part of a "bring forward operation */
    "refile": boolean
}

export type FplFiledMessage = FplMessage & {
    type: "fplan_filed",
    message: RefileSubMessage
}

export type FplQueuedMessage = FplMessage & {
    type: "fplan_queued",
    message: RefileSubMessage
}

export type FplRejectedMessage = FplMessage & {
    type: "fplan_rejected",
    message: {
        "errors": unknown[],
    }
}

type FplSlotSubMessage = {
    "ctot": string,
    "regulations": Array<string>,
    "regcause": Array<string>,
    "ttos": Array<{fl: string, to: string, ptid: string}>,
}

export type FplSlotAllocatedMessage = FplMessage & {
    type: "fplan_slot_allocated",
    message: FplSlotSubMessage
}

export type FplSlotRevisedMessage = FplMessage & {
    type: "fplan_slot_revised",
    message: FplSlotSubMessage
}

export type FplSlotMessage = FplSlotAllocatedMessage|FplSlotRevisedMessage

export function isFplSlotMessage(msg: FplMessage) : msg is FplSlotMessage {
    return msg.type === 'fplan_slot_revised' || msg.type === 'fplan_slot_allocated'
}

export type FplSlotCancelledMessage = FplMessage & {
    type: "fplan_slot_cancelled",
    message: {
        "reasons": unknown[],
        "comments": unknown[]
    }
}

export function isFplSlotCancelledMessage(msg: FplMessage) : msg is FplSlotCancelledMessage {
    return msg.type === 'fplan_slot_revised' || msg.type === 'fplan_slot_allocated'
}

export type FplSuspendedMessage = FplMessage & {
    type: "fplan_suspended",
    message: {
        "comments": string[],
        "errors": unknown[],
        "newrte": unknown[]
    }
}

export type FplDesuspendedMessage = FplMessage & {
    type: "fplan_desuspended"
}

type SsrCodeSubMessage = {
    "ssrcode": string
}

export type FplSsrAssignedMessage = FplMessage & {
    type: "fplan_ssr_assigned",
    message: SsrCodeSubMessage
}

export type FplSsrUpdatedMessage = FplMessage & {
    type: "fplan_ssr_updated",
    message: SsrCodeSubMessage
}

type DelaySubMessage = {
    "eobt": number,
    "previous_eobt": number
}

export type FplDelayedMessge = FplMessage & {
    type: "fplan_delayed",
    message: DelaySubMessage
}

export type FplCancelledMessage = FplMessage & {
    type: "fplan_cancelled",
    message: {
        reason: string
    }
}

export type FplBroughtForwardMessage = FplMessage & {
    type: "fplan_broughtforward",
    message: DelaySubMessage & {
        "previous_fplid": number
    }
}

export type FplDpiUpdated = FplMessage & {
    type: "fplan_dpi_updated",
    message: {
        /* target offblock time in hhmm UTC */
        tobt?: string,
        /* taxi time in minutes */
        taxitime?: string,
        /* target takeoff time in hhmm UTC */
        ttot?: string,
        /* assigned SID */
        sid?: string
    }
}

export type FplOperatorMessage = FplMessage & {
    type: "fplan_msg_operator",
    message: {
        message: string,
        originator: string
    }
}
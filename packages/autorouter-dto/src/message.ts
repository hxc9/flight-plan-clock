import {Status} from "./status";

export enum FplMessageType {
    fplan_status_changed = "fplan_status_changed",
    fplan_filed = "fplan_filed",
    fplan_queued = "fplan_queued",
    fplan_rejected = "fplan_rejected",
    fplan_slot_allocated = "fplan_slot_allocated",
    fplan_slot_revised = "fplan_slot_revised",
    fplan_slot_cancelled = "fplan_slot_cancelled",
    fplan_suspended = "fplan_suspended",
    fplan_desuspended = "fplan_desuspended",
    fplan_ssr_assigned = "fplan_ssr_assigned",
    fplan_ssr_updated = "fplan_ssr_updated",
    fplan_delayed = "fplan_delayed",
    fplan_cancelled = "fplan_cancelled",
    fplan_broughtforward = "fplan_broughtforward",
    fplan_dpi_updated = "fplan_dpi_updated",
    fplan_msg_operator = "fplan_msg_operator"
}

export type FplMessage = {
    /* unique message ID, 64-bit unsigned integer, used to acknowledge the message */
    "id": number,
    /* the user ID, integer the message applies to */
    "uid": number,
    /* timestamp in seconds since the Unix epoch from when the message originates */
    "timestamp": number,
    /* message type identifier */
    "type": FplMessageType,
    /* message specific data */
    "message": {
        fplid: number,
    }
}

export type FplMessages = Array<FplMessage>

export type FplStatusChangeMessage = FplMessage & {
    type: FplMessageType.fplan_status_changed,
    message: {
        "status_previous": Status,
        "status": Status
    }
}

type RefileSubMessage =   {
    /* whether it was filed as part of a "bring forward operation */
    "refile": boolean
}

export type FplFiledMessage = FplMessage & {
    type: FplMessageType.fplan_filed,
    message: RefileSubMessage
}

export type FplQueuedMessage = FplMessage & {
    type: FplMessageType.fplan_queued,
    message: RefileSubMessage
}

export type FplRejectedMessage = FplMessage & {
    type: FplMessageType.fplan_rejected,
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
    type: FplMessageType.fplan_slot_allocated,
    message: FplSlotSubMessage
}

export type FplSlotRevisedMessage = FplMessage & {
    type: FplMessageType.fplan_slot_revised,
    message: FplSlotSubMessage
}

export type FplSlotMessage = FplSlotAllocatedMessage|FplSlotRevisedMessage

export type FplSlotCancelledMessage = FplMessage & {
    type: FplMessageType.fplan_slot_cancelled,
    message: {
        "reasons": unknown[],
        "comments": unknown[]
    }
}

export type FplSuspendedMessage = FplMessage & {
    type: FplMessageType.fplan_suspended,
    message: {
        "comments": string[],
        "errors": unknown[],
        "newrte": unknown[]
    }
}

export type FplDesuspendedMessage = FplMessage & {
    type: FplMessageType.fplan_desuspended
}

type SsrCodeSubMessage = {
    "ssrcode": string
}

export type FplSsrAssignedMessage = FplMessage & {
    type: FplMessageType.fplan_ssr_assigned,
    message: SsrCodeSubMessage
}

export type FplSsrUpdatedMessage = FplMessage & {
    type: FplMessageType.fplan_ssr_updated,
    message: SsrCodeSubMessage
}

type DelaySubMessage = {
    "eobt": number,
    "previous_eobt": number
}

export type FplDelayedMessge = FplMessage & {
    type: FplMessageType.fplan_delayed,
    message: DelaySubMessage
}

export type FplCancelledMessage = FplMessage & {
    type: FplMessageType.fplan_cancelled,
    message: {
        reason: string
    }
}

export type FplBroughtForwardMessage = FplMessage & {
    type: FplMessageType.fplan_broughtforward,
    message: DelaySubMessage & {
        "previous_fplid": number
    }
}

export type FplDpiUpdated = FplMessage & {
    type: FplMessageType.fplan_dpi_updated,
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
    type: FplMessageType.fplan_msg_operator,
    message: {
        message: string,
        originator: string
    }
}

export const fplMessageIs = {
    slot: function(msg: FplMessage) : msg is FplSlotMessage {
        return msg.type === FplMessageType.fplan_slot_revised || msg.type === FplMessageType.fplan_slot_allocated
    },
    slotCancelled: function(msg: FplMessage) : msg is FplSlotCancelledMessage {
        return msg.type === FplMessageType.fplan_slot_revised || msg.type === FplMessageType.fplan_slot_allocated
    },
    statusChanged: function(msg: FplMessage) : msg is FplStatusChangeMessage {
        return msg.type === FplMessageType.fplan_status_changed
    },
    cancelled: function (msg: FplMessage) : msg is FplCancelledMessage {
        return msg.type === FplMessageType.fplan_cancelled
    },
    delayed: function (msg: FplMessage) : msg is FplDelayedMessge {
        return msg.type === FplMessageType.fplan_delayed
    },
    broughtForward: function (msg: FplMessage) : msg is FplBroughtForwardMessage {
        return msg.type === FplMessageType.fplan_broughtforward
    }
}

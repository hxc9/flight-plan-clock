export type Message<T extends FplSubMessage> = {
    /* unique message ID, 64-bit unsigned integer, used to acknowledge the message */
    "id": number,
    /* the user ID, integer the message applies to */
    "uid": number,
    /* timestamp in seconds since the Unix epoch from when the message originates */
    "timestamp": number,
    /* message type identifier */
    "type": string,
    /* message specific data */
    "message": T
}

export type FplSubMessage = {
    fplid: number,
}

export type FplMessage = Message<FplSubMessage>

export type FplMessages = Array<FplMessage>

export type FplStatusChangeMessage = FplSubMessage & {
    "status_previous": string,
    "status": string
}

export type FplSlotMessage = FplSubMessage & {
    "ctot": string,
    "regulations": Array<string>,
    "regcause": Array<string>,
    "ttos": Array<{fl: string, to: string, ptid: string}>,
}

export type FplSlotCancelledMessage = FplSubMessage & {
    "reasons": Array<any>,
    "comments": Array<any>
}

export type FplDpiUpdated = FplSubMessage & {
    /* target offblock time in hhmm UTC */
    tobt?: string,
    /* taxi time in minutes */
    taxitime?: string,
    /* target takeoff time in hhmm UTC */
    ttot?: string,
    /* assigned SID */
    sid?: string
}
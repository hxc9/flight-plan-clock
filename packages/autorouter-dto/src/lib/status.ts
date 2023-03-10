export enum Status {
    Created = 'created',
    Filed = 'filed',
    ManualCorrection = 'manual_correction',
    Departed = 'departed',
    Cancelled = 'cancelled',
    Suspended = 'suspended',
    Closed = 'closed',
    Arriving = 'arriving',
    Arrived = 'arrived',
    Terminated = 'terminated',
    Rejected = 'rejected',
}

export function allowedTransitionFrom(from: Status, to: Status): boolean {
    return allTransitionsFrom(from).includes(to)
}

export function allTransitionsFrom(from: Status): Status[] {
    switch (from) {
        case Status.Created:
            return [Status.Filed, Status.ManualCorrection]
        case Status.ManualCorrection:
            return [Status.Filed, Status.Rejected]
        case Status.Filed:
            return [Status.Departed, Status.Suspended, Status.Cancelled]
        case Status.Departed:
            return [Status.Terminated, Status.Arriving, Status.Closed]
        case Status.Suspended:
            return [Status.Filed, Status.Cancelled, Status.Closed]
        case Status.Cancelled:
            return []
        case Status.Arriving:
            return [Status.Arrived, Status.Closed]
        case Status.Arrived:
            return [Status.Closed]
        case Status.Terminated:
            return [Status.Closed]
        case Status.Rejected:
            return [Status.Closed]
        case Status.Closed:
            return []
    }
}

export function eobtCanBeChanged(status: Status) : boolean {
    switch (status) {
        case Status.Created:
        case Status.Filed:
        case Status.Suspended:
        case Status.ManualCorrection:
            return true;
        case Status.Departed:
        case Status.Cancelled:
        case Status.Closed:
        case Status.Arriving:
        case Status.Arrived:
        case Status.Terminated:
        case Status.Rejected:
            return false
    }
}

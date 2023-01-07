export default class Status {
    static readonly values : Array<Status> = []

    static Created = new Status('created', [], 1)
    static ManualCorrection = new Status('manual_correction', [Status.Created], 3)
    static Filed = new Status('filed', [Status.Created, Status.ManualCorrection], 2)
    static Departed = new Status('departed', [Status.Filed], 4)
    static Suspended = new Status('suspended', [Status.Filed], 6)
    static Cancelled = new Status('cancelled', [Status.Filed, Status.Suspended], 5)
    static Arriving = new Status('arriving', [Status.Departed], 8)
    static Arrived = new Status('arrived', [Status.Arriving], 9)
    static Terminated = new Status('terminated', [Status.Departed],10) // ATC services terminated
    static Rejected = new Status('rejected', [Status.ManualCorrection], 11)
    static Closed = new Status('closed', [Status.Terminated, Status.Departed, Status.Suspended, Status.Arriving, Status.Arrived, Status.Rejected], 7)

    readonly name: string;
    readonly parents: Array<Status>;
    private readonly order: number

    private constructor(name: string, parents: Array<Status>, order: number) {
        this.name = name
        this.parents = parents
        this.order = order
        Status.values.push(this)
        Status.values.sort((a, b) => a.order - b.order)
    }

    allowedTransitionFrom(from: Status): boolean {
        return this.parents.includes(from)
    }

    canTransitionTo(): Array<Status> {
        return Status.values.filter((v) => v.allowedTransitionFrom(this))
    }

    static fromString(name: string|null) : Status {
        const res = Status.values.find((v) => v.name === name)

        if (res === undefined) throw new UnknownStatusError()

        return res
    }
}

Status.Filed.parents.push(Status.Suspended)

class UnknownStatusError extends Error {}
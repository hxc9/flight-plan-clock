import dayjs from './dayjs'

export function parseCtot(ctotString: string | null | undefined, eobtTimestamp: number | undefined): number | undefined {

    if (!ctotString || !eobtTimestamp) return

    const parsedCtot = /^(\d\d):?(\d\d)$/.exec(ctotString)
    if (!parsedCtot) {
        return
    }
    const [, hours, minutes] = parsedCtot

    const eobt = dayjs.unix(eobtTimestamp).utc()

    let ctot = eobt.hour(+hours).minute(+minutes)
    if (ctot.isBefore(eobt)) {
        ctot = ctot.add(1, 'day')
    }
    return ctot.unix()
}

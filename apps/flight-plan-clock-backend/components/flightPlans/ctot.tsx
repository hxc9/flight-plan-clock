import dayjs from "dayjs";
import utc from "dayjs/plugin/utc"
import {ZuluTimestamp} from "../time/zuluTimestamp";
import {getFplCtot} from "../../lib/ctotService";

dayjs.extend(utc)

export const Ctot = async ({fplId, eobt: eobtTimestamp} : {fplId: number, eobt: number}) : Promise<JSX.Element> =>  {
    const ctotString = await getFplCtot(fplId)

    if (ctotString) {
        const parsedCtot = /^(\d\d):?(\d\d)$/.exec(ctotString)
        if (parsedCtot) {
            const [, hours, minutes] = parsedCtot
            const eobt = dayjs.unix(eobtTimestamp).utc()
            let ctot = eobt.hour(+hours).minute(+minutes)
            if (ctot.isBefore(eobt)) {
                ctot = ctot.add(1, 'day')
            }
            return <ZuluTimestamp unixTimestamp={ctot.unix()} withDate={false} withDelta={true}/>
        }
    }

    return <>{ctotString}</>
}
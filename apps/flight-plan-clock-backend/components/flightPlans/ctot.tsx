import dayjs from "dayjs";
import utc from "dayjs/plugin/utc"
import {ZuluTimestamp} from "../time/zuluTimestamp";
import {getFplCtot, parseCtot} from "../../lib/ctotService";

dayjs.extend(utc)

export const Ctot = async ({fplId, eobt: eobtTimestamp} : {fplId: number, eobt: number}) : Promise<JSX.Element> =>  {
    const ctotString = await getFplCtot(fplId)

    const ctot = parseCtot(ctotString, eobtTimestamp)

    if (ctot) {
        return <ZuluTimestamp unixTimestamp={ctot.unix()} withDate={false} withDelta={true}/>
    }

    return <>{ctotString}</>
}
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc"
import {ZuluDelta} from "./zuluDelta";

dayjs.extend(utc)

export const ZuluTimestamp = ({
                                  unixTimestamp,
                                  withDate = true,
                                  withDelta = false
                              }: { unixTimestamp: number, withDate?: boolean, withDelta?: boolean }): JSX.Element => <>
    {unixTimestamp ? dayjs.unix(unixTimestamp).utc().format((withDate ? 'YYYY/MM/DD ' : '') + 'HH:mm[Z]') : null}
    {unixTimestamp && withDelta ? <ZuluDelta unixTimestamp={unixTimestamp}/>: null}
</>
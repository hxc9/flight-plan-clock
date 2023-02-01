import dayjs from "dayjs";
import utc from "dayjs/plugin/utc"

dayjs.extend(utc)

export const ZuluTimestamp = ({unixTimestamp} : {unixTimestamp: number}) : JSX.Element => <>
    {unixTimestamp ? dayjs.unix(unixTimestamp).utc().format('YYYY/MM/DD HH:mm[Z]') : null}
</>

export const ZuluTimestampShort = ({unixTimestamp} : {unixTimestamp: number}) : JSX.Element => <>
    {unixTimestamp ? dayjs.unix(unixTimestamp).utc().format('HH:mm[Z]') : null}
</>

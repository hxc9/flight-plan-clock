import dayjs, {Dayjs} from "dayjs";
import utc from "dayjs/plugin/utc"
import RelativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(utc)
dayjs.extend(RelativeTime, {thresholds: [
    { l: 's', r: 44, d: 'second' },
    { l: 'm', r: 70 },
    { l: 'mm', r: 120, d: 'minute' },
    { l: 'h', r: 2 },
    { l: 'hh', r: 48, d: 'hour' },
    { l: 'd', r: 2 },
    { l: 'dd', r: 29, d: 'day' },
    { l: 'M', r: 1 },
    { l: 'MM', r: 11, d: 'month' },
    { l: 'y', r: 1 },
    { l: 'yy', d: 'year' }
]})

export default dayjs

export {Dayjs}
import styles from './timeCard.module.css'
import dayjs, {Dayjs} from "../../../lib/dayjs";
import TimeFromTick from "../../../components/timeFromTick";

export function TimeCard({type, time: timestamp} : {type: "EOBT"|"CTOT", time?: number}) {
    const config = configs[type]
    const time = timestamp ? dayjs.unix(timestamp).utc() : undefined
    return <div className={styles.timeCard + ' ' + config.style}>
        <h1 className={styles.topRow}>{config.title}</h1>
        <div className={styles.midRow}>
            <h1>{hhmmZ(time)}</h1>
            <p>{time ? config.interval(time) : '\u00A0'}</p>
        </div>
        <div className={styles.bottomRow}>
            {timestamp ? <TimeFromTick time={timestamp}/> : '\u00A0'}
        </div>
    </div>
}

const configs = {
    EOBT: {
        title: 'EOBT',
        style: styles.eobtCard,
        interval: (time: Dayjs) => interval(time, -15, 15)
    },
    CTOT: {
        title: 'CTOT',
        style: styles.ctotCard,
        interval: (time: Dayjs) => interval(time, -5, 10)
    }
}

function interval(time: Dayjs, start: number, end: number) {
    const rangeStart = hhmm(time.add(start, 'minutes'))
    const rangeEnd = hhmm(time.add(end, 'minutes'))
    return `[${rangeStart} - ${rangeEnd}]`
}

function hhmm(time: Dayjs) {
    return time.format("HH:mm")
}

function hhmmZ(time?: Dayjs) {
    return time?.format("HH:mm[Z]")??'--:--'
}
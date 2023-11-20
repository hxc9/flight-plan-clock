import dayjs, {Dayjs} from "@/lib/dayjs";
import styles from "./dateTimeFields.module.css"
import { useContext } from "react";
import { ClockContext } from "./clockContext";


export function DateValue({ value, format, fallback, style } : {value: number | undefined, format: DynamicDataFormatter, fallback?: string, style?: DynamicDataStyler}) {
    return <span className={(style && value) ? timestampStyles[style](value) : ''}>
        {value ? timestampFormatters[format](value) : fallback}
    </span>
}

export function TimeFromTick({time: timestamp, fallback}: {time: number | undefined, fallback?: string}) {
    const tick = useContext(ClockContext)
    if (!timestamp) return <>{fallback}</>
    const time = dayjs.unix(timestamp).utc()
    return <>{time.from(tick)}</>
}

export type DynamicDataFormatter = 'date' | 'time' | 'eobtInterval' | 'ctotInterval'
export type DynamicDataStyler = 'eobtMain' | 'ctotMain'

type Limits = [number, number]

const eobtLimits : Limits = [-15, 15]
const ctotLimits : Limits = [-5, 10]

const timestampFormatters: { [K in DynamicDataFormatter]: (value: number) => string } = {
    date: (timestamp: number) => formatTimestamp(timestamp, 'YYYY/MM/DD'),
    time: (timestamp: number) => formatTimestamp(timestamp, 'HH:mm[Z]'),
    eobtInterval: (timestamp: number) => interval(timestamp, ...eobtLimits),
    ctotInterval: (timestamp: number) => interval(timestamp, ...ctotLimits)
}

const timestampStyles: { [K in DynamicDataStyler] : (value: number) => string} = {
    eobtMain: (timestamp: number) => isInInterval(timestamp, ...eobtLimits) ? styles.inWindow : '',
    ctotMain: (timestamp: number) => isInInterval(timestamp, ...ctotLimits) ? styles.inWindow : ''
}

function formatTimestamp(timestamp: number, format: string) {
    return dayjs.unix(timestamp).utc().format(format)
}

function interval(timestamp: number, start: number, end: number) {
    const [rangeStart, rangeEnd] = range(timestamp, start, end)
    return `[${hhmm(rangeStart)} - ${hhmm(rangeEnd)}]`
}

function isInInterval(timestamp: number, start: number, end: number) {
    return dayjs().utc().isBetween(...range(timestamp, start, end))
}

function range(timestamp: number, start: number, end: number) : [Dayjs, Dayjs] {
    const time = dayjs.unix(timestamp).utc()
    const rangeStart = time.add(start, 'minutes')
    const rangeEnd = time.add(end, 'minutes')
    return [rangeStart, rangeEnd]
}

function hhmm(time: Dayjs) {
    return time.format("HH:mm")
}
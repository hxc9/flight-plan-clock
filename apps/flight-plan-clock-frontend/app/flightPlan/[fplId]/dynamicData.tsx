'use client'

import {FlightPlanFull} from "flight-plan-clock-dto";
import dayjs, {Dayjs} from "../../../lib/dayjs";
import React, {createContext, useContext} from "react";
import {FlightContext} from "./flightContext";
import TimeFromTick from "../../../components/timeFromTick";
import styles from './dynamicData.module.css'

const DynamicDataContext = createContext<any>(undefined)

export function DynamicData<K extends keyof FlightPlanFull, T extends FlightPlanFull[K]>({
                                                                                             attr,
                                                                                             baseValue, children
                                                                                         }: { attr: K, baseValue?: T, isDayjs?: boolean, children: React.ReactNode }) {
    const fplUpdate = useContext(FlightContext)
    const value = (fplUpdate && fplUpdate[attr]) ?? baseValue
    return <DynamicDataContext.Provider value={value}>
        {children}
    </DynamicDataContext.Provider>
}

export function DynamicCtot({
                                baseCtot, baseEobt, children
                            }: { baseCtot: string | null | undefined, baseEobt: number, children: React.ReactNode }) {
    const fplUpdate = useContext(FlightContext)
    let value = fplUpdate?.ctot ?? baseCtot
    let eobt = fplUpdate?.eobt ?? baseEobt
    let parsedCtot = parseCtot(value, eobt)?.unix()
    return <DynamicDataContext.Provider value={parsedCtot}>
        {children}
    </DynamicDataContext.Provider>
}

export function PlainValue({}) {
    const value = useContext(DynamicDataContext)
    return <>{value}</>
}

export function DateValue({format, fallback, style}: { format: DynamicDataFormatter, fallback?: string, style?: DynamicDataStyler }) {
    const value: number | undefined = useContext(DynamicDataContext)
    return <span className={style && value ? timestampStyles[style](value) : ''}>{value ? timestampFormatters[format](value) : fallback}</span>
}

export function TimeFromTickValue({fallback}: { fallback?: string }) {
    const value: number | undefined = useContext(DynamicDataContext)
    return value ? <TimeFromTick time={value}/> : <>{fallback}</>
}

export function FallbackValue({children}: { children: React.ReactNode }) {
    const value = useContext(DynamicDataContext)
    return value ? <></> : <>{children}</>
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

function parseCtot(ctotString: string | null | undefined, eobtTimestamp: number): Dayjs | undefined {

    if (!ctotString) return

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
    return ctot
}

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

type DynamicDataFormatter = 'date' | 'time' | 'eobtInterval' | 'ctotInterval'
type DynamicDataStyler = 'eobtMain' | 'ctotMain'
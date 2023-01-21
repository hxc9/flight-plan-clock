'use client'

import {FlightPlanFull} from "autorouter-dto";
import dayjs, {Dayjs} from "../../../lib/dayjs";
import React, {createContext, useContext} from "react";
import {FlightContext} from "./flightContext";
import TimeFromTick from "../../../components/timeFromTick";

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

export function DateValue({format, fallback}: { format: DynamicDataFormatter, fallback?: string }) {
    const value: number | undefined = useContext(DynamicDataContext)
    return <>{value ? timestampFormatters[format](value) : fallback}</>
}

export function TimeFromTickValue({fallback} : {fallback?: string}) {
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
    const time = dayjs.unix(timestamp).utc()
    const rangeStart = hhmm(time.add(start, 'minutes'))
    const rangeEnd = hhmm(time.add(end, 'minutes'))
    return `[${rangeStart} - ${rangeEnd}]`
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

const timestampFormatters: { [K in DynamicDataFormatter]: (value: number) => string } = {
    date: (timestamp: number) => formatTimestamp(timestamp, 'YYYY/MM/DD'),
    time: (timestamp: number) => formatTimestamp(timestamp, 'HH:mm[Z]'),
    eobtInterval: (timestamp: number) => interval(timestamp, -15, 15),
    ctotInterval: (timestamp: number) => interval(timestamp, -5, 10)
}

export type DynamicDataFormatter = 'date' | 'time' | 'eobtInterval' | 'ctotInterval'
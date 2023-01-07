"use client"

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc"
import duration from "dayjs/plugin/duration"
import {useContext, useEffect, useMemo, useState} from "react";
import styles from './zuluDelta.module.css'
import {ClockContext} from "../clockContext";

dayjs.extend(utc)
dayjs.extend(duration)

export const ZuluDelta = ({unixTimestamp} : {unixTimestamp: number}) : JSX.Element => {
    const tick = useContext(ClockContext)
    const [delta, setDelta] = useState<duration.Duration|null>()
    const [sign, setSign] = useState('')
    const timestamp = useMemo(() => dayjs.unix(unixTimestamp).utc(), [unixTimestamp])

    function refreshDelta() {
        const diff = tick.diff(timestamp)
        const dur = dayjs.duration(Math.abs(diff))
        if (dur.subtract(dayjs.duration(1, 'd')).asSeconds() < 0) {
            setDelta(dur)
            setSign(diff >= 0 ? '+' : '-')
        } else {
            setDelta(null)
            setSign('')
        }
    }

    useEffect(refreshDelta, [timestamp, tick])

    return <span className={styles.delta}>{sign}{delta?.format('HH:mm')}</span>
}
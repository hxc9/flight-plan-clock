"use client"

import {useContext, useEffect, useState} from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc"
import {ClockContext} from "../clockContext";

dayjs.extend(utc)

export const ZuluClock = () : JSX.Element => {
    const timestamp = useContext(ClockContext)
    const [tick, setTick] = useState(true)

    useEffect(() => {
        const timerId = setInterval(() => {
            setTick(!tick)
        }, 1000)
        return () => {
            clearInterval(timerId)
        }
    }, [tick])

    return timestamp ? <>
        {timestamp.format(`HH${tick ? ':' : ' '}mm[Z]`)}
    </> : <>&nbsp;</>
}
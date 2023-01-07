"use client"

import {useEffect, useState} from "react";
import dayjs, {Dayjs} from "dayjs";
import utc from "dayjs/plugin/utc"

dayjs.extend(utc)

export const ZuluClock = () : JSX.Element => {
    const [timestamp, setTimestamp] = useState<Dayjs>(dayjs().utc())
    const [started, setStarted] = useState(false)

    function refreshClock() {
        setTimestamp(dayjs().utc())
        setStarted(true)
    }

    useEffect(() => {
        const timerId = setInterval(refreshClock, 500)
        return () => {
            clearInterval(timerId)
        }
    }, [])

    return timestamp ? <>
        {timestamp.format(`HH${!started ||timestamp.get('s') % 2 ? ':' : ' '}mm[Z]`)}
    </> : <>&nbsp;&nbsp;:&nbsp;&nbsp;&nbsp;</>
}
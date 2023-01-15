'use client'

import React, {createContext, useEffect, useState} from "react";
import dayjs from "../lib/dayjs";

export const ClockContext = createContext(getTick())

export default function ClockProvider({children} : {children : React.ReactNode}) {
    const [tick, setTick] = useState(getTick())

    useEffect(() => {
        let timerId : ReturnType<typeof setTimeout>|null
        function refresh() {
            const now = dayjs().utc()
            setTick(now.startOf('minute'))
            timerId = setTimeout(refresh, now.endOf('minute').diff(now) + 500)
        }
        refresh()
        return () => {timerId && clearTimeout(timerId)}
    }, [])

    return (
            <ClockContext.Provider value={tick}>
                {children}
            </ClockContext.Provider>
            )
}

function getTick() {
    return dayjs().utc().startOf('minute')
}
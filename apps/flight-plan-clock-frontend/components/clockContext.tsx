"use client"

import {createContext, ReactNode, useEffect, useState} from "react";
import dayjs from "@/lib/dayjs";

export const ClockContext = createContext(getTick())

export function ClockProvider({children}: { children: ReactNode }) {
    const [tick, setTick] = useState(getTick())

    useEffect(() => {
        let timerId : ReturnType<typeof setTimeout>|null = null
        function refresh() {
            const now = dayjs().utc()
            setTick(now.startOf('minute'))
            timerId = setTimeout(refresh, now.endOf('minute').diff(now) + 250)
        }
        refresh()
        return () => { timerId && clearTimeout(timerId) }
    }, []);

    return (
        <ClockContext.Provider value={tick}>
            {children}
        </ClockContext.Provider>
    )
}

function getTick() {
    return dayjs().utc().startOf('minute')
}
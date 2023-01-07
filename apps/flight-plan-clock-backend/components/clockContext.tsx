'use client'

import React, {createContext, useEffect, useState} from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc"

dayjs.extend(utc)

export const ClockContext = createContext(dayjs().utc().startOf('minute'))

export default function ClockProvider({children} : {children : React.ReactNode}) {
    const [tick, setTick] = useState<dayjs.Dayjs>(dayjs().utc().startOf('minute'))

    useEffect(() => {
        let timerId : number|null
        function refresh() {
            const now = dayjs().utc()
            setTick(now.startOf('minute'))
            setTimeout(refresh, now.endOf('minute').diff(now) + 500)
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
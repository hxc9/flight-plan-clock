"use client"

import React, {createContext, useState} from "react";
import dayjs, {Dayjs} from "../lib/dayjs";

export const RefreshContext = createContext<RefreshState>({
    lastRefresh: undefined,
    didRefresh: function (timestamp: number) {}
})

export function RefreshContextProvider({children} : {children : React.ReactNode}) {
    const [context, setContext] = useState<RefreshState>({
        lastRefresh: undefined,
        didRefresh: function (timestamp: number) {
            const newVal = dayjs.unix(timestamp).utc()
            if (!context.lastRefresh || newVal.isAfter(context.lastRefresh)) {
                setContext({...context, lastRefresh: dayjs.unix(timestamp).utc()})
            }
        }
    })

    return <RefreshContext.Provider value={context}>
        {children}
    </RefreshContext.Provider>
}

type RefreshState = {lastRefresh: Dayjs|undefined, didRefresh: (timestamp: number) => void}
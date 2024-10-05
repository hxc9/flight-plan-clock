"use client"

import {createContext, ReactNode, useCallback, useState} from "react";
import dayjs, {Dayjs} from "@/lib/dayjs";

type RefreshContextState = {
    lastRefresh?: Dayjs,
    didRefresh: (timestamp: number) => void
}

const initialContext : RefreshContextState = {
    didRefresh: function (timestamp) {
        const newVal = dayjs.unix(timestamp).utc()
        if (!timestamp || newVal.isAfter(timestamp)) {
            this.lastRefresh = newVal
        }
    }
}

export const RefreshContext = createContext<RefreshContextState>(initialContext)

export function RefreshContextProvider({children} : {children: ReactNode}) {
    const [lastRefresh, setRefresh] = useState<Dayjs|undefined>()

    const didRefresh = useCallback((timestamp: number) => {
        const newVal = dayjs.unix(timestamp).utc()
        if (!timestamp || newVal.isAfter(timestamp)) {
            setRefresh(newVal)
        }
    }, [])
    
    return <RefreshContext.Provider value={{lastRefresh, didRefresh}}>
        {children}
    </RefreshContext.Provider>
}

"use client"

import {useContext, useEffect, useState} from "react";
import {RefreshContext} from "@/components/refreshContext";

export default function RefreshInfo() {
    const {lastRefresh} = useContext(RefreshContext)
    
    const [updated, setUpdated] = useState(lastRefresh?.fromNow())
    
    useEffect(() => {
        let timerId : ReturnType<typeof setTimeout> | undefined = undefined
        function refresh() {
            setUpdated(lastRefresh?.fromNow())
            timerId = setTimeout(refresh, 30_000)
        }
        refresh()
        return () => { timerId && clearTimeout(timerId) }
    }, [lastRefresh])
    
    return <>{updated ? `last FPL change: ${updated}` : null}</>
}

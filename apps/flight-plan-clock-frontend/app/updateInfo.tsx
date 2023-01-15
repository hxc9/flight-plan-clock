"use client"

import {useContext, useEffect, useState} from "react";
import {RefreshContext} from "../components/refreshContext";

export default function UpdateInfo({}) {
    const {lastRefresh} = useContext(RefreshContext)

    const [updated, setUpdated] = useState(lastRefresh?.fromNow())

    useEffect(() => {
        let timerId : ReturnType<typeof setTimeout>|undefined
        function refresh() {
            setUpdated(lastRefresh?.fromNow())
            timerId = setTimeout(refresh, 60_000)
        }
        refresh()
        return () => {timerId && clearTimeout(timerId)}
        }, [lastRefresh])

    return updated ? <>last updated: {updated}</> : ""
}
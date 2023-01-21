"use client"

import {useContext, useEffect} from "react";
import {RefreshContext} from "./refreshContext";

export function RefreshCanary({timestamp} : {timestamp?: number}) {
    const {didRefresh} = useContext(RefreshContext)

    useEffect(() => {
        if (timestamp) {
            didRefresh(timestamp)
        }
    }, [didRefresh, timestamp])

    return <></>
}
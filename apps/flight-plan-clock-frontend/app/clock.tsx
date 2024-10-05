"use client"

import {useContext} from "react";
import {ClockContext} from "@/components/clockContext";

export default function Clock() {
    const tick = useContext(ClockContext)
    return <>{tick.format("HH:mm[Z]")}</>
}
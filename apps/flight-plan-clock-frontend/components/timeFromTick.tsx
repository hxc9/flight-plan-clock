'use client';

import dayjs from "../lib/dayjs";
import {useContext} from "react";
import {ClockContext} from "./clockContext";

export default function TimeFromTick({time: timestamp}: {time: number}) {
    const time = dayjs.unix(timestamp).utc()
    const tick = useContext(ClockContext)
    return <>{time.from(tick)}</>
}
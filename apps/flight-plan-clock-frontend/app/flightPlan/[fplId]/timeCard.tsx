"use client"

import styles from './timeCard.module.css'
import {DateValue, DynamicDataFormatter, DynamicDataStyler, TimeFromTick} from "@/components/dateTimeFields";
import React from "react";

export function Eobt({eobt}: {eobt: number | undefined}) {
    return <TimeCard name="EOBT" time={eobt} format="eobtInterval" style="eobtMain"/>
}

export function Ctot({ctot}: {ctot: number | undefined}) {
    return <TimeCard name="CTOT" time={ctot} format="ctotInterval" style="ctotMain">
        <i>No slot allocated</i>
    </TimeCard>
}

function TimeCard({name, time, style, format, children}: {name: string, time: number | undefined, style: DynamicDataStyler, format: DynamicDataFormatter, children?: React.ReactNode}) {
    return <div>
        <h1 className={styles.topRow}>{name}</h1>
        <div className={styles.midRow}>
            <h1>
                <DateValue value={time} format="time" style={style}/>
            </h1>
            <p>
                {time ? <DateValue value={time} format={format} fallback={'\u00A0'}/>
                    : children }
            </p>
        </div>
        <div className={styles.bottomRow}>
            <TimeFromTick time={time} fallback={'\u00A0'}/>
        </div>
    </div>
}

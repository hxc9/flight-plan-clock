"use client"

import styles from './flightPlanCard.module.css'
import {useContext, useEffect, useMemo, useState} from "react";
import {SocketContext} from "@/components/socketContext";
import {FlightPlanFull, RefiledMessage, UpdateMessage} from "flight-plan-clock-dto";
import {useRouter} from "next/navigation";
import CallSign from "@/components/callSign";
import {DateValue} from "@/components/dateTimeFields";
import {Metar} from "./metar";
import {Ctot, Eobt} from "./timeCard";
import {parseCtot} from "@/lib/ctotParser";
import {RefreshContext} from "@/components/refreshContext";

export function FlightPlanCard({fplId}: {fplId: number}) {
    const router = useRouter()
    const socket = useContext(SocketContext)
    const {didRefresh} = useContext(RefreshContext)
    const [fpl, updateFpl] = useState<Partial<FlightPlanFull>>({})

    useEffect(() => {
        if (socket && fplId) {
            console.log("Subscribing to fpl-change-" + fplId)
            function emitWatchRequest() {
                socket && socket.timeout(5000).emit("watch-flightPlan", fplId, (err: Error, response: UpdateMessage) => {
                    if (err) {
                        emitWatchRequest()
                    } else {
                        updateFpl((previous) => { return {...previous, ...response.update} })
                        didRefresh(response.timestamp)
                    }
                })
            }
            emitWatchRequest()
            socket.io.on("reconnect", emitWatchRequest)
            socket.on("fpl-change-" + fplId, (msg: UpdateMessage) => {
                updateFpl((previous) => { return {...previous, ...msg.update} })
                didRefresh(msg.timestamp)
            })
            socket.on("fpl-refiled-" + fplId, (msg: RefiledMessage) => {
                didRefresh(msg.timestamp)
                router.push('/flightPlan/' + msg.refiledAs)
            })
            return () => {
                socket && socket.off("fpl-change-" + fplId)
                socket && socket.off("fpl-refiled-" + fplId)
                socket && socket.io.off("reconnect", emitWatchRequest)
                socket && socket.emit("unwatch-flightPlan", fplId)
            }
        }
    }, [router, socket, fplId, didRefresh]);

    const ctot = useMemo(() => {
        return parseCtot(fpl.ctot, fpl.eobt)
    }, [fpl.ctot, fpl.eobt])

    return <>
        <div className={styles.flightCard}>
            <div className={styles.topRow}>
                <h2><CallSign callSign={fpl.callSign}/></h2>
                <h2>{fpl.departure} → {fpl.destination}</h2>
            </div>
            <div className={styles.midRow}>
                <div>
                    <h3>
                        <DateValue value={fpl.eobt} format="date"/>
                    </h3>
                    <h3>
                        <DateValue value={fpl.eobt} format="time"/>
                    </h3>
                </div>
                <h2 className={styles.status}>
                    {fpl.status}
                </h2>
            </div>
            <div className={styles.midRow}>
                <div>
                    <Metar icaoCode={fpl.departure}/>
                </div>
                <div>
                    <Metar icaoCode={fpl.destination}/>
                </div>
            </div>
            <div className={styles.bottomRow}>
                <p><b>Route:</b></p>
                <p>{fpl.route}</p>
            </div>
        </div>
        <div className={styles.timesBlock}>
            <Eobt eobt={fpl.eobt} />
            <Ctot ctot={ctot} />
        </div>
    </>
}

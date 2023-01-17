"use client"

import {useCallback, useContext, useEffect} from "react";
import {SocketContext} from "../components/socketContext";
import useSWR, {SWRResponse, useSWRConfig} from "swr";
import {FlightPlanResponse, FlightPlansResponse} from "autorouter-dto";
import {fetcher} from "../lib/restApi";

export default function RevalidationRequester() {
    const {
        data,
        mutate: mutateListCall
    }: SWRResponse<FlightPlansResponse>
        = useSWR('/api/flightPlans', fetcher, {
        refreshInterval: 60_000
    })

    const { mutate } = useSWRConfig()

    const handler = useCallback(async () => {
        await mutateListCall()
    }, [mutate])

    const socket = useContext(SocketContext)

    useEffect(() => {
        if (socket) {
            socket.on("new-messages", handler)
        }
        return () => {socket && socket.off("new-messages", handler)}
    }, [socket, handler])

    useEffect(() => {
        if (data) {
            Promise.all(data.flightPlans.map((fpl) => {
                const r : FlightPlanResponse = {
                    flightPlan: fpl,
                    lastUpdated: data.lastUpdated
                }
                console.log('caching', '/api/flightPlans/' + fpl.id)
                return mutate(
                    '/api/flightPlans/' + fpl.id,
                    r,
                    { revalidate: false }
                    )
            })).catch(console.error)
        }
    }, [data])

    return <></>
}
"use client"

import {useContext, useEffect, useState} from "react";
import {SocketContext} from "../components/socketContext";
import {useRouter} from "next/navigation";
import dayjs from "../lib/dayjs";

export default function RefreshGovernor() {
    const socket = useContext(SocketContext)
    const router = useRouter()
    const [updateTimestamp, setUpdateTimestamp] = useState(0)

    useEffect(() => {
        if (socket) {
            socket.on("refresh-overview", () => {
                setUpdateTimestamp(dayjs().utc().unix())
                router.refresh()
            })
        }
        return () => {socket && socket.off("refresh-overview")}
    }, [socket])

    useEffect(() => {
        const intervalId = setInterval(() => {
            router.refresh()
        }, 30_000)
        return () => {
            clearInterval(intervalId)
        }
    }, [updateTimestamp])

    return <></>
}
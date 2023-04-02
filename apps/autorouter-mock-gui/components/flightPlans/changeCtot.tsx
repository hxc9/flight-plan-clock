"use client"

import { fetchFromMock } from '@/components/flightPlans/utils';
import styles from "../../app/page.module.css";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc"
import {useRouter} from "next/navigation";
import {useState, useTransition} from "react";

dayjs.extend(utc)

export const ChangeCtot = ({userId, fplId, eobt, hasCtot} : {userId: number, fplId : number, eobt: number, hasCtot: boolean}) : JSX.Element => {

    const router = useRouter();
    const [, startTransition] = useTransition();
    const [, setIsFetching] = useState(false);

    async function handleEobtPlus(minutes : number|null){
        const newCtot = minutes ? dayjs.unix(eobt).utc().add(minutes, 'm').startOf('m') : null
        setIsFetching(true)
        await fetchFromMock(`/api/mock/${userId}/flightPlan/${fplId}`,
            {method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    newCtot: newCtot?.unix()??null
                })})
        setIsFetching(false)
        startTransition(() => {
            router.refresh()
        })
    }

    return <table className={styles.tiny_table}>
        <tbody>
        <tr>
            <td><button onClick={() => handleEobtPlus(null)} disabled={!hasCtot}>X</button></td>
            <td><button onClick={() => handleEobtPlus(5)}>+5</button></td>
            <td><button onClick={() => handleEobtPlus(15)}>+15</button></td>
            <td><button onClick={() => handleEobtPlus(30)}>+30</button></td>
            <td><button onClick={() => handleEobtPlus(60)}>+60</button></td>
            <td><button onClick={() => handleEobtPlus(120)}>+120</button></td>
        </tr>
        </tbody>
    </table>
}
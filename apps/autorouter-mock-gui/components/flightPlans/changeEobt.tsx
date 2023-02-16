"use client"

import { fetchFromMock } from '@/components/flightPlans/utils';
import styles from "../../app/page.module.css";
import dayjs, {Dayjs} from "dayjs";
import utc from "dayjs/plugin/utc"
import {useRouter} from "next/navigation";
import {useState, useTransition} from "react";

dayjs.extend(utc)

export const ChangeEobt = ({fplId, eobt} : {fplId : number, eobt: number}) : JSX.Element => {

    const router = useRouter();
    const [, startTransition] = useTransition();
    const [, setIsFetching] = useState(false);

    async function handleNowPlus(minutes : number) {
        const newEobt = dayjs().utc().add(minutes, 'm').startOf('m')
        await handleEobtChange(newEobt)
    }
    async function handleEobtPlus(minutes : number){
        const computedEobt = dayjs.unix(eobt).utc().add(minutes, 'm').startOf('m')
        const newEobt = computedEobt.minute(Math.floor(computedEobt.minute() / 5) * 5)
        await handleEobtChange(newEobt)
    }

    async function handleEobtChange(newEobt: Dayjs) {
        setIsFetching(true)
        await fetchFromMock(`/api/mock/flightPlan/${fplId}`,
            {method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    newEobt: newEobt.unix()
                })})
        setIsFetching(false)
        startTransition(() => {
            router.refresh()
        })
    }

    return <table className={styles.tiny_table}>
        <tbody>
        <tr>
            <td><button onClick={() => handleNowPlus(-30)}>-30</button></td>
            <td><button onClick={() => handleNowPlus(-15)}>-15</button></td>
            <td><button onClick={() => handleNowPlus(-5)}>-5</button></td>
            <td><button onClick={() => handleNowPlus(0)}>Now</button></td>
            <td><button onClick={() => handleNowPlus(5)}>+5</button></td>
            <td><button onClick={() => handleNowPlus(15)}>+15</button></td>
            <td><button onClick={() => handleNowPlus(30)}>+30</button></td>
            <td><button onClick={() => handleNowPlus(60)}>+60</button></td>
        </tr>
        <tr>
            <td><button onClick={() => handleEobtPlus(-30)}>-30</button></td>
            <td><button onClick={() => handleEobtPlus(-15)}>-15</button></td>
            <td><button onClick={() => handleEobtPlus(-5)}>-5</button></td>
            <td><button onClick={() => handleEobtPlus(0)}>Round</button></td>
            <td><button onClick={() => handleEobtPlus(5)}>+5</button></td>
            <td><button onClick={() => handleEobtPlus(15)}>+15</button></td>
            <td><button onClick={() => handleEobtPlus(30)}>+30</button></td>
            <td><button onClick={() => handleEobtPlus(60)}>+60</button></td>
        </tr>
        </tbody>
    </table>
}
"use client"

import useSWR from 'swr'
import styles from './metar.module.css'
import {useBackend} from "../../../lib/apiClient";

export default function Metar({icaoCode} : {icaoCode: string}) {
    const {data: metar} = useBackend<string>(`/api/metar/${icaoCode}`)

    return <p className={styles.metar}>{metar}</p>
}
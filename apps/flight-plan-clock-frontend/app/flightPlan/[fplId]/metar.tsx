"use client"

import styles from './metar.module.css'
import {useBackend} from "@/lib/apiClient";

export function Metar({icaoCode} : {icaoCode: string | undefined}) {
    const {data: metar} = useBackend<string>(icaoCode ? `/api/metar/${icaoCode}` : null)

    return <p className={styles.metar}>{metar}</p>
}
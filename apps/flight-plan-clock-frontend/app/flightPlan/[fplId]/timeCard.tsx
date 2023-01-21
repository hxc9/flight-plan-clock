import styles from './timeCard.module.css'
import {DateValue, DynamicCtot, DynamicData, FallbackValue, TimeFromTickValue} from "./dynamicData";

export function TimeCardEobt({time: timestamp}: { time?: number }) {
    return <div className={styles.timeCard + ' ' + styles.eobtCard}>
        <h1 className={styles.topRow}>EOBT</h1>
        <div className={styles.midRow}>
            <h1>
                <DynamicData attr='eobt' baseValue={timestamp}>
                    <DateValue format="time" style="eobtMain"/>
                </DynamicData>
            </h1>
            <p>
                <DynamicData attr='eobt' baseValue={timestamp}>
                    <DateValue format="eobtInterval" fallback={'\u00A0'}/>
                </DynamicData>
            </p>
        </div>
        <div className={styles.bottomRow}>
            <DynamicData attr='eobt' baseValue={timestamp}>
                <TimeFromTickValue fallback={'\u00A0'}/>
            </DynamicData>
        </div>
    </div>
}

export function TimeCardCtot({ctot, eobt}: { ctot?: string | null, eobt: number }) {
    return <div className={styles.timeCard + ' ' + styles.ctotCard}>
        <h1 className={styles.topRow}>CTOT</h1>
        <div className={styles.midRow}>
            <h1><DynamicCtot baseCtot={ctot} baseEobt={eobt}>
                <DateValue format="time" style="ctotMain"/>
            </DynamicCtot></h1>
            <p>
                <DynamicCtot baseCtot={ctot} baseEobt={eobt}>
                    <DateValue format="ctotInterval" fallback={'\u00A0'}/>
                    <FallbackValue>
                        <i>No slot allocated</i>
                    </FallbackValue>
                </DynamicCtot>
            </p>
        </div>
        <div className={styles.bottomRow}>
            <DynamicCtot baseCtot={ctot} baseEobt={eobt}>
                <TimeFromTickValue fallback={'\u00A0'}/>
            </DynamicCtot>
        </div>
    </div>
}

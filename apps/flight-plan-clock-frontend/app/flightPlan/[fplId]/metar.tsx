import styles from './metar.module.css'

export default async function Metar({icaoCode} : {icaoCode: string}) {
    const metar = await (await fetch(`https://aviationweather.gov/cgi-bin/data/metar.php?ids=${icaoCode}&format=raw&taf=false`)).text()

    return <p className={styles.metar}>{metar}</p>
}
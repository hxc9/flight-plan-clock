import styles from './page.module.css'
import {Account} from "@/app/login/account";

export default function Login() {

    return <div className={styles.container}>
        <h1>Account settings</h1>
        <Account/>
    </div>
}
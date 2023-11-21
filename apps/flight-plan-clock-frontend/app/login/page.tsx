import styles from './page.module.css'

export default function Login() {

    return <div className={styles.container}>
        <h1>Account settings</h1>
        <p>
            <b>Current status:</b>
            <i>TODO</i>
        </p>
        <p>
            <a href="http://localhost:3002/api/user/login" className={styles.buttonLink}>Login</a>
        </p>
    </div>
}
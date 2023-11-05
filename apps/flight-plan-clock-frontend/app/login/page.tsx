import styles from './page.module.css'

export default function Login() {

    return <div>
        <p>
            <b>Current status:</b>
            <i>TODO</i>
        </p>
        <p>
            <a href="http://localhost:3002/api/oauth2/login" className={styles.buttonLink}>Login</a>
        </p>
    </div>
}
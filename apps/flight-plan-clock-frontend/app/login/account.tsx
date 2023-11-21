"use client"

import {useUser} from "@/components/userContext";
import styles from "./page.module.css";
import {useCallback} from "react";
import {backendUrl} from "@/lib/apiClient";

export function Account() {
    const {user, isLoading, error, mutate} = useUser(false)

    const logoutCallback = useCallback(() => {
        fetch(backendUrl + "/api/user/logout", {method: "POST", credentials: "include"})
            .then(() => {
                // noinspection JSIgnoredPromiseFromCall
                mutate(undefined)
            })
    }, [mutate])

    if (isLoading) {
        return <p>Loading...</p>
    }

    if (error) {
        return <p>Unable to connect to FPL Clock service</p>
    }

    if (!user) {
        return <>
            <p>
                <b>Current status:</b>
            </p>
            <p>
                <i>not logged in</i>
            </p>
            <a href="http://localhost:3002/api/user/login" className={styles.buttonLink}>Login</a>
        </>
    }

    return <>
        <p>
            <b>Current status:</b>
        </p>
        <div>
            <p>
                <i>Logged in as</i>
            </p>
            <p>
                {user.name} {user.lastname} ({user.email})
            </p>
        </div>
        <a href="#" onClick={logoutCallback} className={styles.buttonLink + ' ' + styles.logout}>Logout</a>
    </>}
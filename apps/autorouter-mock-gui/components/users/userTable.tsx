"use client"

import styles from "../../app/page.module.css";
import {DeleteUser} from "@/components/users/deleteUser";
import {useEffect, useTransition} from "react"
import {useRouter} from "next/navigation";

export const UserTable = ({users, selectedUser}: { users: number[], selectedUser?: number }) => {

    const router = useRouter()
    const [, startTransition] = useTransition();

    function selectUser(userId: number | undefined) {
        if (userId != selectedUser) {
            startTransition(() => router.push(userId ? '/' + userId : '/'))
        }
    }

    useEffect(() => {
        if (selectedUser && !users.includes(selectedUser)) {
            selectUser(undefined)
        } else if (!selectedUser && users.length > 0) {
            selectUser(users[0])
        }
    })

    useEffect(() => {
        users.forEach((u) => {
            router.prefetch(('/' + u))
        })
    }, [users])

    function onSelectionChange(e: React.ChangeEvent<HTMLInputElement>) {
        selectUser(+e.target.value)
    }

    return <table className={styles.table}>
        <thead>
        <tr>
            <th>ID</th>
            <th>Active</th>
            <th></th>
        </tr>
        </thead>
        <tbody>
        {users.map(u => <tr key={u}>
            <td>{u}</td>
            <td><input type="radio" value={u} onChange={onSelectionChange} checked={u === selectedUser}/></td>
            <td><DeleteUser userId={u}/></td>
        </tr>)}
        </tbody>
    </table>
}
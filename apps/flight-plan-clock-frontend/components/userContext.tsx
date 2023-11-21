"use client"

import {useBackend} from "@/lib/apiClient";
import {useRouter} from "next/navigation";
import {User} from "autorouter-dto";
import {useEffect} from "react";

export function useUser(redirectIfNotLoggedIn = true) {
    const {data, error, isLoading, mutate} = useBackend<User>("/api/user/me")
    const router = useRouter()

    useEffect(() => {
        if (redirectIfNotLoggedIn && error?.status == 401) {
            router.push("/login")
        }
    }, [error]);

    return {user: data, isLoading, error: error?.status == 401 ? undefined : error, mutate}
}

export function CurrentUser() {
    const {user} = useUser(false)

    return user ? <>{user.email}</> : <i>not logged in</i>
}
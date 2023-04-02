"use client"

import { FormEvent, useTransition } from "react"
import {fetchFromMock} from "@/components/flightPlans/utils";
import {useRouter} from "next/navigation";

export const CreateUser = () => {
    const router = useRouter()
    const [, startTransition] = useTransition()
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        await fetchFromMock(`/api/mock/user`,
            {method: 'PUT'})
        startTransition(() => {
            router.refresh()
        })
    }
    return <form onSubmit={handleSubmit}>
        <input type="submit" value="Create user"/>
    </form>
}
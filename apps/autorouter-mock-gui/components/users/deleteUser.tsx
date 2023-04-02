"use client"

import { FormEvent, useTransition } from "react"
import {fetchFromMock} from "@/components/flightPlans/utils";
import {useRouter} from "next/navigation";

export const DeleteUser = ({userId: id} : {userId: number}) => {
    const router = useRouter()
    const [, startTransition] = useTransition()
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        await fetchFromMock(`/api/mock/user/${id}`,
            {method: 'DELETE'})
        startTransition(() => {
            router.refresh()
        })
    }
    return <form onSubmit={handleSubmit}>
        <input type="submit" value="X"/>
    </form>
}
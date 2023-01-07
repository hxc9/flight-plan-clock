"use client"

import {useRouter} from "next/navigation";
import {useState, useTransition, MouseEvent} from "react";

export const PendingMessage = ({msgId} : {msgId : number}) : JSX.Element => {

    const router = useRouter();
    const [, startTransition] = useTransition();
    const [, setIsFetching] = useState(false);

    async function handleClick(event: MouseEvent<HTMLAnchorElement>){
        event.preventDefault()

        setIsFetching(true)
        await fetch(`/api/message/${msgId}/acknowledge`,
            {method: 'POST'})
        setIsFetching(false)
        startTransition(() => {
            router.refresh()
        })

    }

    return <a href="#" onClick={handleClick}>{'\u2b24'}</a>
}
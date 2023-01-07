"use client"

import {useSelectedLayoutSegment} from "next/navigation";
import Link from "next/link";

export default function Navigation() {
    const segment = useSelectedLayoutSegment()
    return segment ? <Link href="/">Return to list</Link> : null
}
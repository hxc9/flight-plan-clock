import { NextResponse } from 'next/server'

export function responseWithStatus(status: number) : NextResponse {
    return new NextResponse(null, {status})
}

export function okResponse() {
    return responseWithStatus(200)
}

export function notFoundResponse() {
    return responseWithStatus(404)
}

export function errorResponse() {
    return responseWithStatus(500)
}
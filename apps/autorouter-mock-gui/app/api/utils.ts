import {Response} from "next/dist/compiled/@edge-runtime/primitives/fetch";

export function responseWithStatus(status: number) {
    return new Response(null, {status})
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
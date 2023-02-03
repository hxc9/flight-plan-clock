export const fplKey = (fplId: number | string) => `flightPlan:${fplId}`

export function fplCtotKey(fplId: number | string) {
    return fplKey(fplId) + ":ctot"
}

export class FlightPlanNotFoundError extends Error {
}

export class IllegalFlightPlanStatusTransition extends Error {
}

export class IllegalStatusForEobtChange extends Error {}
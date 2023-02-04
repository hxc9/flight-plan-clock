export const fplKey = (fplId: number | string) => `flightPlan:${fplId}`

export function fplCtotKey(fplId: number | string) {
    return fplKey(fplId) + ":ctot"
}

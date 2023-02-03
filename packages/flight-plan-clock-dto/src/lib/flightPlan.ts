import {Status} from "autorouter-dto";


export type FlightPlanMini = {
    id: number,
    eobt: number,
    callSign: string,
    departure: string,
    destination: string,
    status: Status
}

export type FlightPlanFull = FlightPlanMini & {
    ctot?: string | null,
    route?: string
}

export type FlightPlansResponse = {
    flightPlans: FlightPlanMini[], lastUpdated: number
}

export type FlightPlanResponse = {
    flightPlan: FlightPlanFull, lastUpdated: number
}

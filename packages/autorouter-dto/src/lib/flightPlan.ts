import {Status} from "./status";

export type FlightPlan = {
    // the ID of the flight plan, used for all other APIs
    "flightplanid": number,
    // Eurocontrol IFPS flight plan ID
    "ifplid": string,
    // details of the user that filed the plan
    "name": string,
    "lastname": string,
    "email": string,
    // Unix timestamp when the plan was created
    "created": number,
    // Unix timestamp of current off block time
    "eobt": number,
    // departure airport details
    "departure": string,
    "departurename": string,
    // destination airport details
    "destination": string,
    "destinationname": "Geneve",
    // flight plan ICAO string
    "fplan": string,
    // filing method, currently NMB2B or AFTN
    "method": "NMB2B" | "AFTN",
    // filed route distance in nautical miles
    "routedistance": number,
    // great circle distance in nautical miles
    "gcddistance": number,
    // required route fuel in aircraft fuel units
    "routefuel": number,
    // legal minimum fuel in aircraft fuel units
    "minfuel": number,
    // aircraft fuel unit ("l", "lb", "usgal")
    "fuelunit": "l" | "lb" | "usgal",
    // see below for possible status values and state machine transisitions
    "status": Status,
    "callsign": string,
    "aircraftdescription": string
}

export type FlightPlansResult = {
    total: number,
    rows: FlightPlan[]
}

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
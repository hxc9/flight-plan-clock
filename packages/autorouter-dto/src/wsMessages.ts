import {FlightPlanFull} from "./flightPlan";

export interface WsMessage {
    fplId: number
    timestamp: number
}

export interface UpdateMessage extends WsMessage {
    update: Partial<FlightPlanFull>
}

export interface RefiledMessage extends WsMessage{
    refiledAs: number
}
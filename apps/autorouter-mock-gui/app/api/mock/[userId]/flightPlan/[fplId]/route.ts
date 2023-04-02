import {
    ctotService, FlightPlanNotFoundError, flightPlanService
} from 'autorouter-mock-services';
import {errorResponse, notFoundResponse, okResponse} from "../../../../utils";

type Params = {
    params: {
        userId: number,
        fplId: number
    }
}

export async function POST(req: Request, {params: {userId, fplId}} : Params) {
    try {
        const {newStatus, newEobt, newCtot} = await req.json()
        if (newStatus) {
            await flightPlanService.changeFlightPlanStatus(userId, fplId, newStatus)
        }
        if (newEobt) {
            await flightPlanService.changeFlightPlanEobt(userId, fplId, newEobt)
        }
        if (newCtot !== undefined) {
            await ctotService.changeFlightPlanCtot(userId, fplId, newCtot)
        }
        return okResponse()
    } catch (e) {
        if (e instanceof FlightPlanNotFoundError) {
            return notFoundResponse()
        } else {
            console.log(e)
            return errorResponse()
        }
    }
}

export async function DELETE(_: Request, {params: {userId, fplId}} : Params) {
    try {
        await flightPlanService.deleteFlightPlan(userId, fplId)
        return okResponse()
    } catch (e) {
        if (e instanceof FlightPlanNotFoundError) {
            return notFoundResponse()
        } else {
            console.log(e)
            return errorResponse()
        }
    }
}
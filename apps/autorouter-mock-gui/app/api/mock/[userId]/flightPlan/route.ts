import { flightPlanService } from 'autorouter-mock-services';
import {errorResponse, okResponse} from "../../../utils";

export async function PUT(request: Request, {params: {userId}} : {params: {userId: number}}) {
    try {
        await flightPlanService.createFlightPlan(userId);
        return okResponse()
    } catch (e) {
        console.error(e);
        return errorResponse()
    }
}
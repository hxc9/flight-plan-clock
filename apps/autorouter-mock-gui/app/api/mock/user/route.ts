import {userService} from 'autorouter-mock-services'
import {errorResponse, okResponse} from "../../utils";

export async function PUT() {
    try {
        await userService.createUser();
        return okResponse()
    } catch (e) {
        console.error(e);
        return errorResponse()
    }
}
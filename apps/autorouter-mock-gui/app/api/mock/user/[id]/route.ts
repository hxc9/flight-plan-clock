import {userService} from "autorouter-mock-services";
import {errorResponse, okResponse} from "../../../utils";

export async function DELETE(request: Request, {params : {id}}: {params: {id: number}}) {
    try {
        await userService.deleteUser(id)
        return okResponse()
    } catch (e) {
        console.log(e)
        return errorResponse()
    }
}
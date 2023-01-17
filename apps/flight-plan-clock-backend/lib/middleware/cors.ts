import Cors from "cors";
import { NextApiRequest, NextApiResponse } from "next";
import {runMiddleware} from "./utils";

const cors = Cors({})

export function runCorsMiddleware(
        req: NextApiRequest,
        res: NextApiResponse
        ) {
    return runMiddleware(req, res, cors)
}

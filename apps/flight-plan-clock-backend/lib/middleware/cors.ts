// Initializing the cors middleware
// You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
import Cors from "cors";
import { NextApiRequest, NextApiResponse } from "next";

const cors = Cors({})

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(
        req: NextApiRequest,
        res: NextApiResponse,
        fn: Function
        ) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result: any) => {
            if (result instanceof Error) {
                return reject(result)
            }

            return resolve(result)
        })
    })
}

export function runCorsMiddleware(
        req: NextApiRequest,
        res: NextApiResponse
        ) {
    return runMiddleware(req, res, cors)
}

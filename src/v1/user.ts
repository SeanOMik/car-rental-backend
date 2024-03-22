import { NextFunction, Request, Response, Router } from "express";
import { getDb } from "../database";
import { body, matchedData, validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";

let router = Router();

router.post(
    "/login",
    // body validation
    body("email").isEmail(),
    body("password").notEmpty(),

    async (req: Request, res: Response) => {
        // validate that the data is good and make the database query
        const result = validationResult(req);
        if (result.isEmpty()) {
            const data = matchedData(req);

            let db = getDb();
            let id = await db.loginUser(data.email, data.password);

            if (id == -1) {
                return res.status(StatusCodes.NOT_FOUND).send({
                    status: StatusCodes.CONFLICT,
                    message: "Incorrect username or password",
                });
            }

            return res.send({ user_id: id.toString() });
        }

        return res
            .status(StatusCodes.BAD_REQUEST)
            .send({ errors: result.array() });
    },
);

router.post(
    "/register",
    // body validation
    body("email").isEmail(),
    body("password").notEmpty(),

    async (req: Request, res: Response, next: NextFunction) => {
        // validate that the data is good and make the database query
        const result = validationResult(req);
        if (result.isEmpty()) {
            const data = matchedData(req);

            let db = getDb();
            let id = await db.registerUser(data.email, data.password);

            if (id) {
                return res.send({ user_id: id.toString() });
            } else {
                return res.status(StatusCodes.CONFLICT).send({
                    status: StatusCodes.CONFLICT,
                    message: "User with the same email already exists",
                });
            }
        }

        return res
            .status(StatusCodes.BAD_REQUEST)
            .send({ errors: result.array() });
    },
);

module.exports = router;

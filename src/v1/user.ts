import { NextFunction, Request, Response, Router } from "express";
import { getDb } from "../database";
import { body, matchedData, validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";
import { User, UserType } from "../user";

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
            let user = await db.loginUser(data.email, data.password);

            // loginUser returns -1 if there is another user with the same email
            if (!user) {
                return res.status(StatusCodes.NOT_FOUND).send({
                    status: StatusCodes.NOT_FOUND,
                    message: "Incorrect username or password",
                });
            }

            // update session
            req.session.user = user;
            req.session.save();

            return res.send(user);
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
    body("type").optional().isNumeric(),

    async (req: Request, res: Response, next: NextFunction) => {
        // validate that the data is good and make the database query
        const result = validationResult(req);
        if (result.isEmpty()) {
            const data = matchedData(req);

            let user_type;
            if (data.type == 1) {
                user_type = UserType.Vendor;
            } else {
                user_type = UserType.Customer;
            }

            let db = getDb();
            let id = await db.registerUser(data.email, data.password, user_type);

            if (id) {
                // update session
                let user = new User(id, data.email, user_type);
                req.session.user = user;
                req.session.save();

                return res.send({ user_id: id.toString(), user_type: user_type });
            } else {
                // registerUser returns undefined if there is another user with the same email
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

import { Request, Response, Router } from "express";
import { getDb } from "../database";
import { StatusCodes } from "http-status-codes";
import { body, param, validationResult } from "express-validator";

let router = Router();

router.get(
    "/:vehId",

    param("vehId").isInt(),

    async (req: Request, res: Response) => {
        const result = validationResult(req);
        if (result.isEmpty()) {
            return res.status(StatusCodes.BAD_REQUEST);
        }

        let db = getDb();

        let vehicle = await db.getVehicle(parseInt(req.params.vehId));
        if (vehicle == undefined) {
            return res.status(StatusCodes.NOT_FOUND).send();
        }

        res.send(vehicle);
    },
);

router.post(
    "/:vehId/rent",

    param("vehId").isInt(),

    body("lengthInDays").isInt(),

    async (req: Request, res: Response) => {
        const result = validationResult(req);
        if (result.isEmpty()) {
            return res.status(StatusCodes.BAD_REQUEST);
        }

        if (req.session.user) {
            let db = getDb();
            const vehId = parseInt(req.params.vehId);
            const lengthInDays = req.body.lengthInDays;

            const veh = await db.getVehicle(vehId);
            if (veh == undefined) {
                // ensure that the provided vehicle id is a valid vehicle
                return res.status(StatusCodes.NOT_FOUND).send();
            } else if (veh.isRented) {
                // ensures that this vehicle is not already rented
                return res.status(StatusCodes.CONFLICT).send();
            }

            await db.rentVehicle(vehId, req.session.user.uid, lengthInDays);
            res.status(StatusCodes.OK).send();
        } else {
            res.status(StatusCodes.UNAUTHORIZED).send();
        }
    },
);

module.exports = router;

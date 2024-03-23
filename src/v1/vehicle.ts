import { Request, Response, Router } from "express";
import { getDb } from "../database";
import { StatusCodes } from "http-status-codes";
import { param } from "express-validator";

let router = Router();

router.get(
    "/:vehId",

    param("vehId").isInt(),

    async (req: Request, res: Response) => {
        if (req.session.user) {
            let db = getDb();

            let vehicle = await db.getVehicle(parseInt(req.params.vehId, 10));
            res.send(vehicle);
        } else {
            res.status(StatusCodes.UNAUTHORIZED).send();
        }
    },
);

module.exports = router;
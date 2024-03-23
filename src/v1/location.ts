import { Request, Response, Router } from "express";
import { getDb } from "../database";
import { StatusCodes } from "http-status-codes";
import { param } from "express-validator";

let router = Router();

router.get(
    "/:locationId/vehicles",
    
    param("locationId").isInt(),

    async (req: Request, res: Response) => {
        if (req.session.user) {
            let db = getDb();

            let vehicles = await db.getLocationVehicles(parseInt(req.params.locationId, 10), false);
            if (vehicles) {
                res.send(vehicles);
            } else {
                res.status(StatusCodes.NOT_FOUND);
            }
        } else {
            res.status(StatusCodes.UNAUTHORIZED).send();
        }
    },
);

router.get(
    "/",
    async (req: Request, res: Response) => {
        if (req.session.user) {
            let db = getDb();

            let locs = await db.getLocations();
            res.send(locs);
        } else {
            res.status(StatusCodes.UNAUTHORIZED).send();
        }
    },
);

router.get(
    "/:locationId",

    param("locationId").isInt(),

    async (req: Request, res: Response) => {
        if (req.session.user) {
            let db = getDb();

            let loc = await db.getLocation(parseInt(req.params.locationId, 10));
            if (loc) {
                res.send(loc);
            } else {
                res.status(StatusCodes.NOT_FOUND);
            }
        } else {
            res.status(StatusCodes.UNAUTHORIZED).send();
        }
    },
);

module.exports = router;
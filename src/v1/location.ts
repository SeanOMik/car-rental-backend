import { Request, Response, Router } from "express";
import { getDb } from "../database";
import { StatusCodes } from "http-status-codes";
import { query, body, param, matchedData, validationResult } from "express-validator";
import { Vehicle } from "../vehicle";
import { UserType } from "../user";
import { Location } from "../location";

let router = Router();

router.get(
    "/:locationId/vehicles",

    param("locationId").isInt(),
    query("includeRented").optional().isBoolean(),

    async (req: Request, res: Response) => {
        if (req.session.user) {
            /* const result = validationResult(req);
            if (result.isEmpty()) {
                return res.status(StatusCodes.BAD_REQUEST).send();
            } */

            // if includeRented is provided, convert it to a boolean, if its missing, default to false.
            const includeRented = req.query.includeRented ?
                req.query.includeRented.toString().toLowerCase() == 'true' : false;

            let db = getDb();
            let vehicles = await db.getLocationVehicles(
                parseInt(req.params.locationId),
                includeRented,
            );
            
            if (vehicles) {
                res.send(vehicles);
            } else {
                res.status(StatusCodes.NOT_FOUND).send();
            }
        } else {
            res.status(StatusCodes.UNAUTHORIZED).send();
        }
    },
);

router.post(
    "/:locationId/vehicles",

    param("locationId").isInt(),

    body("make").notEmpty(),
    body("model").notEmpty(),
    body("year").isInt(),
    body("seats").isInt(),
    body("doors").isInt(),
    body("bodyType").notEmpty(),
    body("rentCostPerDay").isNumeric(),
    body("color").notEmpty(),
    body("isRented").optional().isBoolean(),

    async (req: Request, res: Response) => {
        if (req.session.user && req.session.user.uty == UserType.Vendor) {
            let db = getDb();

            // make sure the location exists before we try to add a vehicle that references it.
            let loc = db.getLocation(parseInt(req.params.locationId));
            if (loc == undefined) {
                return res.status(StatusCodes.NOT_FOUND).send({
                    status: StatusCodes.NOT_FOUND,
                    message: "Could not find location"
                });
            }

            var v: Vehicle = req.body;
            v.locationId = parseInt(req.params.locationId);

            let id = await db.newVehicle(v);
            if (id) {
                v.uid = id;
                res.send(v);
            } else {
                res.status(StatusCodes.NOT_FOUND).send();
            }
        } else {
            res.status(StatusCodes.UNAUTHORIZED).send();
        }
    },
);

router.get("/", async (req: Request, res: Response) => {
    if (req.session.user) {
        let db = getDb();

        let locs = await db.getLocations();
        res.send(locs);
    } else {
        res.status(StatusCodes.UNAUTHORIZED).send();
    }
});

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
                res.status(StatusCodes.NOT_FOUND).send();
            }
        } else {
            res.status(StatusCodes.UNAUTHORIZED).send();
        }
    },
);

router.post(
    "/",
    
    // body validation
    body("address").notEmpty(),

    async (req: Request, res: Response) => {
        if (req.session.user) {
            if (req.session.user.uty != UserType.Vendor) {
                return res.status(StatusCodes.FORBIDDEN).send({
                    status: StatusCodes.FORBIDDEN,
                    message: "Only vendor accounts can create new locations"
                });
            }
            let db = getDb();

            const locRequest = new Location(req.body.address)
            const loc = await db.newLocation(locRequest);
            if (loc) {
                res.send(loc);
            } else {
                res.status(StatusCodes.CONFLICT).send({
                    status: StatusCodes.CONFLICT,
                    message: "There is already a location with the same address"
                });
            }
        } else {
            res.status(StatusCodes.UNAUTHORIZED).send();
        }
    },
);

router.delete(
    "/:locationId",

    param("locationId").notEmpty(),

    async (req: Request, res: Response) => {
        if (req.session.user) {
            let db = getDb();
            let locDelete = await db.deleteLocation(parseInt(req.params.locationId));
            if (locDelete) {
                return res.status(StatusCodes.ACCEPTED).send({
                    status: StatusCodes.ACCEPTED,
                    message: "Location deleted"
                });
            } else {
                return res.status(StatusCodes.NOT_FOUND).send({
                    status: StatusCodes.NOT_FOUND,
                    message: "Location does not exist"
                });
            }
        } else {
            return res.status(StatusCodes.UNAUTHORIZED).send();
        }
    },
);

module.exports = router;

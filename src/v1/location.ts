import { Request, Response, Router } from "express";
import { getDb } from "../database";
import { StatusCodes } from "http-status-codes";
import { body, param, matchedData, validationResult } from "express-validator";
import { Vehicle } from "../vehicle";
import { UserType } from "../user";
import { Location } from "../location";

let router = Router();

router.get(
    "/:locationId/vehicles",

    param("locationId").isInt(),

    async (req: Request, res: Response) => {
        if (req.session.user) {
            let db = getDb();

            let vehicles = await db.getLocationVehicles(
                parseInt(req.params.locationId, 10),
                false,
            );
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

router.post(
    "/:locationId/vehicles",

    param("locationId").isInt(),

    body("make").notEmpty(),
    body("model").notEmpty(),
    body("year").isInt(),
    body("seats").isInt(),
    body("doors").isInt(),
    body("bodyType").notEmpty(),
    body("rentCostPerDay").isInt(),
    body("color").notEmpty(),
    body("isRented").if(
        (value, { req }) =>
            // if the value is specified, ensure that its a boolean, if its not
            // specified allow the request.
            (req.body.isRented && body("isRented").isBoolean()) ||
            req.body.isRented == undefined,
    ),

    async (req: Request, res: Response) => {
        if (req.session.user && req.session.user.uty == UserType.Vendor) {
            let db = getDb();

            // make sure the location exists before we try to add a vehicle that references it.
            let loc = db.getLocation(parseInt(req.params.locationId));
            if (loc == undefined) {
                res.status(StatusCodes.NOT_FOUND);
            }

            var v: Vehicle = req.body;
            v.locationId = parseInt(req.params.locationId);

            let id = await db.newVehicle(v);
            if (id) {
                v.uid = id;
                res.send(v);
            } else {
                res.status(StatusCodes.NOT_FOUND);
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
                res.status(StatusCodes.NOT_FOUND);
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
        // validate that the data is good and make the database query
        const result = validationResult(req);
        if (result.isEmpty()) {
            const data = matchedData(req);

            if (typeof req.session.user == "undefined") {
                return res.status(StatusCodes.FORBIDDEN).send({
                    status: StatusCodes.FORBIDDEN,
                    message:
                        "You must be logged in as a Vendor to perform this action",
                });
            } else if (req.session.user.uty == UserType.Customer) {
                return res.status(StatusCodes.FORBIDDEN).send({
                    status: StatusCodes.FORBIDDEN,
                    message:
                        "You must be logged in as a Vendor to perform this action",
                });
            }

            let db = getDb();
            let id = await db.newLocation(new Location(data.address));

            if (id) {
                // update session
                req.session.save();
                return res.send({ id: id.uid, address: data.address });
            } else {
                // newlocation returns undefined if there is another location with the same address
                return res.status(StatusCodes.CONFLICT).send({
                    status: StatusCodes.CONFLICT,
                    message: "Location with the same address already exists",
                });
            }
        }

        return res
            .status(StatusCodes.BAD_REQUEST)
            .send({ errors: result.array() });
    },
);

module.exports = router;

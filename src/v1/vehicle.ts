import { Request, Response, Router } from "express";
import { getDb } from "../database";
import { StatusCodes } from "http-status-codes";
import { body, matchedData, param, validationResult } from "express-validator";
import { UserType } from "../user";

let router = Router();

router.get(
    "/:vehId",

    param("vehId").isInt(),

    async (req: Request, res: Response) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(StatusCodes.BAD_REQUEST).send();
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
    body("forUserEmail").optional(),

    async (req: Request, res: Response) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(StatusCodes.BAD_REQUEST).send();
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

            // check if the request for renting is for another user and ensure
            // that the request is from a vendor account
            if (req.body.forUserEmail) {
                if (req.session.user.uty != UserType.Vendor) {
                    return res.status(StatusCodes.FORBIDDEN).send({
                        status: StatusCodes.FORBIDDEN,
                        message: "You must be a vendor to rent vehicles for other users",
                    });
                }

                // get other user
                let otherUser = await db.getUserFromEmail(req.body.forUserEmail);
                if (otherUser == undefined) {
                    return res.status(StatusCodes.NOT_FOUND).send({
                        status: StatusCodes.NOT_FOUND,
                        message: "Other user to rent for is not found",
                    });
                }

                await db.rentVehicle(vehId, otherUser.uid, lengthInDays);
            } else {
                await db.rentVehicle(vehId, req.session.user.uid, lengthInDays);
            }

            res.status(StatusCodes.OK).send();
        } else {
            res.status(StatusCodes.UNAUTHORIZED).send();
        }
    },
);

router.delete(
    "/:vehId/rent",

    param("vehId").isInt(),

    async (req: Request, res: Response) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(StatusCodes.BAD_REQUEST);
        }

        if (req.session.user) {
            let db = getDb();
            const vehId = parseInt(req.params.vehId);

            const veh = await db.getVehicle(vehId);
            if (veh == undefined) {
                // ensure that the provided vehicle id is a valid vehicle
                return res.status(StatusCodes.NOT_FOUND).send();
            } else if (!veh.isRented) {
                // ensures that this vehicle is not already rented
                return res.status(StatusCodes.NOT_MODIFIED).send();
            }

            await db.returnVehicle(vehId);
            res.status(StatusCodes.OK).send();
        } else {
            res.status(StatusCodes.UNAUTHORIZED).send();
        }
    },
);

router.post(
    "/:vehId/relocate",

    param("vehId").isInt(),

    body("location").isInt(),

    async (req: Request, res: Response) => {
        if (req.session.user) {
            const data = matchedData(req);

            // only allow vendor user accounts
            if (req.session.user.uty != UserType.Vendor) {
                return res.status(StatusCodes.FORBIDDEN).send({
                    status: StatusCodes.FORBIDDEN,
                    message: "Only vendor accounts can create new locations"
                });
            }

            let db = getDb();
            const veh = await db.getVehicle(data.vehId);
            if (veh == undefined) {
                return res.status(StatusCodes.NOT_FOUND).send({
                    status: StatusCodes.NOT_FOUND,
                    message: "Vehicle was not found",
                })
            }

            if (veh.locationId == data.location) {
                return res.status(StatusCodes.NOT_MODIFIED).send({
                    status: StatusCodes.NOT_MODIFIED,
                    message: "Vehicle is already at location",
                })
            }

            if (!await db.relocateVehicle(data.vehId, data.location)) {
                return res.status(StatusCodes.NOT_FOUND).send({
                    status: StatusCodes.NOT_FOUND,
                    // due to a previous check, we know the vehicle id was correct by this point
                    message: "Location was not found",
                })
            }

            res.status(StatusCodes.OK).send();
        } else {
            res.status(StatusCodes.UNAUTHORIZED).send();
        }
    },
);

module.exports = router;

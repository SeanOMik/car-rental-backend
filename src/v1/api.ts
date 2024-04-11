import { Router } from "express";

const user = require("./user");
const vehicle = require("./vehicle");
const location = require("./location");

let router = Router();
router.use("/user", user);
router.use("/vehicle", vehicle);
router.use("/location", location);

module.exports = router;
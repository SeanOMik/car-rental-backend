import { Router } from "express";

const user = require("./user");
const vehicle = require("./vehicle");

let router = Router();
router.use("/user", user);
router.use("/vehicle", vehicle);
router.use("/location", vehicle);

module.exports = router;
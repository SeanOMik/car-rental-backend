import { Router } from "express";

const user = require("./user");

let router = Router();
router.use("/user", user);

module.exports = router;
import { Request, Response, Router } from "express";
let router = Router();

router.get("/login", (req: Request, res: Response) => {
    res.send("TODO: User Login"); // TODO
});

router.get("/register", (req: Request, res: Response) => {
    res.send("TODO: User register"); // TODO
});

module.exports = router;
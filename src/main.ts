import express, {
    Express,
    NextFunction,
    Request,
    Response,
    Router,
} from "express";
import dotenv from "dotenv";

import { initDb } from "./database";
import bodyParser from "body-parser";
import { StatusCodes } from "http-status-codes";

const apiV1 = require("./v1/api");

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && "body" in err) {
        console.error(err);
        return res.status(StatusCodes.BAD_REQUEST).send({ status: StatusCodes.BAD_REQUEST, message: err.message }); // Bad request
    }
    next();
});

// TODO: get connection string from env vars
initDb("postgres://postgres:test@localhost:5432/test");

app.use("/api/v1", apiV1);

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});

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
import session from "express-session";
import User from "./user";
import cors from "cors";

declare module "express-session" {
    interface SessionData {
        user: User;
    }
}

const apiV1 = require("./v1/api");

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.json()); // setup express-validator
setupExpressSession(app);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && "body" in err) {
        console.error(err);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .send({ status: StatusCodes.BAD_REQUEST, message: err.message }); // Bad request
    }
    next();
});

// TODO: get connection string from env vars
initDb("postgres://postgres:test@localhost:5432/test");

app.use("/api/v1", apiV1);

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});

// sets up express-session
function setupExpressSession(app: Express) {
    // enable express-session
    var sessionConfig = {
        secret: "keyboard cat",
        cookie: {},
    };

    // only secure cookies in production environments
    if (app.get("env") === "production") {
        app.set("trust proxy", 1); // trust first proxy
        sessionConfig.cookie = { secure: true }; // serve secure cookies
    }

    app.use(session(sessionConfig));
}

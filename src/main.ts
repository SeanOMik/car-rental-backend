import express, { Express, Request, Response, Router } from "express";
import dotenv from "dotenv";

const apiV1 = require("./v1/api");

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use("/api/v1", apiV1);

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});

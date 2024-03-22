# Car Rental Backend

## Development

### Setup

1. Install NodeJS, typescript, docker and docker-compose.
2. Open a terminal and run the following command to download dependencies:

    ```shell
    npm install
    ```

3. Start the database docker container for local development:

    ```shell
    docker-compose up -d
    ```

4. Trigger database migrations to setup the database locally:

    ```shell
    npm run migrate up
    ```

## Project Structure

Database migrations are used to keep the database as clean as possible and without having to destroy data between database updates. To see how to create a migration see the docs of [node-pg-migrate](https://www.npmjs.com/package/node-pg-migrate). All data for a request is validated using tools from [express-validator](https://express-validator.github.io/docs/api/matched-data/).

The project api is structured in modules and folders. Everything under the `v1` folder is under the `/api/v1/` API path. This means that anything added to the router in the [api module](src/v1/api.ts) will be added under that path (i.e., `/api/v1/users/...`).

When creating a new module, for example a `cars` module, you would create a `cars.ts` file in the `v1` folder. Then paste the following content inside of it:

```typescript
import { NextFunction, Request, Response, Router } from "express";
let router = Router();

router.post(
    // full path will be /api/v1/cars/new
    "/new",
    // body validation
    body("carId").notEmpty(),

    async (req: Request, res: Response) => {
        // validate that the data is good and make the database query
        const result = validationResult(req);
        if (result.isEmpty()) {
            const data = matchedData(req);
            // you can directly access body fields like this
            let carId = data.carId;
            
            // do logic things
            let db = getDb();

            return res.send(); // 200 OK status code if the car was created fine
        }

        return res
            .status(StatusCodes.BAD_REQUEST)
            .send({ errors: result.array() });
    },
);

module.exports = router;
```

Then in the [api.ts](src/v1/api.ts) module, you can add the `/cars` group path to the API:

```typescript
const cars = require("./cars");

router.use("/cars", cars);
```

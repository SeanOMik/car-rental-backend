//import { hash } from "bcrypt";
import * as bcrypt from "bcrypt";
import { Client, ClientConfig } from "pg";
import { User, UserType } from "./user";
import { Vehicle } from "./vehicle";
import { Location } from "./location";

// the amount of salting rounds for encrypting passwords
const saltRounds = 10;

export class Database {
    private client: Client;

    constructor(config: string | ClientConfig) {
        this.client = new Client(config);
    }

    async connect() {
        this.client.connect();
    }

    async doesUserExist(email: string): Promise<boolean> {
        let res = await this.client.query(
            "SELECT EXISTS(SELECT 1 FROM users \
            WHERE email = $1::text)",
            [email],
        );

        return res.rows[0].exists;
    }

    /**
     * Create a new user in the database.
     *
     * @param email The email of the new user.
     * @param password The plaintext password of the new user. This will be bcrypt encrypted in the database.
     * @param type The type of the user.
     * @returns The id of the new user, or undefined if the email is already taken.
     */
    async registerUser(
        email: string,
        password: string,
        type: UserType,
    ): Promise<number | undefined> {
        let passHash = bcrypt.hashSync(password, saltRounds);

        if (await this.doesUserExist(email)) {
            return undefined;
        }

        let t: number = type;

        let res = await this.client.query(
            "INSERT INTO users(email, password_hash, user_type) \
            VALUES($1::text, $2::text, $3::int) RETURNING id",
            [email, passHash, t.toString()],
        );
        return res.rows[0].id;
    }

    /**
     * Use a users email and password to attempt to find the user that matches the credentials.
     * If the user is found, the id will be returned. If the user is not found, undefined will
     * be returned.
     *
     * @param email The email of the user.
     * @param password The plaintext password of the user.
     * @returns The id of the user that the email and password matches for, or undefined if the email or password was incorrect.
     */
    async loginUser(
        email: string,
        password: string,
    ): Promise<User | undefined> {
        let res = await this.client.query(
            "SELECT id, password_hash, user_type FROM users \
            WHERE email = $1::text",
            [email],
        );

        let row = res.rows[0];
        if (row && bcrypt.compareSync(password.toString(), row.password_hash)) {
            return new User(row.id, email, row.user_type);
        }

        return undefined;
    }

    /**
     * Retrieve the user email from their id.
     *
     * @param id The id of the user
     * @returns The email of the user
     */
    async getUserEmail(id: number): Promise<string | undefined> {
        let res = await this.client.query(
            "SELECT email FROM users WHERE id = $1::integer",
            [id],
        );

        let row = res.rows[0];
        if (row) {
            return row.email;
        }

        return undefined;
    }

    private vehicleFromRow(row: any): Vehicle {
        let v = new Vehicle(
            row.id,
            row.make,
            row.model,
            row.year,
            row.seats,
            row.doors,
            row.body_type,
            row.rent_cost_per_day,
            row.color,
            row.is_rented,
        );
        v.locationId = row.location_id;
        return v;
    }

    /**
     * Retrieve a vehicle from its id.
     *
     * @param id The id of the vehicle.
     * @returns The vehicle, or undefined if not found.
     */
    async getVehicle(id: number): Promise<Vehicle | undefined> {
        let res = await this.client.query(
            "SELECT * FROM vehicle WHERE id = $1::integer",
            [id],
        );

        let row = res.rows[0];
        if (row) {
            let v = this.vehicleFromRow(row);
            return v;
        }

        return undefined;
    }

    /**
     * Create a new vehicle in the database, returning its unique id.
     *
     * @param vehicle The vehicle to add to the database.
     * @returns The id of the new vehicle.
     */
    async newVehicle(vehicle: Vehicle): Promise<number> {
        let vehLocStr = vehicle.locationId
            ? vehicle.locationId.toString()
            : "NULL";

        let res = await this.client.query(
            "INSERT INTO vehicle(make, location_id, model, year, doors, body_type, \
                seats, rent_cost_per_day, color, is_rented) \
                VALUES($1, $2, $3, $4, $5, $6, $7, \
                    $8, $9, $10) RETURNING id",
            [
                vehicle.make,
                vehLocStr,
                vehicle.model,
                vehicle.year.toString(),
                vehicle.doors.toString(),
                vehicle.bodyType,
                vehicle.seats.toString(),
                vehicle.rentCostPerDay.toString(),
                vehicle.color,
                vehicle.isRented.toString(),
            ],
        );

        return res.rows[0].id;
    }

    /**
     * Create a new location in the database, returning its unique id.
     *
     * @param location The location to add to the database.
     * @returns The new location, now including its unique id.
     */
    async newLocation(location: Location): Promise<Location | undefined> {
        if (await this.doesLocationExist(location.address)) {
            return undefined;
        }

        let res = await this.client.query(
            "INSERT INTO location(address) \
                VALUES($1::text) RETURNING id",
            [location.address],
        );

        location.uid = res.rows[0].id;
        return location;
    }

    async doesLocationExist(address: string): Promise<boolean> {
        let res = await this.client.query(
            "SELECT EXISTS(SELECT 1 FROM location \
            WHERE address = $1::text)",
            [address],
        );

        return res.rows[0].exists;
    }

    /**
     * Get a location from an id
     *
     * @param locationId The id of the location
     * @returns The location, or undefined if it wasn't found
     */
    async getLocation(locationId: number): Promise<Location | undefined> {
        let res = await this.client.query(
            "SELECT address FROM location WHERE id = $1::integer",
            [locationId],
        );

        let row = res.rows[0];
        if (row) {
            let loc = new Location(row.address);
            loc.uid = locationId;
            return loc;
        }

        return undefined;
    }

    async deleteLocation(locationId: number): Promise<boolean | undefined> {
        let res = await this.client.query(
            "DELETE FROM location WHERE id = $1::integer",
            [locationId],
        );

        let row = res.rows[0];
        if (typeof row !== 'undefined') {
            return true;
        }

        return undefined;
    }

    /**
     * Get the vehicles at a location.
     *
     * @param locationId The id of the location to get vehicles from.
     * @returns An array of vehicles that are currently at the location, or undefined if the location was not found
     */
    async getLocationVehicles(
        locationId: number,
        includeRented: boolean,
    ): Promise<Vehicle[] | undefined> {
        if (this.getLocation(locationId) == undefined) {
            return undefined;
        }

        let res;
        if (includeRented) {
            res = await this.client.query(
                "SELECT * FROM vehicle WHERE location_id = $1::integer",
                [locationId],
            );
        } else {
            res = await this.client.query(
                "SELECT * FROM vehicle WHERE location_id = $1::integer AND is_rented = false",
                [locationId],
            );
        }

        let vehicles = [];
        for (let row of res.rows) {
            vehicles.push(this.vehicleFromRow(row));
        }

        return vehicles;
    }

    /**
     * Get all locations.
     *
     * @returns An array of locations.
     */
    async getLocations(): Promise<Location[]> {
        let res = await this.client.query("SELECT * FROM location");

        let locs = [];
        for (let row of res.rows) {
            let loc = new Location(row.address);
            loc.uid = row.id;

            locs.push(loc);
        }

        return locs;
    }

    /**
     * Rent a vehicle for a specified amount of days.
     *
     * @param vehicleId The id of the vehicle to rent.
     * @param renterUserId The id of the user that is renting the vehicle.
     * @param lengthDays The length in days that the rent will be for.
     * @param startDate The start of the rent, defaults to now.
     */
    async rentVehicle(
        vehicleId: number,
        renterUserId: number,
        lengthDays: number,
        startDate: Date = new Date(Date.now()),
    ) {
        await this.client.query(
            "INSERT INTO rent_requests(vehicle_id, renter_user_id, start_date, length_days) \
            VALUES($1::int, $2::string, $2::int)",
            [
                vehicleId.toString(),
                renterUserId.toString(),
                startDate.toISOString(),
                lengthDays.toString(),
            ],
        );

        await this.client.query(
            "UPDATE vehicle SET is_rented = true WHERE id = $1::int",
            [vehicleId.toString()],
        );
    }

    async vehicleIsRented(id: number): Promise<boolean | undefined> {
        let rented = await this.client.query(
            "SELECT FROM vehicle WHERE id = $1::int",
            [id],
        );

        if (rented == undefined)
            return false;
        else
            return rented.rows[0].is_rented;
    }

    async returnVehicle(
        vehicleId: number,
        renterUserId: number,
        endDate: Date = new Date(Date.now()),
    ) {
        let veh = await this.getVehicle(vehicleId);

        if (veh == undefined)
            return;

        let rent_check = await this.client.query(
            "SELECT FROM rent_requests WHERE vehicle_id = $1::int AND renter_user_id = $2::int",
            [
                vehicleId,
                renterUserId,
            ],
        );

        if (rent_check == undefined)
            return;

        let days_passed = (endDate.getTime() - rent_check.rows[0].start_date.getTime()) / (1000 * 60 * 60 *24);

        if (days_passed > rent_check.rows[0].length_days)
            // mark vehicle late

        await this.client.query(
            "UPDATE vehicle SET is_rented = false WHERE id = $1::int",
            [vehicleId.toString()],
        );
    }

    async getUser(userId: number): Promise<User | undefined> {
        const res = await this.client.query("SELECT * from users where id = $1::int", [userId]);
        const row = res.rows[0];

        const ty = row.user_type == 1 ? UserType.Vendor : UserType.Customer;
        return new User(row.id, row.email, ty);
    }
}

let _db: Database;

export function initDb(config: string | ClientConfig) {
    if (_db) {
        console.warn(
            "Attempt to initialize database when it was already initialized!",
        );
    }

    _db = new Database(config);
    _db.connect();
}

export function getDb(): Database {
    return _db;
}

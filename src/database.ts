//import { hash } from "bcrypt";
import * as bcrypt from 'bcrypt'
import { Client, ClientConfig } from "pg";

//const bcrypt = require("bcrypt");

const saltRounds = 10;

export class Database {
    private client: Client;

    constructor(config: string | ClientConfig) {
        this.client = new Client(config);
    }

    async connect() {
        this.client.connect();
    }

    async doesUserExist(email: string) : Promise<boolean> {
        let res = await this.client.query('SELECT EXISTS(SELECT 1 FROM users \
            WHERE email = $1::text)', [email]);

        return res.rows[0].exists;
    }

    /**
     * Create a new user in the database.
     * 
     * @param email The email of the new user.
     * @param password The plaintext password of the new user. This will be bcrypt encrypted in the database.
     * @returns The id of the new user, or undefined if the email is already taken.
     */
    async registerUser(email: string, password: string): Promise<number | undefined> {
        let passHash = bcrypt.hashSync(password, saltRounds);

        if (await this.doesUserExist(email)) {
            return undefined;            
        }

        let res = await this.client.query('INSERT INTO users(email, password_hash) \
            VALUES($1, $2) RETURNING id', [email, passHash]);
        return res.rows[0].id;
    }

    /**
     * Use a users email and password to attempt to find the user that matches the credentials.
     * If the user is found, the id will be returned. If the user is not found,
     * -1 will be returned.
     * 
     * @param email The email of the user.
     * @param password The plaintext password of the user.
     * @returns The id of the user that the email and password matches for, or '-1' if the email or password was incorrect.
     */
    async loginUser(email: string, password: string): Promise<number> {
        let res = await this.client.query('SELECT id, password_hash FROM users \
            WHERE email = $1::text', [email]);
        
        let row = res.rows[0];
        if (row && bcrypt.compareSync(password.toString(), row.password_hash)) {
            return row.id;
        }
           
        return -1;
    }
}

let _db: Database;

export function initDb(config: string | ClientConfig) {
    if (_db) {
        console.warn("Attempt to initialize database when it was already initialized!");
    }

    _db = new Database(config);
    _db.connect();
}

export function getDb(): Database {
    return _db;
}
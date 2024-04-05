import {Database} from '../src/database';
import {Vehicle} from '../src/vehicle';

export class userRestApi
{
    db: Database;

    constructor(db: Database)
    {
        this.db = db;
    }

    userRegister(username: string, password: string)
    {   
          
    }

    userLogin(username: string, password: string)
    {

    }

    listLocationRentalVehicles(location: string)
    {

    }

    getRentalVehicle(uuid: number)
    {

    }

    rentVehicle(uuid: number)
    {

    }
}
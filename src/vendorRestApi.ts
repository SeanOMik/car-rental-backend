import {Vehicle} from '../src/vehicle';
import {Database} from '../src/database';

export class vendorRestApi
{
    db: Database;

    constructor(db: Database)
    {
        this.db = db;
    }

    newRentalVehicle(v: Vehicle)
    {

    }

    vendorLogin(username: string, password:string)
    {

    }

    listLocationRentalVehicles(location: string)
    {

    }

    getRentalVehicle(uuid: number)
    {

    }

    rentVehicleToUser(vehicleId: number, userId:number)
    {

    }

    returnVehicle(location: string, uuid:number)
    {

    }

    startVehicleMaintenance(uuid:number)
    {

    }

    finishVehicleMaintenance(uuid:number)
    {
        
    }
}
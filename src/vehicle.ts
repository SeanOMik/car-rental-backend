export class Vehicle {
    uid: number;
    /// The location that the vehicle is at, or undefined if its on the road.
    locationId?: number;
    make: string;
    model: string;
    year: number;
    axles: number;
    doors: number;
    bodyType: string;
    rentCostPerDay: number;
    color: string;
    isRented: boolean;

    constructor(
        uid: number,
        make: string,
        model: string,
        year: number,
        axles: number,
        doors: number,
        bodyType: string,
        rentCostPerDay: number,
        color: string,
        isRented: boolean,
    ) {
        this.uid = uid;
        this.make = make;
        this.model = model;
        this.year = year;
        this.axles = axles;
        this.doors = doors;
        this.bodyType = bodyType;
        this.rentCostPerDay = rentCostPerDay;
        this.color = color;
        this.isRented = isRented;
    }
}

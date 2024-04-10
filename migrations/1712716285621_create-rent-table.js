/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable("rent_requests", {
        id: "id", // auto-increment ids, primary key
        vehicle_id: {
            type: "integer",
            notNull: false,
            references: '"vehicle"',
        },
        renter_user_id: {
            type: "integer",
            notNull: false,
            references: '"users"',
        },
        start_date: { type: "timestamptz", notNull: true },
        length_days: { type: "int", notNull: true },
    });

    pgm.createIndex("rent_requests", "vehicle_id");
    pgm.createIndex("rent_requests", "renter_user_id");

};

exports.down = pgm => {};

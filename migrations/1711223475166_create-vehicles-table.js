/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable("location", {
        id: "id", // auto-increment ids, primary key
        address: { type: "text", notNull: true },
    });

    pgm.createTable("vehicle", {
        id: "id", // auto-increment ids, primary key
        location_id: {
            type: "integer",
            notNull: false,
            references: '"location"',
        },
        make: { type: "varchar(30)", notNull: true },
        model: { type: "varchar(30)", notNull: true },
        year: { type: "smallint", notNull: true },
        doors: { type: "smallint", notNull: true },
        axles: { type: "smallint", notNull: true },
        body_type: { type: "varchar(30)", notNull: true },
        rent_cost_per_day: { type: "numeric(8,2)", notNull: true },
        color: { type: "varchar(20)", notNull: true },
        is_rented: { type: "boolean", default: false },
    });

    pgm.createIndex("vehicle", "location_id");
};

exports.down = pgm => {};

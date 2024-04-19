/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumns("rent_requests", {
        end_date: { type: "timestamptz", notNull: false, },
    });
};

exports.down = pgm => {};

/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumns("users", {
        user_type: { type: "integer", notNull: true, default: 0 },
    });
};

exports.down = pgm => {};

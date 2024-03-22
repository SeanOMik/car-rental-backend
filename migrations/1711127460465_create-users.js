/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable("users", {
        id: "id", // auto-increment ids, primary key
        email: { type: "varchar(100)", notNull: true },
        password_hash: { type: "varchar", notNull: true },
    });
    /* pgm.createTable("posts", {
        id: "id",
        userId: {
            type: "integer",
            notNull: true,
            references: '"users"',
            onDelete: "cascade",
        },
        body: { type: "text", notNull: true },
        createdAt: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("current_timestamp"),
        },
    });
    pgm.createIndex("posts", "userId"); */
};

exports.down = pgm => {};

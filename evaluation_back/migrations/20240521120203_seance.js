/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("seance", (table) => {
    table.increments("id_seance");
    table.string("title");
    table.string("description");
    table.timestamp("start");
    table.timestamp("end");
    table
      .integer("id_module")
      .references("user.id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};

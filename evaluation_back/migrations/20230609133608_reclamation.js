/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("user", (table) => {
    table
      .enum("reclamation", ["PENDING", "TARTED", "DEFAULT"])
      .defaultTo("DEFAULT");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("user", (table) => {
    table.dropColumn("reclamation");
  });
};

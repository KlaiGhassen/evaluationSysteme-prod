/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("rdi_task", (table) => {
    table.increments("id_task");
    table.string("title");
    table.string("description");
    table
      .integer("teacher_task")
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
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("rdi_task");
};

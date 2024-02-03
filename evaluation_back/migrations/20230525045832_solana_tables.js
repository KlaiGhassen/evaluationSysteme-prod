/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable("spl", (table) => {
      table.increments("token_id");
      table.string("mint");
      table.string("fromTokenAccount");
      table.integer("id_user");
      table.timestamps(true, true);
    })
    .then(() => {
      return knex.schema.createTable("ro_ratting", (table) => {
        table.integer("value").notNullable();
        table.integer("student_ratting_id").references("user.id");
        table.integer("teacher_ratting_id").references("user.id");
        table.primary(["student_ratting_id", "teacher_ratting_id"]);
        table.timestamps(true, true);
      });
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("ro_ratting")
    .then(() => knex.schema.dropTableIfExists("spl"));
};

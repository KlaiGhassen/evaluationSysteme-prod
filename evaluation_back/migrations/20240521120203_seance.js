/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable("seance", (table) => {
      table.increments("id");
      table.string("title");
      table.string("pdfName");
      table.string("qrcode");
      table.string("description");
      table.timestamp("start");
      table.timestamp("end");
      table.string("classe");
      table
        .integer("id_module")
        .references("module.id_module")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      table
        .integer("id_teacher")
        .references("user.id")
        .onDelete("CASCADE")
        .onUpdate("CASCADE")
        .unsigned()
        .notNullable();
      table.timestamps(true, true);
    })
    .then(() => {
      return knex.schema.createTable("seance_student", (table) => {
        table.integer("id_seance");
        table.integer("classroom_id").unsigned().notNullable();
        table.integer("id_student");
        table.string("seance");
        table.string("seance_status");
        table.primary([
          "id_seance",
          "classroom_id",
          "id_student",
          "seance_status",
        ]); // composite primary key
        table
          .foreign("id_seance")
          .references("seance.id")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table
          .foreign("classroom_id")
          .references("classroom.classroom_id")
          .onDelete("CASCADE");
        table
          .foreign("id_student")
          .references("user.id")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table.timestamps(true, true);
      });
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("seance_student").then(() => {
    return knex.schema.dropTable("seance");
  });
};

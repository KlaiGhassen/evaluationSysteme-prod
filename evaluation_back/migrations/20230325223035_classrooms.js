/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable("classroom", (table) => {
      table.increments("classroom_id");
      table.string("name_class").notNullable().unique();
      table.string("class").references("class.class_name_class");
      table.date("university_year").notNullable();
      table.boolean("rate").defaultTo(false);
      table.timestamps(true, true);
    })
    .then(() => {
      return knex.schema.alterTable("user", (table) => {
        table.integer("student_class").references("classroom.classroom_id");
      });
    })
    .then(() => {
      return knex.schema.createTable("questions_to_answer", function (table) {
        table
          .integer("classroom_id")
          .unsigned()
          .notNullable()
          .references("classroom.classroom_id")
          .onDelete("CASCADE");
        table
          .integer("section_id")
          .unsigned()
          .notNullable()
          .references("questions_section.section_id")
          .onDelete("CASCADE");
        table.primary(["classroom_id", "section_id"]);
        table.timestamps(true, true);
      });
    })
    .then(() => {
      return knex.schema
        .createTable("answers", function (table) {
          table.increments("id").primary();
          table
            .integer("question_id")
            .unsigned()
            .notNullable()
            .references("questions.id_question")
            .onDelete("CASCADE");
          table
            .integer("student_id")
            .unsigned()
            .notNullable()
            .references("user.id")
            .onDelete("CASCADE");
          table.string("text").notNullable();
          table.timestamps(true, true);
        })
        .then(() => {
          return knex.schema.createTable("teacher_class", (table) => {
            table.integer("teacher_id").references("user.id");
            table.integer("classroom").references("classroom.classroom_id");
            table.integer("module").references("module.id_module");
            table.primary(["teacher_id", "classroom", "module"]);
            table.timestamps(true, true);
          });
        })
        .then(() => {
          return knex.schema.createTable("framing_ratting", (table) => {
            table.integer("value").notNullable();
            table.integer("student_ratting_id").references("user.id");
            table.integer("teacher_rated_id").references("user.id");
            table.primary(["student_ratting_id", "teacher_rated_id"]);
            table.timestamps(true, true);
          });
        })
        .then(() => {
          return knex.schema.alterTable("student_ratting", (table) => {
            table.integer("classroom_id").references("classroom.classroom_id");
          });
        });
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("answers")
    .then(() => {
      return knex.schema.alterTable("student_ratting", (table) => {
        table.dropColumn("classroom_id");
      });
    })
    .then(() => {
      return knex.schema.dropTableIfExists("question_sections");
    })
    .then(() => knex.schema.dropTableIfExists("framing_ratting"))

    .then(() => knex.schema.dropTableIfExists("teacher_class"))
    .then(() => {
      return knex.schema.alterTable("user", (table) => {
        table.dropColumn("student_class");
      });
    })
    .then(() => {
      return knex.schema.dropTableIfExists("questions_to_answer");
    })
    .then(() => {
      return knex.schema.dropTableIfExists("classroom");
    });
};

exports.up = function (knex) {
  return knex.schema
    .createTable("class", (table) => {
      table.increments("id_class");
      table.string("class_name_class").notNullable().unique();
      table.timestamps(true, true);
    })
    .then(() => {
      return knex.schema.createTable("user", (table) => {
        table.increments("id");
        table.string("id_et");
        table.string("first_name").notNullable();
        table.string("last_name").notNullable();
        table.string("email").unique().notNullable();
        table.string("password").defaultTo("test");
        table.boolean("email_verified").defaultTo(false);
        table.string("phone").unique();
        table.string("address");
        table.string("about");
        table.string("up");
        table.string("title");
        table.string("option");
        table.integer("rdi").references("user.id");
        table.string("department");
        table.integer("framing").references("user.id");
        table.string("social_image");
        table.boolean("social_logeed_in").defaultTo(false);
        table.string("image").defaultTo("Default.png");
        table.string("pubKey");
        table
          .enum("role", [
            "ADMIN",
            "STUDENT",
            "TEACHER",
            "CUP",
            "RO",
            "RDI",
            "CD",
          ])
          .notNullable();
        table.timestamps(true, true);
      });
    })
    .then(() => {
      return knex.schema.createTable("student_ratting", (table) => {
        table.integer("value").notNullable();
        table.integer("student_ratting_id").references("user.id");
        table.integer("teacher_ratting_id").references("user.id");
        table.primary(["student_ratting_id", "teacher_ratting_id"]);
        table.timestamps(true, true);
      });
    })
    .then(() => {
      return knex.schema.createTable("teacher_ratting", (table) => {
        table.integer("value").notNullable();
        table.integer("teacher_rate_id").references("user.id");
        table.integer("teacher_rated_id").references("user.id");
        table.primary(["teacher_rate_id", "teacher_rated_id"]);
        table.string("type");
        table.timestamps(true, true);
      });
    })
    .then(() => {
      return knex.schema.createTable("UE", (table) => {
        table.increments("id_Ue");
        table.string("name_ue").notNullable().unique();
        table.boolean("is_done");
        table.string("Description");
        table.string("class").references("class.class_name_class");
        table.timestamps(true, true);
      });
    })
    .then(() => {
      return knex.schema.createTable("module", (table) => {
        table.increments("id_module");
        table.string("name_module");
        table.float("duration");
        table.float("p1");
        table.float("p2");
        table.integer("ETC");
        table.string("semester");
        table
          .string("UE")
          .references("UE.name_ue")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table.integer("module_ro").references("user.id");
        table.boolean("isratedclassroom").defaultTo(false);
        table.timestamps(true, true);
      });
    })
    .then(() => {
      return knex.schema.createTable("courses", (table) => {
        table.increments("id_course");
        table.integer("order");
        table.string("title");
        table.string("subtitle");
        table.string("content");
        table
          .integer("module")
          .references("module.id_module")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table.timestamps(true, true);
      });
    })
    .then(() => {
      return knex.schema.createTable("refresh_tokens", (table) => {
        table.increments("id_token");
        table.string("token");
        table.integer("user_id").references("user.id");
        table.timestamps(true, true);
      });
    })

    .then(() => {
      return knex.schema.createTable("questions_section", (table) => {
        table.increments("section_id");
        table.string("title");
        table.string("notes");
        table.string("dueDate");
        table.timestamps(true, true);
      });
    })
    .then(() => {
      return knex.schema.createTable("questions", (table) => {
        table.increments("id_question");
        table.string("question");
        table.integer("questions_order");
        table.integer("section_id").references("questions_section.section_id");
        table.timestamps(true, true);
      });
    });
};
exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("courses")
    .then(() => knex.schema.dropTableIfExists("questions"))
    .then(() => knex.schema.dropTableIfExists("questions_section"))
    .then(() =>
      knex.schema.alterTable("module", (table) => {
        table.dropColumn("UE");
      })
    )
    .then(() => knex.schema.dropTableIfExists("UE"))
    .then(() => knex.schema.dropTableIfExists("module"))
    .then(() => knex.schema.dropTableIfExists("teacher_ratting"))
    .then(() => knex.schema.dropTableIfExists("student_ratting"))
    .then(() => knex.schema.dropTableIfExists("refresh_tokens"))
    .then(() => knex.schema.dropTableIfExists("user"))
    .then(() => knex.schema.dropTableIfExists("class"));
};

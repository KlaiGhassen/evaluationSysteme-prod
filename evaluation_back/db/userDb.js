require("dotenv").config();
let knex = require("./knex");

exports.getAllUsersByClass = async (req, res, next) => {
  try {
    id = req.params.id;
    const Users = await knex("user").select("*").where({ student_class: id });
    res.user = Users;
    next();
  } catch (error) {
    console.error(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const Users = await knex("user").select("*");
    res.user = Users;
    next();
  } catch (error) {
    console.error(error);
  }
};
exports.updateImage = async (req, res, next) => {
  const id = req.payload.id;
  try {
    const user = await knex("user")
      .leftJoin("classroom", "classroom.classroom_id", "user.student_class")
      .where({ id: id })
      .update({ image: req.file.filename })
      .returning("*")
      .then((rows) => rows[0]);
    res.user = user;
  } catch (error) {
    console.error(error);
    res.user = error;
  }
  next();
};
exports.updateUserFromAdmin = async (req, res, next) => {
  const id = req.body.id;
  const updatedUser = req.body.contact;
  try {
    const user = await knex("user")
      .where({ id: id })
      .update(updatedUser)
      .returning("id")
      .then((rows) => rows[0]);
    const contacts = await knex("user")
      .select("*")
      .where({ "user.id": user.id })
      .whereNot("user.role", "STUDENT")
      .andWhereNot("user.role", "ADMIN")
      .leftJoin("teacher_class", "teacher_class.teacher_id", "=", "user.id")
      .leftJoin("module", "teacher_class.module", "=", "module.id_module")
      .leftJoin(
        "classroom",
        "teacher_class.classroom",
        "=",
        "classroom.classroom_id"
      );
    const teacher = {};
    contacts.forEach((element) => {
      const teacher_id = element.id;
      if (!teacher[teacher_id]) {
        teacher[teacher_id] = {
          id: element.id,
          first_name: element.first_name,
          last_name: element.last_name,
          email: element.email,
          phone: element.phone,
          social_image: element.social_image,
          up: element.up,
          role: element.role,
          modulesClassroom: [],
        };
      }
      if (element.module != null) {
        teacher[teacher_id].modulesClassroom.push({
          module_id: element.module,
          classroom_id: element.classroom,
          module_name: element.name_module,
          classroom: element.name_class,
        });
      }
    });
    const result = Object.values(teacher);

    res.user = result[0];
    next();
  } catch (error) {
    console.error(error);
    res.user = error;
  }
};
exports.updateUser = async (req, res, next) => {
  const id = req.payload.id;
  const updatedUser = req.body;

  try {
    const user = await knex("user")
      .where({ id: id })
      .leftJoin("classroom", "classroom.classroom_id", "user.student_class")
      .update(updatedUser)
      .returning("*")
      .then((rows) => rows[0]);
    res.user = user;
  } catch (error) {
    console.error(error);
    res.user = error;
  }
  next();
};
exports.checkPwd = async (req, res, next) => {
  const id = req.payload.id;
  const pwds = req.body;
  try {
    const user = await knex("user").where({ id: id }).first();
    if (pwds.currentPassword == user.password) {
      await knex("user")
        .where({ id: id })
        .update({ password: pwds.newPassword });
      res.user = user;
    } else {
      res.user = "wrong password";
    }
    //res.user = user;
  } catch (error) {
    console.error(error);
    res.user = error;
  }
  next();
};
exports.getAllTeachers = async (req, res, next) => {
  try {
    let teachers;
    let up = req.query.up;
    if (up == "all") {
      switch (req.query.sort || "Teaching") {
        case "Teaching":
          teachers = [];
          teachers = await knex("user")
            .whereNot({ role: "STUDENT" })
            .andWhereNot({ role: "ADMIN" })
            .leftJoin(
              knex
                .select("teacher_ratting_id")
                .avg("value AS average_rating")
                .from("student_ratting")
                .groupBy("teacher_ratting_id")
                .as("subquery"),
              "subquery.teacher_ratting_id",
              "=",
              "user.id"
            )
            .select("user.*", "subquery.average_rating")
            .orderBy("subquery.average_rating", "desc");
          break;
        case "Rdi":
          teachers = [];
          teachers = await knex("user")
            .whereNot({ role: "STUDENT" })
            .andWhereNot({ role: "ADMIN" })
            .leftJoin(
              knex
                .select("teacher_rated_id")
                .avg("value AS average_rating")
                .from("teacher_ratting")
                .where("type", "RDI")
                .groupBy("teacher_rated_id")
                .as("subquery"),
              "subquery.teacher_rated_id",
              "=",
              "user.id"
            )
            .select("user.*", "subquery.average_rating")
            .orderBy("subquery.average_rating", "desc");
          break;
        case "Supervising":
          teachers = [];

          teachers = await knex("user")
            .whereNot({ role: "STUDENT" })
            .andWhereNot({ role: "ADMIN" })
            .leftJoin(
              knex
                .select("teacher_rated_id")
                .avg("value AS average_rating")
                .from("framing_ratting")
                .groupBy("teacher_rated_id")
                .as("subquery"),
              "subquery.teacher_rated_id",
              "=",
              "user.id"
            )
            .select("user.*", "subquery.average_rating")
            .orderBy("subquery.average_rating", "desc");
          break;
        case "Appreciation":
          teachers = [];

          teachers = await knex("user")
            .whereNot({ role: "STUDENT" })
            .andWhereNot({ role: "ADMIN" })
            .andWhereNot({ role: "TEACHER" })
            .leftJoin(
              knex
                .select("teacher_rated_id")
                .avg("value AS average_rating")
                .from("teacher_ratting")
                .groupBy("teacher_rated_id")
                .whereNot("type", "RDI")
                .as("subquery"),
              "subquery.teacher_rated_id",
              "=",
              "user.id"
            )
            .select("user.*", "subquery.average_rating")
            .orderBy("subquery.average_rating", "desc");
      }
    } else {
      switch (req.query.sort || "Teaching") {
        case "Teaching":
          teachers = [];

          teachers = await knex("user")
            .whereNot({ role: "STUDENT" })
            .andWhereNot({ role: "ADMIN" })
            .andWhere({ up: up })
            .leftJoin(
              knex
                .select("teacher_ratting_id")
                .avg("value AS average_rating")
                .from("student_ratting")
                .groupBy("teacher_ratting_id")
                .as("subquery"),
              "subquery.teacher_ratting_id",
              "=",
              "user.id"
            )
            .select("user.*", "subquery.average_rating")
            .orderBy("subquery.average_rating", "desc");
          break;
        case "Rdi":
          teachers = [];

          teachers = await knex("user")
            .whereNot({ role: "STUDENT" })
            .andWhereNot({ role: "ADMIN" })
            .andWhere({ up: up })

            .leftJoin(
              knex
                .select("teacher_rated_id")
                .avg("value AS average_rating")
                .from("teacher_ratting")
                .where("type", "RDI")
                .groupBy("teacher_rated_id")
                .as("subquery"),
              "subquery.teacher_rated_id",
              "=",
              "user.id"
            )
            .select("user.*", "subquery.average_rating")
            .orderBy("subquery.average_rating", "desc");
          break;
        case "Supervising":
          teachers = [];

          teachers = await knex("user")
            .whereNot({ role: "STUDENT" })
            .andWhereNot({ role: "ADMIN" })
            .andWhere({ up: up })

            .leftJoin(
              knex
                .select("teacher_rated_id")
                .avg("value AS average_rating")
                .from("framing_ratting")
                .groupBy("teacher_rated_id")
                .as("subquery"),
              "subquery.teacher_rated_id",
              "=",
              "user.id"
            )
            .select("user.*", "subquery.average_rating")
            .orderBy("subquery.average_rating", "desc");
          break;
        case "Appreciation":
          teachers = [];

          teachers = await knex("user")
            .whereNot({ role: "STUDENT" })
            .andWhereNot({ role: "ADMIN" })
            .andWhereNot({ role: "TEACHER" })
            .andWhere({ up: up })
            .leftJoin(
              knex
                .select("teacher_rated_id")
                .avg("value AS average_rating")
                .from("teacher_ratting")
                .groupBy("teacher_rated_id")
                .whereNot("type", "RDI")
                .as("subquery"),
              "subquery.teacher_rated_id",
              "=",
              "user.id"
            )
            .select("user.*", "subquery.average_rating")
            .orderBy("subquery.average_rating", "desc");
      }
    }

    const teacher = {};
    teachers.forEach((element) => {
      const teacher_id = element.id;
      if (!teacher[teacher_id]) {
        teacher[teacher_id] = {
          id: element.id,
          first_name: element.first_name,
          last_name: element.last_name,
          email: element.email,
          phone: element.phone,
          social_image: element.social_image,
          up: element.up,
          role: element.role,
          ratting: element.average_rating,
        };
      }
    });
    const result = Object.values(teacher);
    result.sort((a, b) => b.ratting - a.ratting);
    res.teachers = result;
    next();
  } catch (error) {
    console.error(error);
  }
};
exports.searchTeacher = async (req, res, next) => {
  try {
    const query = req.query.query;
    const contacts = await knex("user")
      .select("*")
      .where("role", "TEACHER")
      .orWhere("role", "CUP")
      .orWhere("role", "RDI")
      .orWhere("role", "CD")
      .orWhere("role", "RO");
    let filtredContacts = [];
    // If the query exists...
    if (query) {
      // Filter the contacts
      filtredContacts = contacts.filter(
        (contact) =>
          contact.first_name &&
          contact.first_name.toLowerCase().includes(query.toLowerCase())
      );
    }
    // Sort the contacts by the name field by default
    filtredContacts.sort((a, b) => a.first_name.localeCompare(b.first_name));
    res.teachers = filtredContacts;
    next();
  } catch (error) {
    console.error(error);
  }
};
exports.mtcAll = async (req, res, next) => {
  try {
    const id = req.query.id;
    const contacts = await knex("user")
      .select("*")
      .where({ "user.id": id })
      .whereNot("user.role", "STUDENT")
      .andWhereNot("user.role", "ADMIN")
      .leftJoin("teacher_class", "teacher_class.teacher_id", "=", "user.id")
      .leftJoin("module", "teacher_class.module", "=", "module.id_module")
      .leftJoin(
        "classroom",
        "teacher_class.classroom",
        "=",
        "classroom.classroom_id"
      );
    const teacher = {};
    contacts.forEach((element) => {
      const teacher_id = element.id;
      if (!teacher[teacher_id]) {
        teacher[teacher_id] = {
          id: element.id,
          first_name: element.first_name,
          last_name: element.last_name,
          email: element.email,
          phone: element.phone,
          social_image: element.social_image,
          up: element.up,
          role: element.role,
          reclamation: element.reclamation,
          modulesClassroom: [],
        };
      }
      if (element.module != null) {
        teacher[teacher_id].modulesClassroom.push({
          module_id: element.module,
          classroom_id: element.classroom,
          module_name: element.name_module,
          classroom: element.name_class,
        });
      }
    });
    const result = Object.values(teacher);
    res.teachers = result[0];
    next();
  } catch (error) {
    console.error(error);
  }
};
exports.stcAll = async (req, res, next) => {
  try {
    const studentId = req.payload.id;
    const contacts = await knex
      .select("*", "s.student_class as student_classroom")
      .from("user as s")
      .join("classroom as c", "s.student_class", "=", "c.classroom_id")
      .join("class as cl", "cl.class_name_class", "=", "c.class")
      .join("UE as u", "cl.class_name_class", "=", "u.class")
      .join("module as m", "m.UE", "=", "u.name_ue")
      .join("teacher_class as tc", "tc.classroom", "=", "c.classroom_id")
      .join("user as t", "tc.teacher_id", "=", "t.id")
      .leftOuterJoin("student_ratting as sr", "t.id", "=", "teacher_ratting_id")
      .where("s.id", studentId);
    const teacher = {};
    contacts.forEach((element) => {
      const teacher_id = element.teacher_id;
      if (!teacher[teacher_id]) {
        teacher[teacher_id] = {
          id: element.teacher_id,
          first_name: element.first_name,
          last_name: element.last_name,
          email: element.email,
          phone: element.phone,
          image: element.image,
          up: element.up,
          role: element.role,
          isratedclassroom: element.isratedclassroom,
          isRated: element.rate,
          ratting: null,
          classroom: {
            classroom_id: element.classroom,
            classroom: element.name_class,
          },
          module: [],
        };
      }

      let modeuleToAdd = {
        module_id: element.module,
        module_name: element.name_module,
      };
      if (
        element.module != null &&
        element.module == element.id_module &&
        !teacher[teacher_id].module.some(
          (m) => m.module_id == modeuleToAdd.module_id
        )
      ) {
        teacher[teacher_id].module.push(modeuleToAdd);
      }

      if (element.student_ratting_id === studentId) {
        teacher[teacher_id]["ratting"] = element.value;
      }
    });
    const result = Object.values(teacher);
    console.log(result);
    res.teachers = result;
    next();
  } catch (error) {
    console.error(error);
  }
};
exports.getTeamAffectedRdi = async (req, res, next) => {
  try {
    const id = req.payload.id;
    var teachers = [];
    teachers = await knex("user").select("*").whereNot("id", id).where({
      rdi: id,
    });
    res.teachers = teachers;

    next();
  } catch (error) {
    console.error(error);
  }
};
exports.getNotdRdi = async (req, res, next) => {
  try {
    const up = req.payload.up;
    const id = req.payload.id;
    var teachers = [];
    teachers = await knex("user")
      .select("*")
      .whereNot({ id: id, role: "STUDENT" })
      .andWhere({ up: up, rdi: null });

    res.teachers = teachers;

    next();
  } catch (error) {
    console.error(error);
  }
};
exports.getTeam = async (req, res, next) => {
  try {
    const role = req.payload.role;
    const id = req.payload.id;
    const up = req.payload.up;
    const connectedUsers = await knex("user").where({ id: id, up: up }).first();
    var teachers = [];
    switch (role) {
      //TODO change role for who teached ganix with sim
      case "TEACHER":
        teachers = await knex("user")
          .select("*")
          .whereNot("id", id)
          .whereIn("role", ["CUP", "RO"])
          .andWhere("up", up)
          .leftJoin("teacher_ratting", function () {
            this.on("user.id", "=", "teacher_ratting.teacher_rated_id").andOn(
              "teacher_ratting.teacher_rate_id",
              "=",
              id
            );
          });
        let connectedUserFilter = [];
        teachers.map((teacher) => {
          if (
            teacher.role == "RO" ||
            teacher.role == "CUP" ||
            teacher.role == "CD"
          ) {
            connectedUserFilter.push(teacher);
          }
        });
        teachers = connectedUserFilter;

        break;
      case "CUP":
        teachers = await knex("user")
          .select("*")
          .whereNot("id", id)
          .where("role", "TEACHER")
          .orWhere("role", "RO")
          .orWhere("role", "RDI")
          .orWhere("role", "CD")
          .andWhere("up", up)
          .leftJoin("teacher_ratting", function () {
            this.on("user.id", "=", "teacher_ratting.teacher_rated_id").andOn(
              "teacher_ratting.teacher_rate_id",
              "=",
              id
            );
          });
        break;
      case "RO":
        teachers = await knex("user")
          .select("*")
          .whereNot("id", id)
          .whereIn("role", ["CUP", "CD"])
          .andWhere("up", up)
          .leftJoin("teacher_ratting", function () {
            this.on("user.id", "=", "teacher_ratting.teacher_rated_id").andOn(
              "teacher_ratting.teacher_rate_id",
              "=",
              id
            );
          });
        let test = [];
        teachers.map((teacher) => {
          if (
            teacher.role == "TEACHER" &&
            teacher.option == connectedUsers.option
          ) {
            test.push(teacher);
          } else if (teacher.role !== "TEACHER") {
            test.push(teacher);
          }
        });
        teachers = test;
        break;
      case "RDI":
        let connectedUserFilters = [];
        teachers = await knex("user")
          .select("*")
          .whereNot({ id: id, role: "STUDENT" })
          .whereIn("role", ["CUP", "RO"])
          .leftJoin("teacher_ratting", function () {
            this.on("user.id", "=", "teacher_ratting.teacher_rated_id").andOn(
              "teacher_ratting.teacher_rate_id",
              "=",
              id
            );
          });
        teachers.map((teacher) => {
          if (
            teacher.option == connectedUsers.option ||
            teacher.role == "CUP" ||
            teacher.role == "CD"
          ) {
            connectedUserFilters.push(teacher);
          }
        });
        teachersRdi = await knex("user")
          .select("*")
          .whereNot({ id: id, role: "STUDENT" })
          .andWhere({ up: up, rdi: id })
          .leftJoin("teacher_ratting", function () {
            this.on("user.id", "=", "teacher_ratting.teacher_rated_id").andOn(
              "teacher_ratting.teacher_rate_id",
              "=",
              id
            );
          });
        teachersRdi.map((teacher) => {
          if (teacher.option == connectedUsers.option) {
            teacher["rdi_affectation"] = true;
            connectedUserFilters.push(teacher);
          }
        });
        teachers = connectedUserFilters;
        break;
      case "CD":
        teachers = await knex("user")
          .select("*")
          .whereNot("id", id)
          .where("role", "CUP")
          .orWhere("role", "RO")
          .orWhere("role", "RDI")
          .andWhere("up", up)
          .leftJoin("teacher_ratting", function () {
            this.on("user.id", "=", "teacher_ratting.teacher_rated_id").andOn(
              "teacher_ratting.teacher_rate_id",
              "=",
              id
            );
          });
        break;
      default:
        teachers = await knex("user")
          .select("*")
          .whereNot("id", id)
          .andWhere("up", up)
          .leftJoin("teacher_ratting", function () {
            this.on("user.id", "=", "teacher_ratting.teacher_rated_id").andOn(
              "teacher_ratting.teacher_rate_id",
              "=",
              id
            );
          });
        break;
    }
    res.teachers = teachers;
    next();
  } catch (error) {
    console.error(error);
  }
};
exports.deleteRdi = async (req, res, next) => {
  try {
    const teacherId = req.body.id;
    const id = req.payload.id;
    let addTeacher = await knex("user")
      .where({ id: teacherId })
      .update({ rdi: null })
      .returning("*")
      .then((rows) => rows[0]);
    res.teachers = addTeacher;
    next();
  } catch (error) {
    console.error(error);
  }
};
exports.addRdi = async (req, res, next) => {
  try {
    const teacherId = req.body.id;
    const id = req.payload.id;
    let addTeacher = await knex("user")
      .where({ id: teacherId })
      .update({ rdi: id })
      .returning("*")
      .then((rows) => rows[0]);
    res.teachers = addTeacher;
    next();
  } catch (error) {
    console.error(error);
  }
};

exports.addTeacher = async (req, res, next) => {
  try {
    const teacher = req.body;
    const addTeacher = await knex("user")
      .insert(teacher)
      .returning("*")
      .then((rows) => rows[0]);
    res.teachers = addTeacher;
    next();
  } catch (error) {
    console.error(error);
  }
};
exports.getRoTeachers = async (req, res, next) => {
  try {
    const teachers = await knex("user").select("*").orWhere("role", "RO");
    res.teachers = teachers;
  } catch (error) {
    console.error(error);
  }
  next();
};
exports.getRoTeachersStudents = async (req, res, next) => {
  try {
    const id = req.payload.id;
    const classId = req.payload.student_class;
    data = [];

    const classroom = await knex("classroom")
      .where({ classroom_id: classId })
      .first();
    const extractedString = classroom.name_class.replace(/\d+/g, "");
    let teachers = await knex("user")
      .select("*")
      .where({ role: "RO" })
      .andWhere({ option: extractedString })
      .leftOuterJoin("ro_ratting ", "user.id", "=", "teacher_ratting_id");

    teachers.forEach((teacher) => {
      if (teacher.student_ratting_id == id) {
        data.push(teacher);
      }
    });
    if (data.length < 1) {
      teachers.filter(async (o) => {
        if (o.student_ratting_id !== id) {
          o.value = null;
          o.student_ratting_id = null;
          o.teacher_ratting_id = null;
          if (data.length < 1) {
            data.push(o);
          }
        }
      });
    }

    res.teachers = data;
  } catch (error) {
    console.error(error);
  }
  next();
};
exports.framingTeacher = async (req, res, next) => {
  try {
    const id = req.payload.id;
    const connectedUser = await knex("user").where({ id: id });
    const framingId = connectedUser[0].framing;
    const contacts = await knex("user")
      .where({ id: framingId })
      .leftOuterJoin("framing_ratting", "teacher_rated_id", "=", "user.id");
    const teacher = {};
    contacts.forEach((element) => {
      const teacher_id = element.id;
      if (!teacher[teacher_id]) {
        teacher[teacher_id] = {
          id: element.id,
          first_name: element.first_name,
          last_name: element.last_name,
          email: element.email,
          phone: element.phone,
          image: element.image,
          up: element.up,
          role: element.role,
          ratting: element.value,
        };
      }
    });
    const result = Object.values(teacher);
    res.teachers = result;
    next();
  } catch (error) {
    console.error(error);
  }
};
exports.reclaim = async (req, res, next) => {
  try {
    const id = req.payload.id;
    const user = await knex("user")
      .update({ reclamation: "PENDING" })
      .where({ id: id })
      .returning("*")
      .then((rows) => rows[0]);
    res.user = user;
    next();
  } catch (error) {
    console.log(error);
  }
};

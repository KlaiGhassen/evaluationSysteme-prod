let knex = require("./knex");
exports.addClassRoom = async (req, res, next) => {
  try {
    const classRoom = {
      name_class: req.body.name_class,
      teacher_id: req.body.teacher_id,
    };
    const classRooms = await knex("classroom")
      .insert(classRoom)
      .returning("*")
      .then((rows) => rows[0]);
    res.classRoom = classRooms;
    next();
  } catch (error) {
    console.error(error);
  }
};

exports.getAllClassrooms = async (req, res, next) => {
  try {
    const id = req.payload.id;
    const role = req.payload.role;
    var classRooms;
    if (role === "ADMIN") {
      classRooms = await knex.select("*").from("classroom");
    } else {

      classRooms = await knex
        .select("*")
        .from("classroom")
        .join(
          "teacher_class",
          "teacher_class.classroom",
          "=",
          "classroom.classroom_id"
        )
        .where("teacher_class.teacher_id", "=", id);
    }

    data = {};
    classRooms.forEach((element) => {
      const classroom_id = element.classroom_id;
      if (!data[classroom_id]) {
        data[classroom_id] = {
          classroom_id: element.classroom_id,
          name_class: element.name_class,
          class: element.class,
          university_year: element.university_year,
          rate: element.rate,
          created_at: element.created_at,
          updated_at: element.updated_at,
        };
      }
    });
    const result = Object.values(data);
    result.sort((a, b) => (a.name_class > b.name_class ? 1 : -1));
    res.classRooms = result;
    next();
  } catch (error) {
    console.error(error);
  }
};

exports.addQuestionToAnswer = async (req, res, next) => {
  try {
    const questionsToAnswer = await knex("questions_to_answer")
      .insert(req.body.tag)
      .returning("*")
      .then((rows) => rows[0]);
    res.questionsToAnswer = questionsToAnswer;
    next();
  } catch (error) {
    console.error(error);
  }
};
exports.affectations = async (req, res, next) => {
  try {
    const affectations = await knex("teacher_class")
      .insert(req.body)
      .returning("*")
      .then((rows) => rows[0]);
    res.affectations = affectations;
    next();
  } catch (error) {
    console.error(error);
  }
};
exports.delAffectations = async (req, res, next) => {
  try {
    const affectationId = {
      teacher_id: req.query.teacher_id,
      classroom: req.query.classroom_id,
      module: req.query.module_id,
    };
    const affectations = await knex("teacher_class").where(affectationId).del();
    res.affectations = affectations;
    next();
  } catch (error) {
    console.error(error);
  }
};
exports.launchRate = async (req, res, next) => {
  try {
    moduleClass = req.body;
    await knex("module")
      .where({ id_module: moduleClass.id })
      .update({ isratedclassroom: true });
    for (let classroom of moduleClass.classRooms) {
      await knex("classroom")
        .where({ classroom_id: classroom.classroom_id })
        .update({ rate: true });
    }

    res.affectations = true;
    next();
  } catch (error) {
    console.error(error);
  }
};

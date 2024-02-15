let knex = require("./knex");

exports.addRatting = async (req, res, next) => {
  try {
    let rattingDb;
    const classroom_id = req.payload.student_class;
    const id = req.payload.id;
    const ratting = {
      value: req.body.value,
      teacher_ratting_id: req.body.teacher_ratting_id,
      student_ratting_id: id,
      classroom_id: classroom_id,
    };
    let rate = await knex("student_ratting")
      .where("teacher_ratting_id", req.body.teacher_ratting_id)
      .andWhere("student_ratting_id", req.body.student_ratting_id)
      .first();
    if (!rate) {
      rattingDb = await knex("student_ratting")
        .insert(ratting)
        .returning("*")
        .then((rows) => rows[0]);
    } else {
      rattingDb = await knex("student_ratting")
        .update({ value: req.body.value })
        .where("teacher_ratting_id", req.body.teacher_ratting_id)
        .andWhere("student_ratting_id", req.body.student_ratting_id)
        .returning("*")
        .then((rows) => rows[0]);
    }
    res.classRoom = rattingDb;
    next();
  } catch (error) {
    console.error(error);
  }
};
exports.addRattingRo = async (req, res, next) => {
  try {
    const ratting = {
      value: req.body.value,
      teacher_ratting_id: req.body.teacher_ratting_id,
      student_ratting_id: req.body.student_ratting_id,
    };

    rattingDb = await knex("ro_ratting")
      .insert(ratting)
      .returning("*")
      .then((rows) => rows[0]);

    res.classRoom = rattingDb;
    next();
  } catch (error) {
    console.error(error);
  }
};
exports.addTeacherRatting = async (req, res, next) => {
  try {
    let rattingDb;
    console.log(req.body.type);
    const ratting = {
      value: req.body.value,
      teacher_rated_id: req.body.teacher_rated_id,
      teacher_rate_id: req.body.teacher_rate_id,
      type: req.body.type,
    };
    let rate = await knex("teacher_ratting")
      .where("teacher_rated_id", req.body.teacher_rated_id)
      .andWhere("teacher_rate_id", req.body.teacher_rate_id)
      .first();
    if (rate) {
      rattingDb = true;
      res.classRoom = rattingDb;
    } else {
      rattingDb = await knex("teacher_ratting")
        .insert(ratting)
        .returning("*")
        .then((rows) => rows[0]);
      res.classRoom = rattingDb;
    }

    next();
  } catch (error) {
    console.error(error);
  }
};
exports.addFramingRatting = async (req, res, next) => {
  try {
    const ratting = {
      value: req.body.value,
      teacher_rated_id: req.body.teacher_rated_id,
      student_ratting_id: req.body.student_ratting_id,
    };
    const rattingDb = await knex("framing_ratting")
      .insert(ratting)
      .returning("*")
      .then((rows) => rows[0]);
    res.classRoom = rattingDb;
    next();
  } catch (error) {
    console.error(error);
  }
};

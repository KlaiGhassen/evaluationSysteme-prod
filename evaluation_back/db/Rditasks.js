require("dotenv").config();
let knex = require("./knex");
exports.addTask = async (req, res, next) => {
  try {
    const rdiTask = await knex("rdi_task")
      .insert({
        title: req.body.task.title,
        description: req.body.task.description,
        teacher_task: req.body.task.teacher_task,
      })
      .returning("*")
      .then((rows) => rows[0]);
    res.task = rdiTask;
    next();
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

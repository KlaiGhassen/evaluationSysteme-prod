const express = require("express");
const router = express.Router();
const teachersController = require("../db/userDb");

router.get("/", teachersController.mtcAll, (req, res) => {
  res.status(200).json((teachers = res.teachers));
});
router.get("/stc-all", teachersController.stcAll, (req, res) => {
  res.status(200).json((teachers = res.teachers));
});
router.get("/framing", teachersController.framingTeacher, (req, res) => {
  res.status(200).json((teachers = res.teachers));
});
router.get("/ro-student", teachersController.getRoTeachersStudents, (req, res) => {
  res.status(200).json((teachers = res.teachers));
});

module.exports = router;

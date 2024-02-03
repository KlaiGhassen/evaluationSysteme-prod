const express = require("express");
const router = express.Router();
const teachersController = require("../db/userDb");

router.put("/rdi-delete", teachersController.deleteRdi, (req, res) => {
  res.status(200).json((teachers = res.teachers));
});
router.put("/rdi-add", teachersController.addRdi, (req, res) => {
  res.status(200).json((teachers = res.teachers));
});
router.get("/search", teachersController.searchTeacher, (req, res) => {
  res.status(200).json((teachers = res.teachers));
});
router.get("/all", teachersController.getAllTeachers, (req, res) => {
  res.status(200).json((teachers = res.teachers));
});
router.get("/ro", teachersController.getRoTeachers, (req, res) => {
  res.status(200).json((teachers = res.teachers));
});
router.get("/same-team", teachersController.getTeam, (req, res) => {
  res.status(200).json((teachers = res.teachers));
});
router.get("/rdi-team", teachersController.getTeamAffectedRdi, (req, res) => {
  res.status(200).json((teachers = res.teachers));
});
router.get("/not-rdi", teachersController.getNotdRdi, (req, res) => {
  res.status(200).json((teachers = res.teachers));
});

router.post("/add-teacher", teachersController.addTeacher, (req, res) => {
  res.status(200).json((teachers = res.teachers));
});

module.exports = router;

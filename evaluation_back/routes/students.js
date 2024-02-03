const express = require("express");
const router = express.Router();
const studentController = require("../db/studentsDb");

router.get(
  "/all-students",
  studentController.searchMiddleware,
  studentController.getSortedPorducts
);
router.get("/", studentController.studentsById, (req, res) => {
  res.status(200).json((student = res.student));
});
router.post(
  "/fileStudents",
  studentController.addStudentFile
);
router.get("/search", studentController.searchStudent, (req, res) => {
  res.status(200).json((student = res.student));
});
router.get("/all", studentController.getAllStudents, (req, res) => {
  res.status(200).json((student = res.student));
});
router.get("/same-team", studentController.getTeam, (req, res) => {
  res.status(200).json((student = res.student));
});
router.post("/add-teacher", studentController.addStudent, (req, res) => {
  res.status(200).json((student = res.student));
});
router.put(
  "/affectationFraming",
  studentController.affectationFraming,
  (req, res) => {
    res.status(200).json((student = res.student));
  }
);

module.exports = router;

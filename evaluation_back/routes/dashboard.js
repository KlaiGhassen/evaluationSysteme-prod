require("dotenv").config();
const express = require("express");
const router = express.Router();
const dashboard = require("../db/dashboardDb");

router.get("/all", dashboard.getTeachingData, (req, res) => {
  res.status(200).json((teachers = res.teachers));
});
router.get(
  "/allByClassRooms",
  dashboard.getTeachingDataByClassRooms,
  (req, res) => {
    res.status(200).json((teachers = res.teachers));
  }
);
router.get("/framingById/:id", dashboard.getFramingDataById, (req, res) => {
  res.status(200).json((teachers = res.teachers));
});
router.get("/allframing", dashboard.getFramingData, (req, res) => {
  res.status(200).json((teachers = res.teachers));
});
router.get("/allstudents", dashboard.studentNumber, (req, res) => {
  res.status(200).json((teachers = res.teachers));
});
router.get("/studentNumber", dashboard.studentNumber, (req, res) => {
  res.status(200).json((teachers = res.teachers));
});
router.get(
  "/ratedChartUser/:id",
  dashboard.getStudentTeacherRattingUser,
  (req, res) => {
    res.status(200).json((teachers = res.teachers));
  }
);
router.get("/ratedChart", dashboard.getStudentTeacherRatting, (req, res) => {
  res.status(200).json((teachers = res.teachers));
});
router.get("/teachersRate/:id", dashboard.getTeachersRate, (req, res) => {
  res.status(200).json((teachers = res.teachers));
});

module.exports = router;

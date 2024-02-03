require("dotenv").config();
const express = require("express");
const router = express.Router();
const ueController = require("../db/ueDb");

router.get("/by-id/:id", ueController.getModuleById, async (req, res) => {
  res.status(200).json(res.data);
});
// get all courses
router.get("/all-ue", async (req, res) => {
  const courses = await ueController.getAllCourses();
  res.status(200).json(courses);
});
// get all courses
router.get("/all-class", async (req, res) => {
  const classrooms = await ueController.getAllClassRooms();
  res.status(200).json(classrooms);
});
router.get("/all-cum", async (req, res) => {
  const data = await ueController.getAllUCM();
  res.status(200).json(data);
});
router.get("/all-modules", async (req, res) => {
  const data = await ueController.getAllModules();
  res.status(200).json(data);
});

router.post("/addOne", ueController.addModule, async (req, res) => {
  res.status(200).json(res.data);
});
router.post("/addOneUe", ueController.addUe, async (req, res) => {
  res.status(200).json(res.data);
});

module.exports = router;

require("dotenv").config();
const express = require("express");
const router = express.Router();
const rattingController = require("../db/rattingDb");
router.post("/ro", rattingController.addRattingRo, (req, res) => {
  res.status(200).json(res.classRoom);
});
router.post("/", rattingController.addRatting, (req, res) => {
  res.status(200).json(res.classRoom);
});

router.post("/teacher", rattingController.addTeacherRatting, (req, res) => {
  res.status(200).json(res.classRoom);
});
router.post("/framing", rattingController.addFramingRatting, (req, res) => {
  res.status(200).json(res.classRoom);
});

module.exports = router;

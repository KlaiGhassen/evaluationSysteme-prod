require("dotenv").config();
const express = require("express");
const { addSeance, getSeances, presence, getCalendarsPerClasses } = require("../db/seanceMangment");
const storage = require("../middleware/storage");

const router = express.Router();
router.get("/calendars", getCalendarsPerClasses, (req, res) => {
  res.status(200).json(res.calendars);
});
router.post("/", addSeance, (req, res) => {
  res.status(200).json(true);
});

router.get("/", getSeances, (req, res) => {
  res.status(200).json(res.seances);
});
router.get("/qrcode/:nom", storage.getQrCode);
router.get("/pdf/:nom", storage.getPdfQrCode);

router.post("/presence/:mode", presence, (req, res) => {
  res.json(res.seance_student);
});

module.exports = router;

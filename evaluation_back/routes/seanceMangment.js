require("dotenv").config();
const express = require("express");
const { addSeance, getSeances, presence } = require("../db/seanceMangment");
const storage = require("../middleware/storage");

const router = express.Router();

router.post("/", addSeance, (req, res) => {
  res.status(200).json("seanceMangment");
});

router.get("/", getSeances, (req, res) => {
  res.status(200).json(res.seances);
});
router.get("/qrcode/:nom", storage.getQrCode);
router.post("/presence", presence, (req, res) => {
  res.json(res.seance_student);
});

module.exports = router;

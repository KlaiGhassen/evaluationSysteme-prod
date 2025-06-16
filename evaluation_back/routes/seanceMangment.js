require("dotenv").config();
const express = require("express");
const {
  addSeance,
  getSeances,
  presence,
  getCalendarsPerClasses,
  getSessionAudience,
  getSessionAttendance
} = require("../db/seanceMangment");
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
//TODO: CH7AB YGOUL B :MODE
//router.post("/presence/:mode", presence, (req, res) => {
//  res.json(res.seance_student);
//});
router.post("/presence", presence, (req, res) => {
  res.json(res.seance_student);
});

router.get('/audience/:sessionId', async (req, res) => {
    try {
        const sessionId = req.params.sessionId;
        const audience = await getSessionAudience(sessionId);
        res.json(audience);
    } catch (error) {
        console.error('Error getting session audience:', error);
        res.status(500).json({ message: 'Error getting session audience' });
    }
});

router.get('/attendance/:sessionId', async (req, res) => {
    try {
        const sessionId = req.params.sessionId;
        const attendance = await getSessionAttendance(sessionId);
        res.json(attendance);
    } catch (error) {
        console.error('Error getting session attendance:', error);
        res.status(500).json({ message: 'Error getting session attendance' });
    }
});

module.exports = router;

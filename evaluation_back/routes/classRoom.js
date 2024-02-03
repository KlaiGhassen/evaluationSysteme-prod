const express = require("express");
const router = express.Router();
const classRoomController = require("../db/classRoomDb");
const ueController = require("../db/ueDb");
var mailerMiddleware = require("../middleware/mailer");

router.post("/", classRoomController.addClassRoom, (req, res) => {
  res.status(200).json(res.classRoom);
});

router.get("/", classRoomController.getAllClassrooms, (req, res) => {
  res.status(200).json(res.classRooms);
});

router.post(
  "/question-to-answer",
  classRoomController.addQuestionToAnswer,
  (req, res) => {
    res.status(200).json(res.questionsToAnswer);
  }
);
router.post(
  "/affectationTeacherModule",
  classRoomController.affectations,
  (req, res) => {
    res.status(200).json(res.affectations);
  }
);
router.delete(
  "/deleteAffectation",
  classRoomController.delAffectations,
  (req, res) => {
    res.status(200).json(res.affectations);
  }
);
router.patch(
  "/launchRate",
  classRoomController.launchRate,
  mailerMiddleware.complaintMail,
  async (req, res) => {
    const data = await ueController.getAllUCM();
    res.status(200).json(data);
  }
);

module.exports = router;

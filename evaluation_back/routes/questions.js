const express = require("express");
const router = express.Router();
const questionsController = require("../db/questionsDb");

router.post("/", questionsController.addQuestions, (req, res) => {
  res.status(200).json(res.question);
});
// router.patch("/:id", questionsController.addQuestions, (req, res) => {
//   res.status(200).json(res.questions);
// });
router.get("/", questionsController.getAllQuestions, (req, res) => {
  res.status(200).json(res.questions);
});

//! sections
router.post("/sections", questionsController.addSection, (req, res) => {
  res.status(200).json(res.sections);
});
router.patch("/", questionsController.updateQuestions, (req, res) => {
  res.status(200).json(res.question);
});

//! affectation  questions to sections
router.patch(
  "/sections-affectation",
  questionsController.updateSectionAffectation,
  (req, res) => {
    res.status(200).json(res.section);
  }
);
router.get(
  "/sections-affectation",
  questionsController.getQuestionsAffectation,
  (req, res) => {
    res.status(200).json(res.affectation);
  }
);

router.get(
  "/sections-affectation/:id",
  questionsController.getQuestionsAffectationById,
  (req, res) => {
    res.status(200).json(res.affectation);
  }
);
router.get(
  "/questions-for-students/:id",
  questionsController.getQuestionsForStudents,
  (req, res) => {
    res.status(200).json(res.affectation);
  }
);

module.exports = router;

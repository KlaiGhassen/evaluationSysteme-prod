const express = require("express");
const router = express.Router();
const upController = require("../db/upDb");

router.get("/", upController.getAllUp, (req, res) => {
  res.status(200).json(res.up);
});
router.post("/", upController.addUp, (req, res) => {
  res.status(200).json(res.up);
});
router.get("/hearchy", upController.GetHeiarchy, (req, res) => {
  res.status(200).json(res.orgData);
});

module.exports = router;

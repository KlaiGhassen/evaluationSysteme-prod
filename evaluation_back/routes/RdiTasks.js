const express = require("express");
const router = express.Router();
const rdiController = require("../db/Rditasks");

router.post("/", rdiController.addTask, (req, res) => {
  res.status(200).json((task = res.task));
});

module.exports = router;

const express = require("express");
const router = express.Router();
const solController = require("../db/solDb");

router.put("/solUser", solController.updateKeyUser, (req, res) => {
  res.status(200).json(res.user);
});
router.post("/splinfo", solController.addTokenInfo, (req, res) => {
  res.status(200).json(res.spl);
});
router.get("/splinfo", solController.getTokenInfo, (req, res) => {
  res.status(200).json(res.spl);
});

module.exports = router;

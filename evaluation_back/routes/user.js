require("dotenv").config();
const express = require("express");
const router = express.Router();
const userController = require("../db/userDb");

const storage = require("../middleware/storage");

// get all Users
router.get("/all", userController.getAllUsers, (req, res) => {
  res.status(200).json((user = res.user));
});
router.get("/students/:id", userController.getAllUsersByClass, (req, res) => {
  res.status(200).json((user = res.user));
});
router.patch(
  "/updateUserAdmin",
  userController.updateUserFromAdmin,
  (req, res) => {
    res.status(200).json((user = res.user));
  }
);
// update a user
router.patch(
  "/profile-picture",
  storage.upload_file("image"),
  userController.updateImage,
  (req, res) => {
    res.status(200).json((user = res.user));
  }
);
router.patch("/", userController.updateUser, (req, res) => {
  res.status(200).json(res.user);
});

router.patch("/user-pwd", userController.checkPwd, (req, res) => {
  res.status(200).json(res.user);
});
router.patch("/reclaim", userController.reclaim, (req, res) => {
  res.status(200).json(res.user);
});

router.get("/profile-picture/:nom", storage.getUserImage);

module.exports = router;

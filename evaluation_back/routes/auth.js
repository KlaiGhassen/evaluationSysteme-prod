require("dotenv").config();
const express = require("express");
const router = express.Router();
const authController = require("../db/authQueries");
const authenticateToken = require("../middleware/authorize");
const storage = require("../middleware/storage");

router.post("/msalPicture", storage.upload_file("image"), (req, res) => {
  console.log(req.file.filename);

  res.status(200).json(req.file.filename);
});

router.post("/msal", authController.msallLogin, (req, res) => {
  res.cookie("refreshToken", res.refreshToken, {
    httpOnly: true,
  });

  console.log(res.user);

  res.status(200).json({
    user: res.user,
    accessToken: res.accessToken,
  });
});
//! get access token from refresh token
router.get("/token", authController.getAccesTokenFromRefreshToken);
// ! get a user from token
router.get(
  "/refresh-access-token",
  authenticateToken,
  authController.getUserFromToken,
  (req, res) => {
    res.status(200).json({
      user: res.user,
      accessToken: res.accessToken,
    });
  }
);
router.get(
  "/user",
  authenticateToken,
  authController.getUserFromToken,
  (req, res) => {
    res.status(200).json(res.user);
  }
);
router.get("/current-user", authenticateToken, authController.getCurrentUser);

//! logout the user
router.delete("/logout", authenticateToken, authController.logout);

router.get("/profile-picture/:nom", storage.getUserImage);

//! login routes calls login method on controller
router.post("/sign-in", authController.login, (req, res) => {
  res.cookie("refreshToken", res.refreshToken, {
    httpOnly: true,
  });

  res.status(200).json({
    user: res.user,
    accessToken: res.accessToken,
  });
});

router.post("/social-sign-in", authController.socialLogin, (req, res) => {
  res.cookie("refreshToken", res.refreshToken, {
    httpOnly: true,
  });

  res.status(200).json({
    user: res.user,
    accessToken: res.accessToken,
  });
});

module.exports = router;

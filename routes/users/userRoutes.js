const express = require("express");

const {
  login,
  forgotPassword,
  resetPassword,
  signup,
  logout
} = require("../../controller/userCtrl");
const verifySession = require("../../utils/Middleware ");
const router = express.Router();

///login
router.post("/login", login);


//logout
router.post("/logout", verifySession, logout);

////register
router.post("/register", signup);

///forgotPassword
router.post("/forgotPassword", forgotPassword);

// post resetPassword
router.post("/resetPassword/:token", resetPassword);

module.exports = router;

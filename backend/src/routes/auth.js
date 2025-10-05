const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  logout,
  verifyEmail,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { validate, userSchemas } = require("../middleware/validation");

router.post("/register", validate(userSchemas.register), register);
router.post("/login", validate(userSchemas.login), login);
router.get("/me", protect, getMe);
router.get("/logout", protect, logout);
router.get("/verify-email/:token", verifyEmail);

module.exports = router;

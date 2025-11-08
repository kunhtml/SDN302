const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getProfile,
  updateProfile,
  updatePassword,
  getAddresses,
  addAddress,
  switchRole,
  requestSeller,
} = require("../controllers/userController");

router.use(protect);

// Profile routes
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/password", updatePassword);

// Address routes
router.get("/addresses", getAddresses);
router.post("/addresses", addAddress);

// Role switching routes
router.post("/switch-role", switchRole);
router.post("/request-seller", requestSeller);

module.exports = router;

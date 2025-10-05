const express = require("express");
const router = express.Router();
const { protect, isVerifiedSeller } = require("../middleware/auth");

router.post("/validate", protect, (req, res) => {
  res.json({ success: true, valid: true, discount: 10 });
});

router.get("/", protect, isVerifiedSeller, (req, res) => {
  res.json({ success: true, data: [] });
});

router.post("/", protect, isVerifiedSeller, (req, res) => {
  res.json({ success: true, message: "Coupon created" });
});

module.exports = router;

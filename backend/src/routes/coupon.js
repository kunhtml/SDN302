const express = require("express");
const router = express.Router();
const { protect, isVerifiedSeller } = require("../middleware/auth");
const {
  getSellerCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  applyCoupon,
} = require("../controllers/couponController");

// Public routes
router.get("/validate/:code", validateCoupon);

// Protected routes
router.post("/apply", protect, applyCoupon);

// Seller routes
router.get("/seller", protect, isVerifiedSeller, getSellerCoupons);
router.post("/", protect, isVerifiedSeller, createCoupon);
router.put("/:id", protect, isVerifiedSeller, updateCoupon);
router.delete("/:id", protect, isVerifiedSeller, deleteCoupon);

module.exports = router;

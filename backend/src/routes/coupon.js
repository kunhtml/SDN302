const express = require("express");
const router = express.Router();
const { protect, isVerifiedSeller, isAdmin } = require("../middleware/auth");
const {
  getSellerCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  applyCoupon,
  getAvailableCoupons,
  getAllCoupons,
  getCouponById,
  updateCouponStatus,
} = require("../controllers/couponController");

// Public routes
router.get("/available", getAvailableCoupons);
router.get("/validate/:code", validateCoupon);

// Protected routes
router.post("/apply", protect, applyCoupon);

// Seller-specific routes (must use /seller prefix to avoid conflicts)
router.get("/seller", protect, isVerifiedSeller, getSellerCoupons);

// Admin routes
router.get("/", protect, isAdmin, getAllCoupons);
router.put("/:id/status", protect, isAdmin, updateCouponStatus);

// Seller CRUD routes (create/update/delete work for both seller and admin)
router.post("/", protect, isVerifiedSeller, createCoupon);
router.get("/:id", protect, getCouponById);
router.put("/:id", protect, updateCoupon);
router.delete("/:id", protect, deleteCoupon);

module.exports = router;

const express = require("express");
const router = express.Router();
const { protect, isVerifiedSeller } = require("../middleware/auth");
const {
  getSellerFeedback,
  getMyFeedback,
} = require("../controllers/feedbackController");

// Public routes
router.get("/seller/:sellerId", getSellerFeedback);

// Protected routes - Seller
router.get("/my-feedback", protect, isVerifiedSeller, getMyFeedback);

module.exports = router;

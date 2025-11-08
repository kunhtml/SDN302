const express = require("express");
const router = express.Router();
const { protect, isVerifiedSeller } = require("../middleware/auth");
const {
  getProductReviews,
  getSellerReviews,
  createReview,
  updateReview,
  deleteReview,
  addSellerResponse,
  updateSellerResponse,
  deleteSellerResponse,
  markHelpful,
} = require("../controllers/reviewController");

// Public routes
router.get("/product/:productId", getProductReviews);

// Protected routes - Buyer
router.post("/", protect, createReview);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);
router.post("/:id/helpful", protect, markHelpful);

// Protected routes - Seller
router.get("/seller", protect, isVerifiedSeller, getSellerReviews);
router.post("/:id/response", protect, isVerifiedSeller, addSellerResponse);
router.put("/:id/response", protect, isVerifiedSeller, updateSellerResponse);
router.delete("/:id/response", protect, isVerifiedSeller, deleteSellerResponse);

module.exports = router;

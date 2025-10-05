const express = require("express");
const router = express.Router();
const { protect, isVerifiedSeller } = require("../middleware/auth");
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getAuctionProducts,
} = require("../controllers/productController");

// Public routes
router.get("/", getProducts);
router.get("/featured", getFeaturedProducts);
router.get("/auctions", getAuctionProducts);
router.get("/:id", getProduct);

// Protected routes - Seller only
router.post("/", protect, isVerifiedSeller, createProduct);
router.put("/:id", protect, isVerifiedSeller, updateProduct);
router.delete("/:id", protect, isVerifiedSeller, deleteProduct);

module.exports = router;

const express = require("express");
const router = express.Router();
const { protect, isVerifiedSeller } = require("../middleware/auth");
const {
  getOrders,
  getSellerOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  cancelOrder,
} = require("../controllers/orderController");

// Seller routes - must be before /:id route
router.get("/seller", protect, isVerifiedSeller, getSellerOrders);

// User routes
router.use(protect);
router.get("/", getOrders);
router.post("/", createOrder);
router.get("/:id", getOrder);
router.put("/:id/cancel", cancelOrder);
router.put("/:id/status", isVerifiedSeller, updateOrderStatus);

module.exports = router;

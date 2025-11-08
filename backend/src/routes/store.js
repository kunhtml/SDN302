const express = require("express");
const router = express.Router();
const { protect, isVerifiedSeller } = require("../middleware/auth");
const {
  getStore,
  getMyStore,
  createStore,
  updateStore,
  getStores,
} = require("../controllers/storeController");

// Public routes
router.get("/", getStores);

// Protected routes (Seller only) - Must come before /:id to avoid conflicts
router.get("/my-store", protect, isVerifiedSeller, getMyStore);
router.post("/", protect, isVerifiedSeller, createStore);
router.put("/", protect, isVerifiedSeller, updateStore);

// Dynamic routes - Must come after specific routes
router.get("/:id", getStore);

module.exports = router;

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
router.get("/:id", getStore);

// Protected routes (Seller only)
router.get("/my-store", protect, isVerifiedSeller, getMyStore);
router.post("/", protect, isVerifiedSeller, createStore);
router.put("/", protect, isVerifiedSeller, updateStore);

module.exports = router;

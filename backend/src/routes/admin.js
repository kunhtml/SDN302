const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getDashboardStats,
  getUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getProducts,
  deleteProduct,
  getOrders,
  getDisputes,
  resolveDispute,
} = require("../controllers/adminController");

router.use(protect);
router.use(authorize("admin"));

// Dashboard
router.get("/stats", getDashboardStats);

// Users
router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id/status", updateUserStatus);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

// Products
router.get("/products", getProducts);
router.delete("/products/:id", deleteProduct);

// Orders
router.get("/orders", getOrders);

// Disputes
router.get("/disputes", getDisputes);
router.put("/disputes/:id/resolve", resolveDispute);

module.exports = router;

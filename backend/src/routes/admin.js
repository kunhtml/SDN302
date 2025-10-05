const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.use(authorize("admin"));

router.get("/dashboard", (req, res) => {
  res.json({
    success: true,
    data: {
      totalUsers: 0,
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
    },
  });
});

router.get("/users", (req, res) => {
  res.json({ success: true, data: [] });
});

router.put("/users/:id/status", (req, res) => {
  res.json({ success: true, message: "User status updated" });
});

router.get("/products", (req, res) => {
  res.json({ success: true, data: [] });
});

router.delete("/products/:id", (req, res) => {
  res.json({ success: true, message: "Product deleted" });
});

router.get("/orders", (req, res) => {
  res.json({ success: true, data: [] });
});

router.get("/disputes", (req, res) => {
  res.json({ success: true, data: [] });
});

router.put("/disputes/:id/resolve", (req, res) => {
  res.json({ success: true, message: "Dispute resolved" });
});

module.exports = router;

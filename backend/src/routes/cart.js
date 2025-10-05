const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/", (req, res) => {
  res.json({ success: true, data: { items: [], totalItems: 0 } });
});

router.post("/items", (req, res) => {
  res.json({ success: true, message: "Item added to cart" });
});

router.put("/items/:itemId", (req, res) => {
  res.json({ success: true, message: "Cart item updated" });
});

router.delete("/items/:itemId", (req, res) => {
  res.json({ success: true, message: "Item removed from cart" });
});

router.delete("/", (req, res) => {
  res.json({ success: true, message: "Cart cleared" });
});

module.exports = router;

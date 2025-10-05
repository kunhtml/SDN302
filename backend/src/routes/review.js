const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");

router.get("/product/:productId", (req, res) => {
  res.json({ success: true, data: [], message: "Get product reviews" });
});

router.post("/", protect, (req, res) => {
  res.json({ success: true, message: "Review created" });
});

router.put("/:id", protect, (req, res) => {
  res.json({ success: true, message: "Review updated" });
});

router.delete("/:id", protect, (req, res) => {
  res.json({ success: true, message: "Review deleted" });
});

module.exports = router;

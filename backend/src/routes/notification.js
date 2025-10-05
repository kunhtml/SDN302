const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/", (req, res) => {
  res.json({ success: true, data: [] });
});

router.put("/:id/read", (req, res) => {
  res.json({ success: true, message: "Notification marked as read" });
});

router.delete("/:id", (req, res) => {
  res.json({ success: true, message: "Notification deleted" });
});

module.exports = router;

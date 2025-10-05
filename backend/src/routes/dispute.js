const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/", (req, res) => {
  res.json({ success: true, data: [] });
});

router.post("/", (req, res) => {
  res.json({ success: true, message: "Dispute created" });
});

router.get("/:id", (req, res) => {
  res.json({ success: true, data: {} });
});

module.exports = router;

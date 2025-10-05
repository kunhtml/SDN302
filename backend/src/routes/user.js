const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.use(authorize("buyer"));

// User routes will be implemented in userController
router.get("/profile", (req, res) =>
  res.json({ success: true, data: req.user })
);
router.put("/profile", (req, res) =>
  res.json({ success: true, message: "Profile updated" })
);
router.get("/addresses", (req, res) => res.json({ success: true, data: [] }));
router.post("/addresses", (req, res) =>
  res.json({ success: true, message: "Address added" })
);

module.exports = router;

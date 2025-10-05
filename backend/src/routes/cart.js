const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");

router.use(protect);

router.route("/").get(getCart).delete(clearCart);

router.post("/items", addToCart);

router.route("/items/:itemId").put(updateCartItem).delete(removeFromCart);

module.exports = router;

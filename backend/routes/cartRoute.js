const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");

// Add food to cart
router.post("/add", authMiddleware, addToCart);

// Get cart
router.get("/", authMiddleware, getCart);

// Update food quantity
router.put(
  "/update/:foodId",
  authMiddleware,
  updateCartQuantity
);

// Remove food
router.delete(
  "/remove/:foodId",
  authMiddleware,
  removeFromCart
);

// Clear cart
router.delete(
  "/clear",
  authMiddleware,
  clearCart
);

module.exports = router;
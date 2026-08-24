const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  placeOrder,
  getMyOrders,
  getRestaurantOrders,
  updateOrderStatus,
  confirmCodPayment,
} = require("../controllers/orderController");

// Place order
router.post(
  "/place",
  authMiddleware,
  placeOrder
);

// Get my orders - Customer
router.get(
  "/my-orders",
  authMiddleware,
  getMyOrders
);

// Get restaurant orders - Restaurant Owner
router.get(
  "/restaurant-orders",
  authMiddleware,
  getRestaurantOrders
);

// Update order status - Restaurant Owner
router.put(
  "/:id/status",
  authMiddleware,
  updateOrderStatus
);

// Confirm COD payment - Restaurant Owner
router.put(
  "/:id/confirm-cod",
  authMiddleware,
  confirmCodPayment
);

module.exports = router;
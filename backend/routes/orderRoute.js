const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  // CUSTOMER
  placeOrder,
  getMyOrders,

  // RESTAURANT
  getRestaurantOrders,
  updateOrderStatus,
  confirmCodPayment,

  // RIDER
  getAvailableOrdersForRider,
  acceptOrderByRider,
  markOrderPickedUp,
  markOrderOutForDelivery,
  markOrderDelivered,
  getRiderOrders,
  getRiderEarnings,
} = require("../controllers/orderController");

// =====================================================
// CUSTOMER
// =====================================================

router.post(
  "/place",
  authMiddleware,
  allowRoles("customer"),
  placeOrder
);

router.get(
  "/my-orders",
  authMiddleware,
  allowRoles("customer"),
  getMyOrders
);

// =====================================================
// RESTAURANT OWNER
// =====================================================

router.get(
  "/restaurant",
  authMiddleware,
  allowRoles("restaurantOwner"),
  getRestaurantOrders
);

router.put(
  "/restaurant/:id/status",
  authMiddleware,
  allowRoles("restaurantOwner"),
  updateOrderStatus
);

router.put(
  "/restaurant/:id/confirm-cod",
  authMiddleware,
  allowRoles("restaurantOwner"),
  confirmCodPayment
);

// =====================================================
// RIDER
// =====================================================

router.get(
  "/rider/available",
  authMiddleware,
  allowRoles("rider"),
  getAvailableOrdersForRider
);

// ACCEPT DELIVERY
router.post(
  "/:id/accept",
  authMiddleware,
  allowRoles("rider"),
  acceptOrderByRider
);

// PICKED UP
router.put(
  "/:id/picked-up",
  authMiddleware,
  allowRoles("rider"),
  markOrderPickedUp
);

// OUT FOR DELIVERY
router.put(
  "/:id/out-for-delivery",
  authMiddleware,
  allowRoles("rider"),
  markOrderOutForDelivery
);

// DELIVERED
router.put(
  "/:id/delivered",
  authMiddleware,
  allowRoles("rider"),
  markOrderDelivered
);

// RIDER ORDERS
router.get(
  "/rider/orders",
  authMiddleware,
  allowRoles("rider"),
  getRiderOrders
);

// RIDER EARNINGS
router.get(
  "/rider/earnings",
  authMiddleware,
  allowRoles("rider"),
  getRiderEarnings
);

module.exports = router;
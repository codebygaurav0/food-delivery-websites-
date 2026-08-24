const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  getDashboardStats,

  // Restaurant
  getPendingRestaurants,
  approveRestaurant,
  rejectRestaurant,

  // Rider
  getPendingRiders,
  approveRider,
  rejectRider,

  // Customer
  getCustomers,

  // Orders
  getAdminOrders,
} = require("../controllers/adminController");

// =====================================================
// SUPER ADMIN DASHBOARD
// =====================================================

router.get(
  "/dashboard",
  authMiddleware,
  allowRoles("superAdmin"),
  getDashboardStats
);

// =====================================================
// PENDING RESTAURANTS
// =====================================================

router.get(
  "/restaurants/pending",
  authMiddleware,
  allowRoles("superAdmin"),
  getPendingRestaurants
);

// =====================================================
// APPROVE RESTAURANT
// =====================================================

router.put(
  "/restaurants/:id/approve",
  authMiddleware,
  allowRoles("superAdmin"),
  approveRestaurant
);

// =====================================================
// REJECT RESTAURANT
// =====================================================

router.put(
  "/restaurants/:id/reject",
  authMiddleware,
  allowRoles("superAdmin"),
  rejectRestaurant
);

// =====================================================
// RIDER REQUESTS
// =====================================================

router.get(
  "/riders/pending",
  authMiddleware,
  allowRoles("superAdmin"),
  getPendingRiders
);

// =====================================================
// APPROVE RIDER
// =====================================================

router.put(
  "/riders/:id/approve",
  authMiddleware,
  allowRoles("superAdmin"),
  approveRider
);

// =====================================================
// REJECT RIDER
// =====================================================

router.put(
  "/riders/:id/reject",
  authMiddleware,
  allowRoles("superAdmin"),
  rejectRider
);

// =====================================================
// CUSTOMERS
// =====================================================

router.get(
  "/customers",
  authMiddleware,
  allowRoles("superAdmin"),
  getCustomers
);

// =====================================================
// ALL ORDERS
// =====================================================

router.get(
  "/orders",
  authMiddleware,
  allowRoles("superAdmin"),
  getAdminOrders
);

module.exports = router;
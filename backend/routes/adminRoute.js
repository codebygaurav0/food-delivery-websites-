const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  getPendingRestaurants,
  approveRestaurant,
  rejectRestaurant,
} = require("../controllers/adminController");

// ================= PENDING RESTAURANTS =================

router.get(
  "/restaurants/pending",
  authMiddleware,
  allowRoles("superAdmin"),
  getPendingRestaurants
);

// ================= APPROVE =================

router.put(
  "/restaurants/:id/approve",
  authMiddleware,
  allowRoles("superAdmin"),
  approveRestaurant
);

// ================= REJECT =================

router.put(
  "/restaurants/:id/reject",
  authMiddleware,
  allowRoles("superAdmin"),
  rejectRestaurant
);

module.exports = router;
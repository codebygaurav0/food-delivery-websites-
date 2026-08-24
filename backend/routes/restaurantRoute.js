const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  registerRestaurant,
  getAllRestaurants,
  getMyRestaurant,
  getRestaurantMenu,
} = require("../controllers/restaurantController");

// ================= REGISTER RESTAURANT =================

router.post(
  "/register",
  authMiddleware,
  allowRoles("restaurantOwner"),
  registerRestaurant
);

// ================= MY RESTAURANT =================

router.get(
  "/my-restaurant",
  authMiddleware,
  allowRoles("restaurantOwner"),
  getMyRestaurant
);

// ================= ALL RESTAURANTS =================
// Customer

router.get(
  "/",
  getAllRestaurants
);

// ================= RESTAURANT MENU =================
// Customer

router.get(
  "/:restaurantId/menu",
  getRestaurantMenu
);

router.post(
  "/register",
  authMiddleware,
  allowRoles("restaurantOwner"),
  registerRestaurant
);

module.exports = router;
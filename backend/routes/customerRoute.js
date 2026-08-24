const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getRestaurants,
  getRestaurantMenu,
} = require("../controllers/customerController");

// Get approved restaurants
router.get(
  "/restaurants",
  authMiddleware,
  getRestaurants
);

// Get restaurant menu
router.get(
  "/restaurants/:restaurantId/menu",
  authMiddleware,
  getRestaurantMenu
);

module.exports = router;
const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  addFood,
  getMyFoods,
  updateFood,
  deleteFood,
} = require("../controllers/foodController");

// Add food
router.post(
  "/add",
  authMiddleware,
  allowRoles("restaurantOwner"),
  addFood
);

// Get my foods
router.get(
  "/my-foods",
  authMiddleware,
  allowRoles("restaurantOwner"),
  getMyFoods
);

// Update food
router.put(
  "/:id",
  authMiddleware,
  allowRoles("restaurantOwner"),
  updateFood
);

// Delete food
router.delete(
  "/:id",
  authMiddleware,
  allowRoles("restaurantOwner"),
  deleteFood
);

module.exports = router;
const mongoose = require("mongoose");
const Restaurant = require("../models/RestaurantModel");
const User = require("../models/UserModel");
const Food = require("../models/FoodModel");
// ================= REGISTER RESTAURANT =================
const registerRestaurant = async (req, res) => {
  try {
    const {
      restaurantName,
      email,
      phone,
      address,
      city,
      state,
    } = req.body;

    // Required fields
    if (
      !restaurantName ||
      !email ||
      !phone ||
      !address ||
      !city ||
      !state
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check logged-in user
    const owner = await User.findById(req.user.userId);

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: "Owner not found",
      });
    }

    // Restaurant owner check
    if (owner.role !== "restaurantOwner") {
      return res.status(403).json({
        success: false,
        message:
          "Only restaurant owners can register a restaurant",
      });
    }

    // Check existing restaurant
    const existingRestaurant =
      await Restaurant.findOne({
        owner: owner._id,
      });

    if (existingRestaurant) {
      return res.status(400).json({
        success: false,
        message: "Restaurant already registered",
      });
    }

    // Create restaurant
    const restaurant = await Restaurant.create({
      owner: owner._id,
      restaurantName,
      email,
      phone,
      address,
      city,
      state,
    });

    res.status(201).json({
      success: true,
      message:
        "Restaurant registration submitted successfully",
      restaurant,
    });
  } catch (error) {
    console.error(
      "Restaurant Registration Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ================= GET ALL RESTAURANTS =================
const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({
      status: "Approved",
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: restaurants.length,
      restaurants,
    });
  } catch (error) {
    console.error(
      "Get Restaurants Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to fetch restaurants",
      error: error.message,
    });
  }
};

const getMyRestaurant = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.user.userId)) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user is invalid",
      });
    }

    const restaurant = await Restaurant.findOne({
      owner: req.user.userId,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Restaurant loaded successfully",
      restaurant,
    });
  } catch (error) {
    console.error("Get My Restaurant Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load restaurant",
    });
  }
};
// ================= GET RESTAURANT MENU =================

const getRestaurantMenu = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const restaurant =
      await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const foods = await Food.find({
      restaurant: restaurant._id,
      isAvailable: true,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      restaurant,
      foods,
    });
  } catch (error) {
    console.error(
      "Get Restaurant Menu Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to load restaurant menu",
      error: error.message,
    });
  }
};
// ================= EXPORTS =================
module.exports = {
  registerRestaurant,
  getAllRestaurants,
  getMyRestaurant,
  getRestaurantMenu,
};
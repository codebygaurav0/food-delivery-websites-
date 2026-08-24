const Restaurant = require("../models/RestaurantModel");
const mongoose = require("mongoose");

// ================= GET PENDING RESTAURANTS =================
const getPendingRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({
      status: "Pending",
    }).populate("owner", "name email phone");

    res.status(200).json({
      success: true,
      count: restaurants.length,
      restaurants,
    });
  } catch (error) {
    console.error("Get Pending Restaurants Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ================= APPROVE RESTAURANT =================
const approveRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    if (restaurant.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Restaurant is already ${restaurant.status}`,
      });
    }

    restaurant.status = "Approved";
    restaurant.rejectionReason = "";

    await restaurant.save();

    res.status(200).json({
      success: true,
      message: "Restaurant approved successfully",
      restaurant,
    });
  } catch (error) {
    console.error("Approve Restaurant Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ================= REJECT RESTAURANT =================
const rejectRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    if (restaurant.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Restaurant is already ${restaurant.status}`,
      });
    }

    restaurant.status = "Rejected";
    restaurant.rejectionReason = rejectionReason;

    await restaurant.save();

    res.status(200).json({
      success: true,
      message: "Restaurant rejected successfully",
      restaurant,
    });
  } catch (error) {
    console.error("Reject Restaurant Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getPendingRestaurants,
  approveRestaurant,
  rejectRestaurant,
};


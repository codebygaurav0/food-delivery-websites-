const Restaurant = require("../models/RestaurantModel");
const Food = require("../models/FoodModel");

// ================= GET APPROVED RESTAURANTS =================
const getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({
      status: "Approved",
    }).select(
      "restaurantName email phone address city state"
    );

    res.status(200).json({
      success: true,
      count: restaurants.length,
      restaurants,
    });
  } catch (error) {
    console.error("Get Restaurants Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ================= GET RESTAURANT MENU =================
const getRestaurantMenu = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const restaurant = await Restaurant.findOne({
      _id: restaurantId,
      status: "Approved",
    }).select(
      "restaurantName address city state"
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const foods = await Food.find({
      restaurant: restaurantId,
      isAvailable: true,
    }).sort({
      category: 1,
      name: 1,
    });

    res.status(200).json({
      success: true,
      restaurant,
      count: foods.length,
      foods,
    });
  } catch (error) {
    console.error("Get Restaurant Menu Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getRestaurants,
  getRestaurantMenu,
};
const Food = require("../models/FoodModel");
const Restaurant = require("../models/RestaurantModel");
const mongoose = require("mongoose");

const findApprovedRestaurant = (userId) => {
  if (!mongoose.isValidObjectId(userId)) {
    return null;
  }

  return Restaurant.findOne({
    owner: userId,
    status: "Approved",
  });
};

// ================= ADD FOOD =================
const addFood = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      image,
      isAvailable,
    } = req.body;

    if (!name?.trim() || !description?.trim() || !category?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name, description and category are required",
      });
    }

    if (
      price === undefined ||
      price === "" ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid non-negative number",
      });
    }

    const restaurant = await findApprovedRestaurant(req.user.userId);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message:
          "Approved restaurant not found. Register your restaurant and wait for admin approval before managing foods.",
      });
    }

    const food = await Food.create({
      restaurant: restaurant._id,
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category: category.trim(),
      image: image || "",
      isAvailable:
        isAvailable !== undefined
          ? isAvailable
          : true,
    });

    res.status(201).json({
      success: true,
      message: "Food added successfully",
      food,
    });
  } catch (error) {
    console.error("Add Food Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ================= GET MY FOODS =================
const getMyFoods = async (req, res) => {
  try {
    const restaurant = await findApprovedRestaurant(req.user.userId);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message:
          "Approved restaurant not found. Register your restaurant and wait for admin approval before managing foods.",
      });
    }

    const foods = await Food.find({
      restaurant: restaurant._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: foods.length,
      foods,
    });
  } catch (error) {
    console.error("Get Foods Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ================= UPDATE FOOD =================
const updateFood = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid food ID",
      });
    }

    const restaurant = await findApprovedRestaurant(req.user.userId);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const food = await Food.findOne({
      _id: id,
      restaurant: restaurant._id,
    });

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food not found",
      });
    }

    const {
      name,
      description,
      price,
      category,
      image,
      isAvailable,
    } = req.body;

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Food name cannot be empty",
        });
      }
      food.name = name.trim();
    }

    if (description !== undefined) {
      if (!description.trim()) {
        return res.status(400).json({
          success: false,
          message: "Description cannot be empty",
        });
      }
      food.description = description.trim();
    }

    if (price !== undefined) {
      if (!Number.isFinite(Number(price)) || Number(price) < 0) {
        return res.status(400).json({
          success: false,
          message: "Price must be a valid non-negative number",
        });
      }
      food.price = Number(price);
    }

    if (category !== undefined) {
      if (!category.trim()) {
        return res.status(400).json({
          success: false,
          message: "Category cannot be empty",
        });
      }
      food.category = category.trim();
    }

    if (image !== undefined) {
      food.image = image;
    }

    if (isAvailable !== undefined) {
      food.isAvailable = isAvailable;
    }

    await food.save();

    res.status(200).json({
      success: true,
      message: "Food updated successfully",
      food,
    });
  } catch (error) {
    console.error("Update Food Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ================= DELETE FOOD =================
const deleteFood = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid food ID",
      });
    }

    const restaurant = await findApprovedRestaurant(req.user.userId);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const food = await Food.findOneAndDelete({
      _id: id,
      restaurant: restaurant._id,
    });

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Food deleted successfully",
    });
  } catch (error) {
    console.error("Delete Food Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  addFood,
  getMyFoods,
  updateFood,
  deleteFood,
};
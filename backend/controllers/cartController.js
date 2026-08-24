const Cart = require("../models/CartModel");
const Food = require("../models/FoodModel");
const Restaurant = require("../models/RestaurantModel");

// ================= ADD TO CART =================
const addToCart = async (req, res) => {
  try {
    const { foodId, quantity } = req.body;

    if (!foodId || !quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Food ID and valid quantity are required",
      });
    }

    // Find available food
    const food = await Food.findOne({
      _id: foodId,
      isAvailable: true,
    });

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food not available",
      });
    }

    // Check restaurant
    const restaurant = await Restaurant.findOne({
      _id: food.restaurant,
      status: "Approved",
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found or not approved",
      });
    }

    // Find user's cart
    let cart = await Cart.findOne({
      user: req.user.userId,
    });

    // Create new cart
    if (!cart) {
      cart = await Cart.create({
        user: req.user.userId,
        restaurant: restaurant._id,
        items: [
          {
            food: food._id,
            quantity,
            price: food.price,
          },
        ],
        totalAmount: food.price * quantity,
      });

      return res.status(201).json({
        success: true,
        message: "Food added to cart",
        cart,
      });
    }

    // Different restaurant check
    if (cart.restaurant.toString() !== restaurant._id.toString()) {
      return res.status(400).json({
        success: false,
        message:
          "Cart contains items from another restaurant. Clear cart first.",
      });
    }

    // Check if food already exists
    const existingItem = cart.items.find(
      (item) => item.food.toString() === food._id.toString()
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        food: food._id,
        quantity,
        price: food.price,
      });
    }

    // Recalculate total
    cart.totalAmount = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Food added to cart",
      cart,
    });
  } catch (error) {
    console.error("Add To Cart Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ================= GET CART =================
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user.userId,
    })
      .populate("restaurant", "restaurantName city")
      .populate("items.food", "name price category image");

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart is empty",
      });
    }

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error("Get Cart Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ================= UPDATE CART QUANTITY =================
const updateCartQuantity = async (req, res) => {
  try {
    const { foodId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    // Find user's cart
    const cart = await Cart.findOne({
      user: req.user.userId,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // Find item in cart
    const item = cart.items.find(
      (item) => item.food.toString() === foodId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Food not found in cart",
      });
    }

    // Update quantity
    item.quantity = quantity;

    // Recalculate total
    cart.totalAmount = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart quantity updated successfully",
      cart,
    });
  } catch (error) {
    console.error("Update Cart Quantity Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ================= REMOVE FOOD FROM CART =================
const removeFromCart = async (req, res) => {
  try {
    const { foodId } = req.params;

    const cart = await Cart.findOne({
      user: req.user.userId,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart is empty",
      });
    }

    cart.items = cart.items.filter(
      (item) => item.food.toString() !== foodId
    );

    if (cart.items.length === 0) {
      await Cart.findByIdAndDelete(cart._id);

      return res.status(200).json({
        success: true,
        message: "Food removed and cart cleared",
      });
    }

    cart.totalAmount = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Food removed from cart",
      cart,
    });
  } catch (error) {
    console.error("Remove From Cart Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ================= CLEAR CART =================
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user.userId,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart is already empty",
      });
    }

    await Cart.findByIdAndDelete(cart._id);

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("Clear Cart Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
};
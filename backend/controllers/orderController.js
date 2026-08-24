const Order = require("../models/OrderModel");
const Cart = require("../models/CartModel");
const Food = require("../models/FoodModel");
const Restaurant = require("../models/RestaurantModel");
const { isValidCoordinate } = require("./locationController");

// ================= PLACE ORDER =================
const placeOrder = async (req, res) => {
  try {
    const {
      deliveryAddress,
      paymentMethod,
      deliveryLocation,
    } = req.body;

    // Validate address
    if (!deliveryAddress?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Delivery address is required",
      });
    }

    const latitude = Number(deliveryLocation?.latitude);
    const longitude = Number(deliveryLocation?.longitude);

    if (!isValidCoordinate(latitude, longitude)) {
      return res.status(400).json({
        success: false,
        message: "Valid delivery latitude and longitude are required",
      });
    }

    // Validate payment method
    const selectedPaymentMethod = paymentMethod || "COD";

    if (!["COD", "ONLINE"].includes(selectedPaymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    // Find user's cart
    const cart = await Cart.findOne({
      user: req.user.userId,
    }).populate("items.food", "name price isAvailable");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // Check restaurant
    const restaurant = await Restaurant.findOne({
      _id: cart.restaurant,
      status: "Approved",
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found or not approved",
      });
    }

    // Recalculate order items and total from database
    const orderItems = [];

    for (const item of cart.items) {
      const food = await Food.findOne({
        _id: item.food._id,
        restaurant: cart.restaurant,
        isAvailable: true,
      });

      if (!food) {
        return res.status(400).json({
          success: false,
          message: `Food "${item.food.name}" is no longer available`,
        });
      }

      orderItems.push({
        food: food._id,
        name: food.name,
        price: food.price,
        quantity: item.quantity,
        subtotal: food.price * item.quantity,
      });
    }

    // Calculate total from current food prices
    const totalAmount = orderItems.reduce(
      (total, item) => total + item.subtotal,
      0
    );

    // Create order
    const order = await Order.create({
      user: req.user.userId,
      restaurant: cart.restaurant,
      items: orderItems,
      totalAmount,
      deliveryAddress: deliveryAddress.trim(),
      deliveryLocation: {
        latitude,
        longitude,
      },
      paymentMethod: selectedPaymentMethod,
      paymentStatus: "Pending",
      orderStatus: "Placed",
    });

    // Clear cart after successful order
    await Cart.findByIdAndDelete(cart._id);

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Place Order Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ================= GET MY ORDERS =================
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.userId,
    })
      .populate("restaurant", "restaurantName city")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get My Orders Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
// ================= GET RESTAURANT ORDERS =================
const getRestaurantOrders = async (req, res) => {
  try {
    // Find owner's approved restaurant
    const restaurant = await Restaurant.findOne({
      owner: req.user.userId,
      status: "Approved",
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Approved restaurant not found",
      });
    }

    // Get orders for this restaurant
    const orders = await Order.find({
      restaurant: restaurant._id,
    })
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get Restaurant Orders Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
// ================= UPDATE ORDER STATUS =================
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const allowedStatuses = [
      "Confirmed",
      "Preparing",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    // Find owner's approved restaurant
    const restaurant = await Restaurant.findOne({
      owner: req.user.userId,
      status: "Approved",
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Approved restaurant not found",
      });
    }

    // Find order belonging to this restaurant
    const order = await Order.findOne({
      _id: id,
      restaurant: restaurant._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.orderStatus = orderStatus;

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update Order Status Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
// ================= CONFIRM COD PAYMENT =================
const confirmCodPayment = async (req, res) => {
  try {
    const { id } = req.params;

    // Find restaurant owner
    const restaurant = await Restaurant.findOne({
      owner: req.user.userId,
      status: "Approved",
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Approved restaurant not found",
      });
    }

    // Find order belonging to this restaurant
    const order = await Order.findOne({
      _id: id,
      restaurant: restaurant._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Only COD orders
    if (order.paymentMethod !== "COD") {
      return res.status(400).json({
        success: false,
        message: "This order is not a COD order",
      });
    }

    // Payment can be confirmed only after delivery
    if (order.orderStatus !== "Delivered") {
      return res.status(400).json({
        success: false,
        message: "Payment can be confirmed after order is delivered",
      });
    }

    // Already paid
    if (order.paymentStatus === "Paid") {
      return res.status(400).json({
        success: false,
        message: "Payment is already confirmed",
      });
    }

    order.paymentStatus = "Paid";

    await order.save();

    res.status(200).json({
      success: true,
      message: "COD payment confirmed successfully",
      order,
    });
  } catch (error) {
    console.error("Confirm COD Payment Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
module.exports = {
  placeOrder,
  getMyOrders,
  getRestaurantOrders,
  updateOrderStatus,
  confirmCodPayment,
};
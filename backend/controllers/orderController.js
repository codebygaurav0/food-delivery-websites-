const mongoose = require("mongoose");

const Order = require("../models/OrderModel");
const Cart = require("../models/CartModel");
const Food = require("../models/FoodModel");
const Restaurant = require("../models/RestaurantModel");
const User = require("../models/UserModel");
const { isValidCoordinate } = require("./locationController");

// ============================================================
// CONFIGURATION
// ============================================================

const TAX_RATE = 0.05;
const PLATFORM_FEE = 20;
const RESTAURANT_COMMISSION_RATE = 0.10;
const RIDER_SHARE_RATE = 0.75;

const DELIVERY_BASE_FEE = 20;
const DELIVERY_PER_KM = 8;

// ============================================================
// HELPERS
// ============================================================

const roundMoney = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

// ============================================================
// VALID OBJECT ID
// ============================================================

const getValidObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  return new mongoose.Types.ObjectId(id);
};

// ============================================================
// DISTANCE CALCULATION
// ============================================================

const calculateDistanceKm = (
  latitude1,
  longitude1,
  latitude2,
  longitude2
) => {
  const toRadians = (degree) =>
    (degree * Math.PI) / 180;

  const earthRadiusKm = 6371;

  const dLat = toRadians(
    latitude2 - latitude1
  );

  const dLon = toRadians(
    longitude2 - longitude1
  );

  const lat1 = toRadians(latitude1);
  const lat2 = toRadians(latitude2);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLon / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return earthRadiusKm * c;
};

// ============================================================
// GET RESTAURANT COORDINATES
// ============================================================

const getRestaurantCoordinates = (
  restaurant
) => {
  const latitudeCandidates = [
    restaurant?.latitude,
    restaurant?.location?.latitude,
    restaurant?.location?.lat,
    restaurant?.coordinates?.latitude,
    restaurant?.coordinates?.lat,
  ];

  const longitudeCandidates = [
    restaurant?.longitude,
    restaurant?.location?.longitude,
    restaurant?.location?.lon,
    restaurant?.coordinates?.longitude,
    restaurant?.coordinates?.lon,
  ];

  const latitude =
    latitudeCandidates.find(
      (value) =>
        value !== undefined &&
        value !== null &&
        Number.isFinite(Number(value))
    );

  const longitude =
    longitudeCandidates.find(
      (value) =>
        value !== undefined &&
        value !== null &&
        Number.isFinite(Number(value))
    );

  if (
    latitude === undefined ||
    longitude === undefined
  ) {
    return null;
  }

  const lat = Number(latitude);
  const lon = Number(longitude);

  if (!isValidCoordinate(lat, lon)) {
    return null;
  }

  return {
    latitude: lat,
    longitude: lon,
  };
};

// ============================================================
// CUSTOMER - PLACE ORDER
// ============================================================

const placeOrder = async (req, res) => {
  try {
    const {
      deliveryAddress,
      paymentMethod,
      deliveryLocation,
      pickupLocation:
        requestedPickupLocation,
    } = req.body;

    // --------------------------------------------------------
    // DELIVERY ADDRESS
    // --------------------------------------------------------

    if (!deliveryAddress?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Delivery address is required",
      });
    }

    // --------------------------------------------------------
    // DELIVERY LOCATION
    // --------------------------------------------------------

    const deliveryLatitude = Number(
      deliveryLocation?.latitude
    );

    const deliveryLongitude = Number(
      deliveryLocation?.longitude
    );

    if (
      !isValidCoordinate(
        deliveryLatitude,
        deliveryLongitude
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid delivery latitude and longitude are required",
      });
    }

    // --------------------------------------------------------
    // PAYMENT
    // --------------------------------------------------------

    const selectedPaymentMethod =
      paymentMethod || "COD";

    if (
      !["COD", "ONLINE"].includes(
        selectedPaymentMethod
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    // --------------------------------------------------------
    // CART
    // --------------------------------------------------------

    const cart = await Cart.findOne({
      user: req.user.userId,
    }).populate(
      "items.food",
      "name price isAvailable"
    );

    if (
      !cart ||
      !cart.items ||
      cart.items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // --------------------------------------------------------
    // RESTAURANT
    // --------------------------------------------------------

    const restaurant =
      await Restaurant.findOne({
        _id: cart.restaurant,
        status: "Approved",
      });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message:
          "Restaurant not found or not approved",
      });
    }

    // --------------------------------------------------------
    // PICKUP LOCATION
    // --------------------------------------------------------

    let pickupCoordinates = null;

    if (
      requestedPickupLocation?.latitude !==
        undefined &&
      requestedPickupLocation?.longitude !==
        undefined
    ) {
      const pickupLatitude = Number(
        requestedPickupLocation.latitude
      );

      const pickupLongitude = Number(
        requestedPickupLocation.longitude
      );

      if (
        !isValidCoordinate(
          pickupLatitude,
          pickupLongitude
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid pickup latitude and longitude",
        });
      }

      pickupCoordinates = {
        latitude: pickupLatitude,
        longitude: pickupLongitude,
      };
    } else {
      pickupCoordinates =
        getRestaurantCoordinates(
          restaurant
        );
    }

    if (!pickupCoordinates) {
      return res.status(400).json({
        success: false,
        message:
          "Restaurant pickup coordinates are required. Add latitude and longitude to the restaurant or send pickupLocation.",
      });
    }

    // --------------------------------------------------------
    // FOOD ITEMS
    // --------------------------------------------------------

    const orderItems = [];

    for (const item of cart.items) {
      if (!item.food) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid food item in cart",
        });
      }

      const food =
        await Food.findOne({
          _id: item.food._id,
          restaurant: cart.restaurant,
          isAvailable: true,
        });

      if (!food) {
        return res.status(400).json({
          success: false,
          message:
            `Food "${item.food.name}" is no longer available`,
        });
      }

      const quantity = Number(
        item.quantity
      );

      if (
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid quantity for "${food.name}"`,
        });
      }

      const subtotal = roundMoney(
        Number(food.price) * quantity
      );

      orderItems.push({
        food: food._id,
        name: food.name,
        price: Number(food.price),
        quantity,
        subtotal,
      });
    }

    // --------------------------------------------------------
    // FOOD TOTAL
    // --------------------------------------------------------

    const totalAmount = roundMoney(
      orderItems.reduce(
        (total, item) =>
          total + item.subtotal,
        0
      )
    );

    // --------------------------------------------------------
    // DISTANCE
    // --------------------------------------------------------

    const distanceKm = roundMoney(
      calculateDistanceKm(
        pickupCoordinates.latitude,
        pickupCoordinates.longitude,
        deliveryLatitude,
        deliveryLongitude
      )
    );

    // --------------------------------------------------------
    // DELIVERY FEE
    // --------------------------------------------------------

    const deliveryFee = roundMoney(
      DELIVERY_BASE_FEE +
        distanceKm *
          DELIVERY_PER_KM
    );

    // --------------------------------------------------------
    // PLATFORM FEE
    // --------------------------------------------------------

    const platformFee =
      PLATFORM_FEE;

    // --------------------------------------------------------
    // TAX
    // --------------------------------------------------------

    const taxableAmount =
      totalAmount +
      deliveryFee +
      platformFee;

    const taxAmount = roundMoney(
      taxableAmount * TAX_RATE
    );

    // --------------------------------------------------------
    // RESTAURANT COMMISSION
    // --------------------------------------------------------

    const platformCommission =
      roundMoney(
        totalAmount *
          RESTAURANT_COMMISSION_RATE
      );

    // --------------------------------------------------------
    // RESTAURANT EARNING
    // --------------------------------------------------------

    const restaurantEarnings =
      roundMoney(
        totalAmount -
          platformCommission
      );

    // --------------------------------------------------------
    // RIDER EARNING
    // --------------------------------------------------------

    const riderEarning = roundMoney(
      deliveryFee *
        RIDER_SHARE_RATE
    );

    // --------------------------------------------------------
    // SUPER ADMIN REVENUE
    // --------------------------------------------------------

    const superAdminRevenue =
      roundMoney(
        platformCommission +
          platformFee
      );

    // --------------------------------------------------------
    // CUSTOMER FINAL AMOUNT
    // --------------------------------------------------------

    const finalAmount = roundMoney(
      totalAmount +
        deliveryFee +
        platformFee +
        taxAmount
    );

    // --------------------------------------------------------
    // CREATE ORDER
    // --------------------------------------------------------

    const order =
      await Order.create({
        user: req.user.userId,

        restaurant:
          cart.restaurant,

        rider: null,

        items: orderItems,

        totalAmount,

        deliveryAddress:
          deliveryAddress.trim(),

        pickupLocation: {
          address:
            restaurant.address ||
            restaurant.restaurantName ||
            "",

          latitude:
            pickupCoordinates.latitude,

          longitude:
            pickupCoordinates.longitude,
        },

        deliveryLocation: {
          address:
            deliveryAddress.trim(),

          latitude:
            deliveryLatitude,

          longitude:
            deliveryLongitude,
        },

        distanceKm,

        deliveryFee,

        platformFee,

        taxAmount,

        platformCommission,

        restaurantEarnings,

        riderEarning,

        superAdminRevenue,

        finalAmount,

        paymentMethod:
          selectedPaymentMethod,

        paymentStatus:
          "Pending",

        orderStatus:
          "Placed",

        deliveryStatus:
          "Searching Rider",
      });

    // --------------------------------------------------------
    // CLEAR CART
    // --------------------------------------------------------

    await Cart.findByIdAndDelete(
      cart._id
    );

    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return res.status(201).json({
      success: true,

      message:
        "Order placed successfully",

      order,

      billing: {
        foodAmount:
          totalAmount,

        deliveryFee,

        platformFee,

        taxAmount,

        finalAmount,

        distanceKm,
      },
    });
  } catch (error) {
    console.error(
      "Place Order Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ============================================================
// CUSTOMER - MY ORDERS
// ============================================================

const getMyOrders = async (
  req,
  res
) => {
  try {
    const orders =
      await Order.find({
        user: req.user.userId,
      })
        .populate(
          "restaurant",
          "restaurantName city address latitude longitude"
        )
        .populate(
          "rider",
          "name phone"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error(
      "Get My Orders Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ============================================================
// RESTAURANT - GET ORDERS
// ============================================================

const getRestaurantOrders =
  async (req, res) => {
    try {
      const restaurant =
        await Restaurant.findOne({
          owner: req.user.userId,
          status: "Approved",
        });

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message:
            "Approved restaurant not found",
        });
      }

      const orders =
        await Order.find({
          restaurant:
            restaurant._id,
        })
          .populate(
            "user",
            "name email phone"
          )
          .populate(
            "rider",
            "name email phone"
          )
          .sort({
            createdAt: -1,
          });

      return res.status(200).json({
        success: true,
        count: orders.length,
        orders,
      });
    } catch (error) {
      console.error(
        "Get Restaurant Orders Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  };

// ============================================================
// RESTAURANT - UPDATE ORDER STATUS
// ============================================================

const updateOrderStatus = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    const { orderStatus } =
      req.body;

    const allowedStatuses = [
      "Confirmed",
      "Preparing",
      "Ready for Pickup",
      "Cancelled",
    ];

    if (
      !allowedStatuses.includes(
        orderStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid restaurant order status",
      });
    }

    const restaurant =
      await Restaurant.findOne({
        owner: req.user.userId,
        status: "Approved",
      });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message:
          "Approved restaurant not found",
      });
    }

    const order =
      await Order.findOne({
        _id: id,
        restaurant:
          restaurant._id,
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (
      order.orderStatus ===
        "Delivered" ||
      order.orderStatus ===
        "Cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This order can no longer be updated",
      });
    }

    order.orderStatus =
      orderStatus;

    if (
      orderStatus ===
      "Ready for Pickup"
    ) {
      order.deliveryStatus =
        "Searching Rider";

      order.rider = null;
    }

    if (
      orderStatus ===
      "Cancelled"
    ) {
      order.deliveryStatus =
        "Cancelled";
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message:
        "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error(
      "Update Order Status Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ============================================================
// RESTAURANT - CONFIRM COD PAYMENT
// ============================================================

const confirmCodPayment = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    const restaurant =
      await Restaurant.findOne({
        owner: req.user.userId,
        status: "Approved",
      });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message:
          "Approved restaurant not found",
      });
    }

    // --------------------------------------------------------
    // FIND ORDER
    // --------------------------------------------------------

    const order =
      await Order.findOne({
        _id: id,
        restaurant:
          restaurant._id,
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // --------------------------------------------------------
    // PAYMENT METHOD
    // --------------------------------------------------------

    if (
      order.paymentMethod !==
      "COD"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This order is not a COD order",
      });
    }

    // --------------------------------------------------------
    // DELIVERY CHECK
    // --------------------------------------------------------

    if (
      order.orderStatus !==
      "Delivered"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment can be confirmed after order is delivered",
      });
    }

    // --------------------------------------------------------
    // ALREADY PAID
    // --------------------------------------------------------

    if (
      order.paymentStatus ===
      "Paid"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment is already confirmed",
      });
    }

    // ========================================================
    // LEGACY ORDER SAFETY
    // ========================================================
    //
    // Kuch purane orders database me finalAmount ya
    // pickupLocation ke bina create hue ho sakte hain.
    //
    // Order.save() poore schema ko validate karta hai.
    // Isliye required fields missing hone par validation
    // error aata hai.
    //
    // Yahan hum existing order ke available data se missing
    // values recover kar rahe hain.
    // ========================================================

    // --------------------------------------------------------
    // FINAL AMOUNT
    // --------------------------------------------------------

    if (
      !Number.isFinite(
        Number(order.finalAmount)
      )
    ) {
      const totalAmount =
        Number(
          order.totalAmount || 0
        );

      const deliveryFee =
        Number(
          order.deliveryFee || 0
        );

      const platformFee =
        Number(
          order.platformFee || 0
        );

      const taxAmount =
        Number(
          order.taxAmount || 0
        );

      const calculatedFinalAmount =
        roundMoney(
          totalAmount +
            deliveryFee +
            platformFee +
            taxAmount
        );

      order.finalAmount =
        calculatedFinalAmount;
    }

    // --------------------------------------------------------
    // PICKUP LOCATION
    // --------------------------------------------------------

    if (
      !order.pickupLocation ||
      !Number.isFinite(
        Number(
          order.pickupLocation?.latitude
        )
      ) ||
      !Number.isFinite(
        Number(
          order.pickupLocation?.longitude
        )
      )
    ) {
      const restaurantCoordinates =
        getRestaurantCoordinates(
          restaurant
        );

      if (restaurantCoordinates) {
        order.pickupLocation = {
          address:
            restaurant.address ||
            restaurant.restaurantName ||
            "",

          latitude:
            restaurantCoordinates.latitude,

          longitude:
            restaurantCoordinates.longitude,
        };
      } else {
        // ----------------------------------------------------
        // If old restaurant does not have coordinates,
        // at least preserve the required subdocument.
        // ----------------------------------------------------

        order.pickupLocation = {
          address:
            restaurant.address ||
            restaurant.restaurantName ||
            "",

          latitude: 0,

          longitude: 0,
        };
      }
    }

    // --------------------------------------------------------
    // DELIVERY LOCATION SAFETY
    // --------------------------------------------------------

    if (
      !order.deliveryLocation
    ) {
      order.deliveryLocation = {
        address:
          order.deliveryAddress ||
          "",

        latitude: 0,

        longitude: 0,
      };
    }

    // --------------------------------------------------------
    // PAYMENT
    // --------------------------------------------------------

    order.paymentStatus =
      "Paid";

    // --------------------------------------------------------
    // SAVE
    // --------------------------------------------------------

    await order.save();

    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,

      message:
        "COD payment confirmed successfully",

      order,
    });
  } catch (error) {
    console.error(
      "Confirm COD Payment Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ============================================================
// RIDER - AVAILABLE ORDERS
// ============================================================

const getAvailableOrdersForRider =
  async (req, res) => {
    try {
      const orders =
        await Order.find({
          orderStatus:
            "Ready for Pickup",

          deliveryStatus:
            "Searching Rider",

          rider: null,
        })
          .populate(
            "restaurant",
            "restaurantName address city latitude longitude"
          )
          .populate(
            "user",
            "name phone"
          )
          .sort({
            createdAt: 1,
          });

      return res.status(200).json({
        success: true,
        count: orders.length,
        orders,
      });
    } catch (error) {
      console.error(
        "Get Rider Available Orders Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load available orders",
        error: error.message,
      });
    }
  };

// ============================================================
// RIDER - ACCEPT ORDER
// ============================================================

const acceptOrderByRider =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const rider =
        await User.findOne({
          _id: req.user.userId,
          role: "rider",
          status: "active",
        });

      if (!rider) {
        return res.status(403).json({
          success: false,
          message:
            "Only active riders can accept orders",
        });
      }

      const order =
        await Order.findOneAndUpdate(
          {
            _id: id,

            orderStatus:
              "Ready for Pickup",

            deliveryStatus:
              "Searching Rider",

            rider: null,
          },
          {
            $set: {
              rider: rider._id,

              orderStatus:
                "Rider Assigned",

              deliveryStatus:
                "Rider Assigned",

              riderAcceptedAt:
                new Date(),
            },
          },
          {
            new: true,
          }
        )
          .populate(
            "restaurant",
            "restaurantName address city"
          )
          .populate(
            "user",
            "name phone"
          )
          .populate(
            "rider",
            "name phone"
          );

      if (!order) {
        return res.status(409).json({
          success: false,
          message:
            "Order is no longer available for acceptance",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Order accepted successfully",
        order,
      });
    } catch (error) {
      console.error(
        "Rider Accept Order Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to accept order",
        error: error.message,
      });
    }
  };

// ============================================================
// RIDER - PICKED UP
// ============================================================

const markOrderPickedUp =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const riderId =
        getValidObjectId(
          req.user.userId
        );

      if (!riderId) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid rider ID",
        });
      }

      const order =
        await Order.findOne({
          _id: id,
          rider: riderId,
          deliveryStatus:
            "Rider Assigned",
        });

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Assigned order not found",
        });
      }

      order.orderStatus =
        "Picked Up";

      order.deliveryStatus =
        "Picked Up";

      order.pickedUpAt =
        new Date();

      await order.save();

      return res.status(200).json({
        success: true,
        message:
          "Order marked as picked up",
        order,
      });
    } catch (error) {
      console.error(
        "Mark Picked Up Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  };

// ============================================================
// RIDER - OUT FOR DELIVERY
// ============================================================

const markOrderOutForDelivery =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const riderId =
        getValidObjectId(
          req.user.userId
        );

      if (!riderId) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid rider ID",
        });
      }

      const order =
        await Order.findOne({
          _id: id,
          rider: riderId,
          deliveryStatus:
            "Picked Up",
        });

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Picked up order not found",
        });
      }

      // --------------------------------------------------------
      // OUT FOR DELIVERY
      // --------------------------------------------------------

      order.orderStatus =
        "Out for Delivery";

      order.deliveryStatus =
        "Out for Delivery";

      // IMPORTANT:
      // Exact time when rider starts delivery
      order.outForDeliveryAt =
        new Date();

      await order.save();

      console.log(
        "ORDER OUT FOR DELIVERY:",
        {
          orderId:
            order._id.toString(),

          rider:
            order.rider?.toString(),

          outForDeliveryAt:
            order.outForDeliveryAt,

          deliveryStatus:
            order.deliveryStatus,

          orderStatus:
            order.orderStatus,
        }
      );

      return res.status(200).json({
        success: true,

        message:
          "Order is out for delivery",

        order,
      });
    } catch (error) {
      console.error(
        "Out For Delivery Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Server error",
        error:
          error.message,
      });
    }
  };

// ============================================================
// RIDER - DELIVER ORDER
// ============================================================

const markOrderDelivered =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const riderId =
        getValidObjectId(
          req.user.userId
        );

      if (!riderId) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid rider ID",
        });
      }

      const order =
        await Order.findOne({
          _id: id,
          rider: riderId,
          deliveryStatus:
            "Out for Delivery",
        });

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Active delivery not found",
        });
      }

      // --------------------------------------------------------
      // MARK DELIVERED
      // --------------------------------------------------------

      order.orderStatus =
        "Delivered";

      order.deliveryStatus =
        "Delivered";

      order.deliveredAt =
        new Date();

      // --------------------------------------------------------
      // ONLINE PAYMENT
      // --------------------------------------------------------

      if (
        order.paymentMethod ===
        "ONLINE"
      ) {
        order.paymentStatus =
          "Paid";
      }

      // --------------------------------------------------------
      // RIDER EARNING SAFETY
      // --------------------------------------------------------

      if (
        !Number.isFinite(
          Number(
            order.riderEarning
          )
        ) ||
        Number(
          order.riderEarning
        ) <= 0
      ) {
        order.riderEarning =
          roundMoney(
            Number(
              order.deliveryFee || 0
            ) *
              RIDER_SHARE_RATE
          );
      }

      await order.save();

      console.log(
        "ORDER DELIVERED:",
        {
          orderId:
            order._id.toString(),

          rider:
            order.rider?.toString(),

          deliveryFee:
            order.deliveryFee,

          riderEarning:
            order.riderEarning,

          deliveryStatus:
            order.deliveryStatus,

          orderStatus:
            order.orderStatus,

          deliveredAt:
            order.deliveredAt,
        }
      );

      return res.status(200).json({
        success: true,
        message:
          "Order delivered successfully",
        order,
      });
    } catch (error) {
      console.error(
        "Mark Delivered Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  };

// ============================================================
// RIDER - MY ACTIVE ORDERS
// ============================================================

const getRiderOrders =
  async (req, res) => {
    try {
      const riderId =
        getValidObjectId(
          req.user.userId
        );

      if (!riderId) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid rider ID",
        });
      }

      const orders =
        await Order.find({
          rider: riderId,

          deliveryStatus: {
            $nin: [
              "Delivered",
              "Cancelled",
            ],
          },
        })
          .populate(
            "restaurant",
            "restaurantName address city latitude longitude"
          )
          .populate(
            "user",
            "name phone"
          )
          .sort({
            createdAt: -1,
          });

      return res.status(200).json({
        success: true,
        count: orders.length,
        orders,
      });
    } catch (error) {
      console.error(
        "Get Rider Orders Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load rider orders",
        error: error.message,
      });
    }
  };

// ============================================================
// RIDER - EARNINGS
// ============================================================

const getRiderEarnings =
  async (req, res) => {
    try {
      const riderId =
        getValidObjectId(
          req.user.userId
        );

      if (!riderId) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid rider ID",
        });
      }

      console.log(
        "================================="
      );

      console.log(
        "RIDER EARNINGS DEBUG"
      );

      console.log(
        "Rider ID:",
        req.user.userId
      );

      console.log(
        "Rider ObjectId:",
        riderId.toString()
      );

      console.log(
        "================================="
      );

      // ------------------------------------------------------
      // GET ALL ORDERS ASSIGNED TO RIDER
      // ------------------------------------------------------

      const riderOrders =
        await Order.find({
          rider: riderId,
        })
          .select(
            "_id rider deliveryStatus orderStatus riderEarning deliveryFee finalAmount deliveredAt createdAt"
          )
          .sort({
            createdAt: -1,
          });

      console.log(
        "Total Rider Orders:",
        riderOrders.length
      );

      // ------------------------------------------------------
      // COMPLETED ORDERS
      // ------------------------------------------------------

      const completedOrders =
        riderOrders.filter(
          (order) =>
            order.deliveryStatus ===
              "Delivered" ||
            order.orderStatus ===
              "Delivered"
        );

      console.log(
        "Completed Rider Orders:",
        completedOrders.length
      );

      // ------------------------------------------------------
      // CALCULATE EARNINGS
      // ------------------------------------------------------

      let totalEarnings = 0;

      const completedOrderDetails =
        completedOrders.map(
          (order) => {
            let earning = Number(
              order.riderEarning || 0
            );

            // Safety for old orders
            if (
              earning <= 0 &&
              Number(
                order.deliveryFee || 0
              ) > 0
            ) {
              earning =
                roundMoney(
                  Number(
                    order.deliveryFee
                  ) *
                    RIDER_SHARE_RATE
                );
            }

            totalEarnings +=
              earning;

            return {
              id: order._id,
              rider:
                order.rider,
              orderStatus:
                order.orderStatus,
              deliveryStatus:
                order.deliveryStatus,
              deliveryFee:
                order.deliveryFee,
              riderEarning:
                earning,
              deliveredAt:
                order.deliveredAt,
            };
          }
        );

      totalEarnings =
        roundMoney(
          totalEarnings
        );

      // ------------------------------------------------------
      // RESPONSE
      // ------------------------------------------------------

      return res.status(200).json({
        success: true,

        earnings: {
          totalDeliveries:
            completedOrders.length,

          totalEarnings,
        },

        debug: {
          riderId:
            riderId.toString(),

          totalRiderOrders:
            riderOrders.length,

          completedOrders:
            completedOrders.length,

          totalEarnings,

          orders:
            completedOrderDetails,
        },
      });
    } catch (error) {
      console.error(
        "Get Rider Earnings Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load rider earnings",
        error: error.message,
      });
    }
  };

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  // Customer
  placeOrder,
  getMyOrders,

  // Restaurant
  getRestaurantOrders,
  updateOrderStatus,
  confirmCodPayment,

  // Rider
  getAvailableOrdersForRider,
  acceptOrderByRider,
  markOrderPickedUp,
  markOrderOutForDelivery,
  markOrderDelivered,
  getRiderOrders,
  getRiderEarnings,
};
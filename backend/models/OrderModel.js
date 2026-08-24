const mongoose = require("mongoose");

// ============================================================
// ORDER ITEM
// ============================================================

const orderItemSchema = new mongoose.Schema(
  {
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

// ============================================================
// LOCATION
// ============================================================

const locationSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      trim: true,
      default: "",
    },

    latitude: {
      type: Number,
      min: -90,
      max: 90,
      required: true,
    },

    longitude: {
      type: Number,
      min: -180,
      max: 180,
      required: true,
    },
  },
  {
    _id: false,
  }
);

// ============================================================
// ORDER
// ============================================================

const orderSchema = new mongoose.Schema(
  {
    // ========================================================
    // CUSTOMER
    // ========================================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ========================================================
    // RESTAURANT
    // ========================================================

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    // ========================================================
    // RIDER
    // ========================================================

    rider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    // ========================================================
    // ORDER ITEMS
    // ========================================================

    items: {
      type: [orderItemSchema],
      required: true,

      validate: {
        validator: function (items) {
          return (
            Array.isArray(items) &&
            items.length > 0
          );
        },

        message:
          "Order must contain at least one item",
      },
    },

    // ========================================================
    // FOOD TOTAL
    // ========================================================

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // ========================================================
    // DELIVERY ADDRESS
    // ========================================================

    deliveryAddress: {
      type: String,
      required: true,
      trim: true,
    },

    // ========================================================
    // PICKUP LOCATION
    // ========================================================

    pickupLocation: {
      type: locationSchema,
      required: true,
    },

    // ========================================================
    // DELIVERY LOCATION
    // ========================================================

    deliveryLocation: {
      type: locationSchema,
      required: true,
    },

    // ========================================================
    // DISTANCE
    // ========================================================

    distanceKm: {
      type: Number,
      min: 0,
      default: 0,
    },

    // ========================================================
    // DELIVERY FEE
    // ========================================================

    deliveryFee: {
      type: Number,
      min: 0,
      default: 0,
    },

    // ========================================================
    // PLATFORM FEE
    // ========================================================

    platformFee: {
      type: Number,
      min: 0,
      default: 0,
    },

    // ========================================================
    // TAX
    // ========================================================

    taxAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    // ========================================================
    // RESTAURANT COMMISSION
    // ========================================================

    platformCommission: {
      type: Number,
      min: 0,
      default: 0,
    },

    // ========================================================
    // RESTAURANT EARNING
    // ========================================================

    restaurantEarnings: {
      type: Number,
      min: 0,
      default: 0,
    },

    // ========================================================
    // RIDER EARNING
    // ========================================================

    riderEarning: {
      type: Number,
      min: 0,
      default: 0,
    },

    // ========================================================
    // SUPER ADMIN REVENUE
    // ========================================================

    superAdminRevenue: {
      type: Number,
      min: 0,
      default: 0,
    },

    // ========================================================
    // CUSTOMER FINAL AMOUNT
    // ========================================================

    finalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // ========================================================
    // PAYMENT
    // ========================================================

    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      default: "COD",
    },

    paymentStatus: {
      type: String,
      enum: [
        "Pending",
        "Paid",
        "Failed",
      ],
      default: "Pending",
    },

    // ========================================================
    // ORDER STATUS
    // ========================================================

    orderStatus: {
      type: String,

      enum: [
        "Placed",
        "Confirmed",
        "Preparing",
        "Ready for Pickup",
        "Rider Assigned",
        "Picked Up",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],

      default: "Placed",

      index: true,
    },

    // ========================================================
    // DELIVERY STATUS
    // ========================================================

    deliveryStatus: {
      type: String,

      enum: [
        "Searching Rider",
        "Rider Assigned",
        "Accepted",
        "Picked Up",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],

      default: "Searching Rider",

      index: true,
    },

    // ========================================================
    // RIDER ACCEPTED TIME
    // ========================================================

    riderAcceptedAt: {
      type: Date,
      default: null,
    },

    // ========================================================
    // PICKUP TIME
    // ========================================================

    pickedUpAt: {
      type: Date,
      default: null,
    },

    // ========================================================
    // OUT FOR DELIVERY TIME
    // ========================================================

    outForDeliveryAt: {
      type: Date,
      default: null,
    },

    // ========================================================
    // DELIVERY TIME
    // ========================================================

    deliveredAt: {
      type: Date,
      default: null,
    },
  },

  {
    timestamps: true,
  }
);

// ============================================================
// INDEXES
// ============================================================

// Rider active orders
orderSchema.index({
  rider: 1,
  deliveryStatus: 1,
  createdAt: -1,
});

// Rider completed orders / earnings
orderSchema.index({
  rider: 1,
  deliveryStatus: 1,
});

// Available orders for riders
orderSchema.index({
  orderStatus: 1,
  deliveryStatus: 1,
  rider: 1,
  createdAt: 1,
});

// Restaurant dashboard
orderSchema.index({
  restaurant: 1,
  createdAt: -1,
});

// Customer orders
orderSchema.index({
  user: 1,
  createdAt: -1,
});

// ============================================================
// MODEL
// ============================================================

module.exports = mongoose.model(
  "Order",
  orderSchema
);
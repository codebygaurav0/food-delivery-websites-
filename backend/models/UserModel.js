const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ================= BASIC USER INFO =================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    // ================= ROLE =================

    role: {
      type: String,
      enum: [
        "customer",
        "restaurantOwner",
        "rider",
        "admin",
        "superAdmin",
      ],
      default: "customer",
    },

    // ================= ACCOUNT STATUS =================

    status: {
      type: String,
      enum: ["active", "blocked", "pending", "rejected"],
      default: "active",
    },

    // ================= EMAIL OTP =================

    isVerified: {
      type: Boolean,
      default: false,
    },

    otp: {
      type: String,
      default: null,
    },

    otpExpire: {
      type: Date,
      default: null,
    },

    // ================= RIDER DETAILS =================
    // Rider ke liye use honge.
    // Customer/Restaurant Owner ke liye optional rahenge.

    vehicleType: {
      type: String,
      enum: ["Bike", "Scooter", "Car", "Other"],
      default: null,
    },

    vehicleNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
    },

    drivingLicenseNumber: {
      type: String,
      trim: true,
      default: null,
    },

    riderCity: {
      type: String,
      trim: true,
      default: null,
    },

    // ================= RIDER REQUEST =================

    riderRequestStatus: {
      type: String,
      enum: [
        "NotRequested",
        "Pending",
        "Approved",
        "Rejected",
      ],
      default: "NotRequested",
    },

    riderRejectionReason: {
      type: String,
      trim: true,
      default: "",
    },

    riderApprovedAt: {
      type: Date,
      default: null,
    },

    riderRejectedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
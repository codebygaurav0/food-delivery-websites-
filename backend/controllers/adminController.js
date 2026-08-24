const Restaurant = require("../models/RestaurantModel");
const User = require("../models/UserModel");
const Order = require("../models/OrderModel");

// =====================================================
// GET PENDING RESTAURANTS
// =====================================================
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

// =====================================================
// APPROVE RESTAURANT
// =====================================================
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

// =====================================================
// REJECT RESTAURANT
// =====================================================
const rejectRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason || !rejectionReason.trim()) {
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
    restaurant.rejectionReason = rejectionReason.trim();

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

// =====================================================
// GET SUPER ADMIN DASHBOARD
// =====================================================
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalCustomers,
      totalRestaurants,
      totalRiders,
      totalOrders,
      restaurantPending,
      riderPending,
    ] = await Promise.all([
      User.countDocuments({
        role: "customer",
      }),

      Restaurant.countDocuments({
        status: "Approved",
      }),

      User.countDocuments({
        role: "rider",
        riderRequestStatus: "Approved",
      }),

      Order.countDocuments(),

      Restaurant.countDocuments({
        status: "Pending",
      }),

      User.countDocuments({
        role: "rider",
        riderRequestStatus: "Pending",
      }),
    ]);

    // =================================================
    // TOTAL SALES
    // =================================================
    const salesResult = await Order.aggregate([
      {
        $match: {
          orderStatus: {
            $ne: "Cancelled",
          },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: {
            $sum: {
              $ifNull: ["$totalAmount", 0],
            },
          },
        },
      },
    ]);

    const totalSales =
      salesResult.length > 0
        ? salesResult[0].totalSales
        : 0;

    // =================================================
    // FINANCIAL DATA
    // =================================================
    const financialResult = await Order.aggregate([
      {
        $match: {
          orderStatus: {
            $ne: "Cancelled",
          },
        },
      },
      {
        $group: {
          _id: null,

          restaurantEarnings: {
            $sum: {
              $ifNull: ["$restaurantEarnings", 0],
            },
          },

          riderEarnings: {
            $sum: {
              $ifNull: ["$riderEarning", 0],
            },
          },

          platformCommission: {
            $sum: {
              $ifNull: ["$platformCommission", 0],
            },
          },

          platformFee: {
            $sum: {
              $ifNull: ["$platformFee", 0],
            },
          },

          taxCollected: {
            $sum: {
              $ifNull: ["$taxAmount", 0],
            },
          },

          superAdminRevenue: {
            $sum: {
              $add: [
                {
                  $ifNull: ["$platformCommission", 0],
                },
                {
                  $ifNull: ["$platformFee", 0],
                },
              ],
            },
          },
        },
      },
    ]);

    const financial =
      financialResult.length > 0
        ? financialResult[0]
        : {
            restaurantEarnings: 0,
            riderEarnings: 0,
            platformCommission: 0,
            platformFee: 0,
            taxCollected: 0,
            superAdminRevenue: 0,
          };

    res.status(200).json({
      success: true,

      dashboard: {
        totalCustomers,
        totalRestaurants,
        totalRiders,
        totalOrders,

        totalSales,

        restaurantEarnings:
          financial.restaurantEarnings || 0,

        riderEarnings:
          financial.riderEarnings || 0,

        platformCommission:
          financial.platformCommission || 0,

        platformFee:
          financial.platformFee || 0,

        taxCollected:
          financial.taxCollected || 0,

        superAdminRevenue:
          financial.superAdminRevenue || 0,

        pendingRestaurantRequests:
          restaurantPending,

        pendingRiderRequests:
          riderPending,
      },
    });
  } catch (error) {
    console.error(
      "Get Admin Dashboard Stats Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to load dashboard statistics",
    });
  }
};

// =====================================================
// GET PENDING RIDERS
// =====================================================
const getPendingRiders = async (req, res) => {
  try {
    const riders = await User.find({
      role: "rider",
      riderRequestStatus: "Pending",
    })
      .select("-password -otp -otpExpire")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: riders.length,
      riders,
    });
  } catch (error) {
    console.error(
      "Get Pending Riders Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to load pending rider requests",
    });
  }
};

// =====================================================
// APPROVE RIDER
// =====================================================
const approveRider = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("========== APPROVE RIDER ==========");
    console.log("Rider ID:", id);
    console.log("Admin:", req.user);

    const rider = await User.findOne({
      _id: id,
      role: "rider",
    });

    console.log(
      "Rider:",
      rider
        ? {
            id: rider._id,
            email: rider.email,
            isVerified: rider.isVerified,
            riderRequestStatus:
              rider.riderRequestStatus,
            status: rider.status,
          }
        : "NOT FOUND"
    );

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found",
      });
    }

    if (rider.riderRequestStatus !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Rider request is already ${rider.riderRequestStatus}`,
      });
    }

    if (!rider.isVerified) {
      return res.status(400).json({
        success: false,
        message:
          "Rider must verify email before approval",
      });
    }

    rider.riderRequestStatus = "Approved";
    rider.riderRejectionReason = "";
    rider.riderApprovedAt = new Date();
    rider.riderRejectedAt = null;
    rider.status = "active";

    await rider.save();

    console.log(
      "✅ RIDER APPROVED:",
      rider.email
    );

    return res.status(200).json({
      success: true,
      message: "Rider approved successfully",
      rider: {
        id: rider._id,
        name: rider.name,
        email: rider.email,
        phone: rider.phone,
        role: rider.role,
        status: rider.status,
        isVerified: rider.isVerified,
        riderRequestStatus:
          rider.riderRequestStatus,
      },
    });
  } catch (error) {
    console.error(
      "❌========== APPROVE RIDER ERROR =========="
    );

    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    console.error(
      "=========================================="
    );

    return res.status(500).json({
      success: false,
      message: "Unable to approve rider",
      error: error.message,
    });
  }
};

// =====================================================
// REJECT RIDER
// =====================================================
const rejectRider = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    console.log("========== REJECT RIDER ==========");
    console.log("Rider ID:", id);

    if (
      !rejectionReason ||
      !rejectionReason.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Rider rejection reason is required",
      });
    }

    const rider = await User.findOne({
      _id: id,
      role: "rider",
    });

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found",
      });
    }

    if (rider.riderRequestStatus !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Rider request is already ${rider.riderRequestStatus}`,
      });
    }

    rider.riderRequestStatus = "Rejected";

    rider.riderRejectionReason =
      rejectionReason.trim();

    rider.riderRejectedAt = new Date();

    rider.riderApprovedAt = null;

    // Rejected rider cannot login
    rider.status = "rejected";

    await rider.save();

    console.log("RIDER REJECTED:", rider.email);

    res.status(200).json({
      success: true,
      message: "Rider rejected successfully",

      rider: {
        id: rider._id,
        name: rider.name,
        email: rider.email,
        phone: rider.phone,
        role: rider.role,
        status: rider.status,
        riderRequestStatus:
          rider.riderRequestStatus,
        riderRejectionReason:
          rider.riderRejectionReason,
      },
    });
  } catch (error) {
    console.error(
      "Reject Rider Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to reject rider",
    });
  }
};

// =====================================================
// GET ALL RIDERS
// =====================================================
const getRiders = async (req, res) => {
  try {
    const riders = await User.find({
      role: "rider",
    })
      .select("-password -otp -otpExpire")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: riders.length,
      riders,
    });
  } catch (error) {
    console.error(
      "Get Riders Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to load riders",
    });
  }
};

// =====================================================
// GET CUSTOMERS
// =====================================================
const getCustomers = async (req, res) => {
  try {
    const customers = await User.find({
      role: "customer",
    })
      .select("-password -otp -otpExpire")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    console.error(
      "Get Customers Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to load customers",
    });
  }
};

// =====================================================
// GET ALL ORDERS
// =====================================================
const getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate(
        "user",
        "name email phone"
      )
      .populate(
        "restaurant",
        "restaurantName name email phone"
      )
      .populate(
        "rider",
        "name email phone"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error(
      "Get Admin Orders Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to load orders",
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================
module.exports = {
  // Restaurants
  getPendingRestaurants,
  approveRestaurant,
  rejectRestaurant,

  // Dashboard
  getDashboardStats,

  // Riders
  getPendingRiders,
  approveRider,
  rejectRider,
  getRiders,

  // Customers
  getCustomers,

  // Orders
  getAdminOrders,
};
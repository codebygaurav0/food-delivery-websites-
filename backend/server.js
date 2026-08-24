const express = require("express");
const cors = require("cors");

require("dotenv").config();

// =====================================================
// STARTUP CHECK
// =====================================================

console.log(
  "BREVO_KEY configured:",
  Boolean(process.env.BREVO_KEY)
);

console.log(
  "BREVO_EMAIL configured:",
  Boolean(process.env.BREVO_EMAIL)
);

// =====================================================
// DATABASE
// =====================================================

const connectDB = require("./config/db");

// =====================================================
// ROUTES
// =====================================================

const userRoute = require("./routes/userRoute");
const restaurantRoute = require("./routes/restaurantRoute");
const adminRoute = require("./routes/adminRoute");
const foodRoute = require("./routes/foodRoute");
const customerRoute = require("./routes/customerRoute");
const cartRoute = require("./routes/cartRoute");
const orderRoute = require("./routes/orderRoute");
const locationRoute = require("./routes/locationRoute");

// =====================================================
// APP
// =====================================================

const app = express();

// =====================================================
// DATABASE CONNECTION
// =====================================================

connectDB();

// =====================================================
// CORS
// =====================================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://food-delivery-frontend-iota-woad.vercel.app",
  "https://food-delivery-frontend-git-main-gauravs-projects-566748a5.vercel.app",
  "https://food-delivery-frontend-m4govpwh5-gauravs-projects-566748a5.vercel.app",
];

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without Origin
      // Example: Postman / server-to-server
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log(
        "CORS blocked origin:",
        origin
      );

      return callback(
        new Error("Not allowed by CORS")
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

// =====================================================
// BODY PARSER
// =====================================================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// =====================================================
// API ROUTES
// =====================================================

app.use("/user", userRoute);

app.use("/restaurant", restaurantRoute);

app.use("/admin", adminRoute);

app.use("/food", foodRoute);

app.use("/customer", customerRoute);

app.use("/cart", cartRoute);

// IMPORTANT
// All order routes start with /order
app.use("/order", orderRoute);

app.use("/location", locationRoute);

// =====================================================
// ROOT TEST
// =====================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Food Delivery API is running...",
  });
});

// =====================================================
// ORDER ROUTE MOUNT TEST
// =====================================================

app.get("/order-test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Order route is mounted correctly",
    route: "/order",
  });
});

// =====================================================
// ORDER DEBUG TEST
// =====================================================

app.get("/order-debug/:id", (req, res) => {
  console.log(
    "ORDER DEBUG ROUTE HIT:",
    req.params.id
  );

  res.status(200).json({
    success: true,
    message: "Order debug route is working",
    orderId: req.params.id,
    method: req.method,
    url: req.originalUrl,
  });
});

// =====================================================
// DEBUG: LOADED ORDER ROUTES
// =====================================================

console.log(
  "======================================"
);

console.log(
  "ORDER ROUTE MOUNTED AT: /order"
);

console.log(
  "Expected Rider Accept Route:"
);

console.log(
  "POST /order/:id/accept"
);

console.log(
  "======================================"
);

// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {
  console.log(
    `404 - ${req.method} ${req.originalUrl}`
  );

  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use(
  (error, req, res, next) => {
    console.error(
      "GLOBAL SERVER ERROR:",
      error
    );

    res.status(
      error.status || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Internal server error",
    });
  }
);

// =====================================================
// SERVER
// =====================================================

const PORT =
  process.env.PORT || 5000;

// IMPORTANT FOR RENDER
// 0.0.0.0 allows Render to access the server.

app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      "======================================"
    );

    console.log(
      `Food Delivery Server running on port ${PORT}`
    );

    console.log(
      "Server started successfully"
    );

    console.log(
      "Order API: /order"
    );

    console.log(
      "Restaurant Orders: /order/restaurant"
    );

    console.log(
      "Rider API: /order/rider"
    );

    console.log(
      "Rider Available: /order/rider/available"
    );

    console.log(
      "Rider Accept: POST /order/:id/accept"
    );

    console.log(
      "======================================"
    );
  }
);
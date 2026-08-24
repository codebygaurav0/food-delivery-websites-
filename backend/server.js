const express = require("express");
const cors = require("cors");

require("dotenv").config();

// ================= SAFE STARTUP CHECK =================
// Prints only whether variables are configured (never values)

console.log(
  "BREVO_KEY configured:",
  Boolean(process.env.BREVO_KEY)
);

console.log(
  "BREVO_EMAIL configured:",
  Boolean(process.env.BREVO_EMAIL)
);

const connectDB = require("./config/db");

// ================= ROUTES =================

const userRoute = require("./routes/userRoute");
const restaurantRoute = require("./routes/restaurantRoute");
const adminRoute = require("./routes/adminRoute");
const foodRoute = require("./routes/foodRoute");
const customerRoute = require("./routes/customerRoute");
const cartRoute = require("./routes/cartRoute");
const orderRoute = require("./routes/orderRoute");
const locationRoute = require("./routes/locationRoute");

// ================= APP =================

const app = express();

// ================= DATABASE =================

connectDB();

// ================= MIDDLEWARE =================

app.use(cors());
app.use(express.json());

// ================= API ROUTES =================

app.use("/user", userRoute);
app.use("/restaurant", restaurantRoute);
app.use("/admin", adminRoute);
app.use("/food", foodRoute);
app.use("/customer", customerRoute);
app.use("/cart", cartRoute);
app.use("/order", orderRoute);
app.use("/location", locationRoute);

// ================= TEST ROUTE =================

app.get("/", (req, res) => {
  res.status(200).send("Food Delivery API is running...");
});

// ================= SERVER =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
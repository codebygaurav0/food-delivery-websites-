const express = require("express");

const router = express.Router();

const {
  signup,
  login,
  verifyOtp,
  resendOtp,
} = require("../controllers/userController");

// ================= SIGNUP =================

router.post("/signup", signup);

// ================= LOGIN =================

router.post("/login", login);

// ================= VERIFY OTP =================

router.post("/signup/verify-otp", verifyOtp);

// ================= RESEND OTP =================

router.post("/signup/resend-otp", resendOtp);

// ================= TEST =================

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "User route is working",
  });
});

module.exports = router;
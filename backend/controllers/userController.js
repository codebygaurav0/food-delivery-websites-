const User = require("../models/UserModel");
const Restaurant = require("../models/RestaurantModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

// =====================================================
// SIGNUP
// =====================================================

const signup = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,

      // Restaurant details
      restaurantName,
      restaurantEmail,
      restaurantPhone,
      address,
      city,
      state,
    } = req.body;

    console.log("========== SIGNUP ==========");
    console.log("Role:", role);
    console.log("Email:", email);

    // =================================================
    // BASIC VALIDATION
    // =================================================

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, password and phone are required",
      });
    }

    // =================================================
    // ROLE
    // =================================================

    const selectedRole = role || "customer";

    if (
      !["customer", "restaurantOwner"].includes(
        selectedRole
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid account type",
      });
    }

    // =================================================
    // RESTAURANT OWNER VALIDATION
    // =================================================

    if (selectedRole === "restaurantOwner") {
      if (
        !restaurantName?.trim() ||
        !restaurantEmail?.trim() ||
        !restaurantPhone?.trim() ||
        !address?.trim() ||
        !city?.trim() ||
        !state?.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Restaurant name, email, phone, address, city and state are required",
        });
      }
    }

    // =================================================
    // CHECK EXISTING USER
    // =================================================

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    // Already verified -> genuine duplicate (conflict)
    if (
      existingUser &&
      existingUser.isVerified
    ) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // NOTE: an existing UNVERIFIED account falls through.
    // We reuse that SAME document below (no duplicates).

    // =================================================
    // HASH PASSWORD
    // =================================================

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // =================================================
    // GENERATE OTP
    // =================================================

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const otpExpire = new Date(
      Date.now() + 10 * 60 * 1000
    );

    // =================================================
    // CREATE OR UPDATE (UNVERIFIED) USER
    // =================================================

    let user = null;
    let isNewUser = false;

    if (existingUser) {
      // Re-use the SAME document -> no duplicate users
      user = existingUser;

      user.password = hashedPassword;
      user.phone = phone.trim();
      user.otp = otp;
      user.otpExpire = otpExpire;

      await user.save();

      console.log(
        "UNVERIFIED USER UPDATED:",
        user._id
      );
    } else {
      isNewUser = true;

      user = await User.create({
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        phone: phone.trim(),
        role: selectedRole,

        // OTP
        otp: otp,
        otpExpire: otpExpire,
        isVerified: false,
      });

      console.log("NEW USER CREATED:", user._id);
      console.log("USER ROLE:", user.role);
    }

    // =================================================
    // CREATE RESTAURANT REQUEST
    // =================================================

    let restaurant = null;

    if (
      isNewUser &&
      selectedRole === "restaurantOwner"
    ) {
      restaurant = await Restaurant.create({
        owner: user._id,

        restaurantName:
          restaurantName.trim(),

        email:
          restaurantEmail
            .toLowerCase()
            .trim(),

        phone:
          restaurantPhone.trim(),

        address:
          address.trim(),

        city:
          city.trim(),

        state:
          state.trim(),

        status: "Pending",
      });

      console.log(
        "RESTAURANT REQUEST CREATED:",
        restaurant._id
      );

      console.log(
        "RESTAURANT STATUS:",
        restaurant.status
      );
    }

    // =================================================
    // SEND OTP EMAIL
    // =================================================

    try {
      await sendEmail({
        to: user.email,

        subject:
          "Foodie - Email Verification OTP",

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 30px;
          background: #ffffff;
        ">

          <h2 style="
            color: #f97316;
            margin-bottom: 20px;
          ">
            🍔 Foodie
          </h2>

          <h3>
            Verify Your Email
          </h3>

          <p>
            Hello <strong>${user.name}</strong>,
          </p>

          <p>
            Thank you for creating your Foodie account.
            Please use the OTP below to verify your email.
          </p>

          <div style="
            background: #fff7ed;
            border: 1px solid #fed7aa;
            padding: 25px;
            text-align: center;
            border-radius: 12px;
            margin: 25px 0;
          ">

            <div style="
              font-size: 36px;
              font-weight: bold;
              letter-spacing: 10px;
              color: #f97316;
            ">
              ${otp}
            </div>

          </div>

          <p>
            This OTP is valid for
            <strong>10 minutes</strong>.
          </p>

          <p>
            Please do not share this OTP with anyone.
          </p>

          <hr />

          <p style="
            color: #999;
            font-size: 12px;
          ">
            © 2026 Foodie. All rights reserved.
          </p>

        </div>
      `,
      });
    } catch (emailError) {
      // Brevo / network failure -> clean 502,
      // account stays unverified so signup can be retried
      console.error(
        "OTP EMAIL FAILED:",
        emailError.response?.status ||
          emailError.message
      );

      return res.status(502).json({
        success: false,
        message:
          "Account created but the OTP email could not be sent. Please try again or use Resend OTP.",
      });
    }

    console.log(
      "OTP EMAIL SENT TO:",
      user.email
    );

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(201).json({
      success: true,

      message:
        selectedRole === "restaurantOwner"
          ? "Account created successfully. OTP has been sent to your email. Restaurant request is pending Super Admin approval."
          : "Account created successfully. OTP has been sent to your email.",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },

      restaurant,
    });

  } catch (error) {
    console.error(
      "========== SIGNUP ERROR =========="
    );

    console.error(error.message);

    // Race-condition duplicate on unique email index
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Mongoose validation -> client error
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message:
          Object.values(error.errors)[0].message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =====================================================
// LOGIN
// =====================================================

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // =================================================
    // EMAIL VERIFICATION CHECK
    // =================================================

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message:
          "Please verify your email before login.",
        requiresVerification: true,
        email: user.email,
      });
    }

    // =================================================
    // BLOCKED CHECK
    // =================================================

    if (user.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "Your account is blocked",
      });
    }

    // =================================================
    // PASSWORD CHECK
    // =================================================

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // =================================================
    // JWT
    // =================================================

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });

  } catch (error) {
    console.error(
      "Login Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =====================================================
// VERIFY OTP
// =====================================================

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log(
      "========== VERIFY OTP =========="
    );

    // Do not log OTP values (security)

    // =================================================
    // VALIDATION
    // =================================================

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message:
          "Email and OTP are required",
      });
    }

    // =================================================
    // FIND USER
    // =================================================

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // =================================================
    // ALREADY VERIFIED
    // =================================================

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message:
          "Email is already verified",
      });
    }

    // =================================================
    // OTP EXISTS
    // =================================================

    if (
      !user.otp ||
      !user.otpExpire
    ) {
      return res.status(400).json({
        success: false,
        message:
          "OTP not found. Please resend OTP.",
      });
    }

    // =================================================
    // OTP EXPIRY
    // =================================================

    if (
      new Date() >
      new Date(user.otpExpire)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "OTP has expired. Please resend OTP.",
      });
    }

    // =================================================
    // OTP MATCH
    // =================================================

    if (
      user.otp.toString() !==
      otp.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // =================================================
    // VERIFY USER
    // =================================================

    user.isVerified = true;

    user.otp = null;
    user.otpExpire = null;

    await user.save();

    console.log(
      "EMAIL VERIFIED:",
      user.email
    );

    return res.status(200).json({
      success: true,
      message:
        "Email verified successfully. Account created.",
    });

  } catch (error) {
    console.error(
      "Verify OTP Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =====================================================
// RESEND OTP
// =====================================================

const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message:
          "Email is required",
      });
    }

    const cleanEmail =
      email.toLowerCase().trim();

    // =================================================
    // FIND USER
    // =================================================

    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // =================================================
    // ALREADY VERIFIED
    // =================================================

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message:
          "Email is already verified",
      });
    }

    // =================================================
    // NEW OTP
    // =================================================

    const otp = Math.floor(
      100000 +
      Math.random() * 900000
    ).toString();

    const otpExpire = new Date(
      Date.now() +
      10 * 60 * 1000
    );

    // =================================================
    // SAVE OTP
    // =================================================

    user.otp = otp;
    user.otpExpire = otpExpire;

    await user.save();

    // =================================================
    // SEND EMAIL
    // =================================================

    await sendEmail({
      to: user.email,

      subject:
        "Foodie - New Verification OTP",

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 30px;
        ">

          <h2 style="color:#f97316;">
            🍔 Foodie
          </h2>

          <h3>
            Email Verification OTP
          </h3>

          <p>
            Hello <strong>${user.name}</strong>,
          </p>

          <p>
            Your new verification OTP is:
          </p>

          <div style="
            background:#fff7ed;
            border:1px solid #fed7aa;
            padding:20px;
            text-align:center;
            border-radius:10px;
            margin:20px 0;
          ">

            <span style="
              font-size:32px;
              font-weight:bold;
              letter-spacing:8px;
              color:#f97316;
            ">
              ${otp}
            </span>

          </div>

          <p>
            This OTP is valid for
            <strong>10 minutes</strong>.
          </p>

          <p>
            If you did not request this OTP,
            please ignore this email.
          </p>

          <hr />

          <small style="color:#999;">
            © 2026 Foodie
          </small>

        </div>
      `,
    });

    console.log(
      "NEW OTP SENT:",
      user.email
    );

    return res.status(200).json({
      success: true,
      message:
        "New OTP sent successfully",
    });

  } catch (error) {
    console.error(
      "Resend OTP Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to resend OTP",
      error: error.message,
    });
  }
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  signup,
  login,
  verifyOtp,
  resendOtp,
};
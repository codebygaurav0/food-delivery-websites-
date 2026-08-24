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

      // Rider details
      vehicleType,
      vehicleNumber,
      drivingLicenseNumber,
      riderCity,
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
      ![
        "customer",
        "restaurantOwner",
        "rider",
      ].includes(selectedRole)
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
    // RIDER VALIDATION
    // =================================================

    if (selectedRole === "rider") {
      if (
        !vehicleType?.trim() ||
        !vehicleNumber?.trim() ||
        !drivingLicenseNumber?.trim() ||
        !riderCity?.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Vehicle type, vehicle number, driving license number and city are required for rider registration",
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

    if (
      existingUser &&
      existingUser.isVerified
    ) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

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
    // CREATE / UPDATE USER
    // =================================================

    let user = null;

    if (existingUser) {
      user = existingUser;

      user.name = name.trim();
      user.password = hashedPassword;
      user.phone = phone.trim();
      user.role = selectedRole;

      user.otp = otp;
      user.otpExpire = otpExpire;
      user.isVerified = false;

      // ---------------- RIDER ----------------
      if (selectedRole === "rider") {
        user.status = "pending";
        user.riderRequestStatus = "Pending";
        user.riderRejectionReason = "";
        user.riderApprovedAt = null;
        user.riderRejectedAt = null;

        user.vehicleType = vehicleType.trim();

        user.vehicleNumber =
          vehicleNumber.trim().toUpperCase();

        user.drivingLicenseNumber =
          drivingLicenseNumber.trim();

        user.riderCity = riderCity.trim();
      }

      // ---------------- CUSTOMER ----------------
      if (selectedRole === "customer") {
        user.status = "active";
      }

      // ---------------- RESTAURANT OWNER ----------------
      if (
        selectedRole === "restaurantOwner"
      ) {
        if (
          user.status === "blocked" ||
          user.status === "rejected"
        ) {
          user.status = "active";
        }
      }

      await user.save();

      console.log(
        "UNVERIFIED USER UPDATED:",
        user._id
      );
    } else {
      const userData = {
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        phone: phone.trim(),
        role: selectedRole,

        otp,
        otpExpire,
        isVerified: false,

        status:
          selectedRole === "rider"
            ? "pending"
            : "active",
      };

      // Rider fields
      if (selectedRole === "rider") {
        userData.vehicleType =
          vehicleType.trim();

        userData.vehicleNumber =
          vehicleNumber
            .trim()
            .toUpperCase();

        userData.drivingLicenseNumber =
          drivingLicenseNumber.trim();

        userData.riderCity =
          riderCity.trim();

        userData.riderRequestStatus =
          "Pending";

        userData.riderRejectionReason = "";
        userData.riderApprovedAt = null;
        userData.riderRejectedAt = null;
      }

      user = await User.create(userData);

      console.log(
        "NEW USER CREATED:",
        user._id
      );

      console.log(
        "USER ROLE:",
        user.role
      );
    }

    // =================================================
    // CREATE RESTAURANT REQUEST
    // =================================================

    let restaurant = null;

    if (
      selectedRole === "restaurantOwner"
    ) {
      restaurant =
        await Restaurant.findOne({
          owner: user._id,
          status: "Pending",
        });

      if (!restaurant) {
        restaurant =
          await Restaurant.create({
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
      }
    }

    // =================================================
    // SEND OTP EMAIL
    // =================================================

    let emailSent = false;

    try {
      const emailResult = await sendEmail({
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
              Thank you for registering with Foodie.
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

        otp,
      });

      emailSent = emailResult?.sent === true;

      if (emailSent) {
        console.log(
          "✅ OTP EMAIL SENT TO:",
          user.email
        );
      }
    } catch (emailError) {
      console.error(
        "❌ OTP EMAIL FAILED:",
        emailError.response?.data ||
          emailError.message
      );
    }

    // =================================================
    // DEVELOPMENT OTP FALLBACK
    // =================================================

    if (!emailSent) {
      console.log("================================");
      console.log("🚧 DEVELOPMENT OTP");
      console.log("Email:", user.email);
      console.log("OTP:", otp);
      console.log("================================");
    }

    // =================================================
    // RESPONSE MESSAGE
    // =================================================

    let responseMessage = emailSent
      ? "Account created successfully. OTP has been sent to your email."
      : "Account created successfully. Development OTP has been generated. Check backend terminal.";

    if (
      selectedRole === "restaurantOwner"
    ) {
      responseMessage = emailSent
        ? "Account created successfully. OTP has been sent to your email. Restaurant request is pending Super Admin approval."
        : "Account created successfully. Development OTP has been generated. Restaurant request is pending Super Admin approval.";
    }

    if (selectedRole === "rider") {
      responseMessage = emailSent
        ? "Rider account created successfully. OTP has been sent to your email. Your rider request is pending Super Admin approval."
        : "Rider account created successfully. Development OTP has been generated. Your rider request is pending Super Admin approval.";
    }

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(201).json({
      success: true,

      message: responseMessage,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        riderRequestStatus:
          user.riderRequestStatus,
      },

      restaurant,
    });
  } catch (error) {
    console.error(
      "========== SIGNUP ERROR =========="
    );

    console.error(error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    if (
      error.name === "ValidationError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          Object.values(
            error.errors
          )[0].message,
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
    const {
      email,
      password,
    } = req.body;

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

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message:
          "Please verify your email before login.",
        requiresVerification: true,
        email: user.email,
      });
    }

    if (user.status === "blocked") {
      return res.status(403).json({
        success: false,
        message:
          "Your account is blocked",
      });
    }

    // =================================================
    // RIDER APPROVAL
    // =================================================

    if (
      user.role === "rider" &&
      user.riderRequestStatus !== "Approved"
    ) {
      if (
        user.riderRequestStatus ===
        "Rejected"
      ) {
        return res.status(403).json({
          success: false,
          message:
            user.riderRejectionReason ||
            "Your rider request has been rejected",
        });
      }

      return res.status(403).json({
        success: false,
        message:
          "Your rider request is pending Super Admin approval.",
      });
    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

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
        status: user.status,
        riderRequestStatus:
          user.riderRequestStatus,
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
    const {
      email,
      otp,
    } = req.body;

    console.log(
      "========== VERIFY OTP =========="
    );

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message:
          "Email and OTP are required",
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

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message:
          "Email is already verified",
      });
    }

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

    if (
      user.otp.toString() !==
      otp.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

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
        user.role === "rider"
          ? "Email verified successfully. Your rider request is now pending Super Admin approval."
          : "Email verified successfully. Account created.",
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

    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message:
          "Email is already verified",
      });
    }

    const otp = Math.floor(
      100000 +
        Math.random() * 900000
    ).toString();

    const otpExpire = new Date(
      Date.now() + 10 * 60 * 1000
    );

    user.otp = otp;
    user.otpExpire = otpExpire;

    await user.save();

    // =================================================
    // SEND RESEND OTP
    // =================================================

    let emailSent = false;

    try {
      const emailResult = await sendEmail({
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

            <hr />

            <small style="color:#999;">
              © 2026 Foodie
            </small>

          </div>
        `,

        otp,
      });

      emailSent =
        emailResult?.sent === true;

      if (emailSent) {
        console.log(
          "✅ NEW OTP SENT:",
          user.email
        );
      }
    } catch (emailError) {
      console.error(
        "❌ RESEND OTP EMAIL FAILED:",
        emailError.response?.data ||
          emailError.message
      );
    }

    // =================================================
    // DEVELOPMENT RESEND OTP
    // =================================================

    if (!emailSent) {
      console.log("================================");
      console.log(
        "🚧 DEVELOPMENT RESEND OTP"
      );
      console.log(
        "Email:",
        user.email
      );
      console.log(
        "OTP:",
        otp
      );
      console.log("================================");
    }

    return res.status(200).json({
      success: true,

      message: emailSent
        ? "New OTP sent successfully"
        : "New OTP generated. Check backend terminal.",
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
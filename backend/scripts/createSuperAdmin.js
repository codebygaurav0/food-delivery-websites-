/**
 * Creates the Super Admin account (one-time seed).
 *
 * Run from the backend folder:
 *   node scripts/createSuperAdmin.js
 *
 * Credentials created:
 *   Email:    superadmin@foodie.com
 *   Password: SuperAdmin@123
 */

require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/UserModel");

const SUPER_ADMIN = {
  name: "Super Admin",
  email: "superadmin@foodie.com",
  phone: "9999999999",
  password: "SuperAdmin@123",
};

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existing = await User.findOne({
      email: SUPER_ADMIN.email,
    });

    if (existing) {
      console.log(
        "Super Admin already exists:",
        SUPER_ADMIN.email
      );

      await mongoose.disconnect();
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(
      SUPER_ADMIN.password,
      10
    );

    await User.create({
      name: SUPER_ADMIN.name,
      email: SUPER_ADMIN.email,
      phone: SUPER_ADMIN.phone,
      password: hashedPassword,
      role: "superAdmin",
    });

    console.log("Super Admin created successfully");
    console.log("  Email:", SUPER_ADMIN.email);
    console.log("  Password:", SUPER_ADMIN.password);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(
      "Create Super Admin Error:",
      error.message
    );

    process.exit(1);
  }
};

createSuperAdmin();

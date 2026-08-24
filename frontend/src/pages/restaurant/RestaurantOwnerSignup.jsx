import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // User details
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "customer",

    // Restaurant details
    restaurantName: "",
    restaurantEmail: "",
    restaurantPhone: "",
    address: "",
    city: "",
    state: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ================= HANDLE CHANGE =================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ================= SUBMIT =================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Restaurant Owner validation
    if (formData.role === "restaurantOwner") {
      if (
        !formData.restaurantName ||
        !formData.restaurantEmail ||
        !formData.restaurantPhone ||
        !formData.address ||
        !formData.city ||
        !formData.state
      ) {
        setError(
          "Please fill all restaurant details."
        );
        return;
      }
    }

    setLoading(true);

    try {
      const response = await api.post(
        "/user/signup",
        formData
      );

      if (response.data.success) {
        if (formData.role === "restaurantOwner") {
          setSuccess(
            "Restaurant Owner account created. Your restaurant request has been sent to Super Admin for approval."
          );
        } else {
          setSuccess(
            "Account created successfully! Redirecting to login..."
          );
        }

        setTimeout(() => {
          navigate("/login");
        }, 1800);
      }
    } catch (error) {
      console.error("Signup Error:", error);

      setError(
        error.response?.data?.message ||
          "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center px-4 py-8">

      <div className="w-full max-w-md">

        {/* ================= BRAND ================= */}

        <div className="text-center mb-7">

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500 text-white text-3xl shadow-lg mb-4">
            🍔
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Join Foodie
          </h1>

          <p className="text-gray-500 mt-2">
            Create your account and get started
          </p>

        </div>

        {/* ================= CARD ================= */}

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">

          <h2 className="text-2xl font-bold text-gray-900">
            Create Account
          </h2>

          <p className="text-gray-500 mt-1 mb-6">
            Enter your details below
          </p>

          {/* ================= ERROR ================= */}

          {error && (
            <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* ================= SUCCESS ================= */}

          {success && (
            <div className="mb-5 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-600">
              {success}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            {/* ================= USER DETAILS ================= */}

            {/* Full Name */}

            <div>

              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Full Name
              </label>

              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />

            </div>

            {/* Email */}

            <div>

              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />

            </div>

            {/* Phone */}

            <div>

              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Phone Number
              </label>

              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />

            </div>

            {/* Password */}

            <div>

              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />

            </div>

            {/* ================= ACCOUNT TYPE ================= */}

            <div>

              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Account Type
              </label>

              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              >

                <option value="customer">
                  👤 Customer
                </option>

                <option value="restaurantOwner">
                  🏪 Restaurant Owner
                </option>

              </select>

            </div>

            {/* ================= ROLE INFO ================= */}

            <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">

              <p className="text-sm text-orange-700">

                {formData.role === "customer" ? (
                  <>
                    👤 Account Type:{" "}
                    <span className="font-semibold">
                      Customer
                    </span>
                  </>
                ) : (
                  <>
                    🏪 Account Type:{" "}
                    <span className="font-semibold">
                      Restaurant Owner
                    </span>
                  </>
                )}

              </p>

            </div>

            {/* ================================================= */}
            {/* RESTAURANT DETAILS */}
            {/* ================================================= */}

            {formData.role === "restaurantOwner" && (
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">

                <div>

                  <h3 className="text-xl font-bold text-gray-900">
                    🏪 Restaurant Details
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    These details will be sent to Super Admin
                    for approval.
                  </p>

                </div>

                {/* Restaurant Name */}

                <div>

                  <label
                    htmlFor="restaurantName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Restaurant Name
                  </label>

                  <input
                    id="restaurantName"
                    type="text"
                    name="restaurantName"
                    value={formData.restaurantName}
                    onChange={handleChange}
                    placeholder="e.g. Foodie Restaurant"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />

                </div>

                {/* Restaurant Email */}

                <div>

                  <label
                    htmlFor="restaurantEmail"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Restaurant Email
                  </label>

                  <input
                    id="restaurantEmail"
                    type="email"
                    name="restaurantEmail"
                    value={formData.restaurantEmail}
                    onChange={handleChange}
                    placeholder="restaurant@example.com"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />

                </div>

                {/* Restaurant Phone */}

                <div>

                  <label
                    htmlFor="restaurantPhone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Restaurant Phone
                  </label>

                  <input
                    id="restaurantPhone"
                    type="tel"
                    name="restaurantPhone"
                    value={formData.restaurantPhone}
                    onChange={handleChange}
                    placeholder="Enter restaurant phone"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />

                </div>

                {/* Address */}

                <div>

                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Restaurant Address
                  </label>

                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter complete restaurant address"
                    rows="3"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none resize-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />

                </div>

                {/* City */}

                <div>

                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    City
                  </label>

                  <input
                    id="city"
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Jaipur"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />

                </div>

                {/* State */}

                <div>

                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    State
                  </label>

                  <input
                    id="state"
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="e.g. Rajasthan"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />

                </div>

                {/* Pending Info */}

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">

                  <p className="text-sm text-yellow-800">
                    ⏳ Your restaurant will remain{" "}
                    <strong>Pending</strong> until the
                    Super Admin approves it.
                  </p>

                </div>

              </div>
            )}

            {/* ================= SUBMIT ================= */}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3.5 rounded-xl transition duration-200 shadow-md hover:shadow-lg"
            >
              {loading
                ? "Creating Account..."
                : formData.role === "restaurantOwner"
                ? "Create Owner Account & Submit"
                : "Create Account"}
            </button>

          </form>

          {/* ================= LOGIN ================= */}

          <div className="mt-6 text-center text-sm text-gray-500">

            Already have an account?{" "}

            <Link
              to="/login"
              className="font-semibold text-orange-500 hover:text-orange-600"
            >
              Login
            </Link>

          </div>

        </div>

        {/* ================= FOOTER ================= */}

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 Foodie. All rights reserved.
        </p>

      </div>

    </div>
  );
}

export default Signup;
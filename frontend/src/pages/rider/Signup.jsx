import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function RiderSignup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    vehicleType: "Bike",
    vehicleNumber: "",
    drivingLicenseNumber: "",
    riderCity: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const cleanEmail = formData.email
        .trim()
        .toLowerCase();

      // =================================================
      // SIGNUP API
      // =================================================

      const response = await api.post("/user/signup", {
        ...formData,
        email: cleanEmail,
        role: "rider",
      });

      console.log(
        "========== RIDER SIGNUP RESPONSE =========="
      );

      console.log(response.data);

      // =================================================
      // SUCCESS
      // =================================================

      if (response.data?.success) {
        // Save email as backup
        localStorage.setItem(
          "signupEmail",
          cleanEmail
        );

        localStorage.setItem(
          "signupRole",
          "rider"
        );

        // =================================================
        // IMPORTANT
        // VerifyOtp.jsx location.state se email read karega
        // =================================================

        navigate("/verify-otp", {
          state: {
            email: cleanEmail,
            role: "rider",
          },
        });

        return;
      }

      // =================================================
      // API SUCCESS FALSE
      // =================================================

      setError(
        response.data?.message ||
          "Unable to create rider account"
      );
    } catch (error) {
      console.error(
        "Rider Signup Error:",
        error
      );

      console.error(
        "Server Response:",
        error.response?.data
      );

      setError(
        error.response?.data?.message ||
          "Unable to create rider account"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

        {/* ================= HEADER ================= */}

        <div className="text-center mb-8">
          <div className="text-5xl mb-3">
            🛵
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Rider Registration
          </h1>

          <p className="text-gray-500 mt-2">
            Register as a Foodie delivery partner.
          </p>
        </div>

        {/* ================= ERROR ================= */}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl">
            {error}
          </div>
        )}

        {/* ================= FORM ================= */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* Name */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              autoComplete="name"
              placeholder="Enter your full name"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Email */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              placeholder="Enter email address"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Phone */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>

            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              maxLength={10}
              inputMode="numeric"
              autoComplete="tel"
              placeholder="Enter 10 digit mobile number"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Password */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Create password"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Vehicle */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Vehicle Type */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Type
              </label>

              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="Bike">
                  Bike
                </option>

                <option value="Scooter">
                  Scooter
                </option>

                <option value="Car">
                  Car
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            {/* Vehicle Number */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Number
              </label>

              <input
                type="text"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
                required
                autoComplete="off"
                placeholder="RJ14AB1234"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 uppercase outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

          </div>

          {/* Driving License */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Driving License Number
            </label>

            <input
              type="text"
              name="drivingLicenseNumber"
              value={
                formData.drivingLicenseNumber
              }
              onChange={handleChange}
              required
              autoComplete="off"
              placeholder="Enter driving license number"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 uppercase outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* City */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>

            <input
              type="text"
              name="riderCity"
              value={formData.riderCity}
              onChange={handleChange}
              required
              autoComplete="address-level2"
              placeholder="Enter your city"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Submit */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition"
          >
            {loading
              ? "Creating Account..."
              : "Register as Rider"}
          </button>

        </form>

        {/* ================= INFO ================= */}

        <div className="mt-6 bg-orange-50 border border-orange-100 rounded-xl p-4">
          <p className="text-sm text-orange-800">
            After email verification, your rider
            registration will be sent to the Super Admin
            for approval. You can log in only after approval.
          </p>
        </div>

        {/* ================= LOGIN ================= */}

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="w-full mt-4 text-gray-600 hover:text-orange-600 font-medium"
        >
          Already have an account? Login
        </button>

      </div>
    </div>
  );
}

export default RiderSignup;
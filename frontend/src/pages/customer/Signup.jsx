import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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

    // ================= BASIC VALIDATION =================

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.password
    ) {
      setError("Please fill all required fields.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    // ================= RESTAURANT VALIDATION =================

    if (formData.role === "restaurantOwner") {
      if (
        !formData.restaurantName.trim() ||
        !formData.restaurantEmail.trim() ||
        !formData.restaurantPhone.trim() ||
        !formData.address.trim() ||
        !formData.city.trim() ||
        !formData.state.trim()
      ) {
        setError(
          "Please fill all restaurant details."
        );
        return;
      }
    }

    setLoading(true);

    try {
      // ================= SEND SIGNUP REQUEST =================

      const response = await api.post(
        "/user/signup",
        formData
      );

      if (response.data.success) {
        setSuccess(
          "OTP has been sent to your email. Please verify your email."
        );

        // ================= GO TO OTP PAGE =================

 setTimeout(() => {
  navigate("/verify-otp", {
    state: {
      email: formData.email,
    },
  });
}, 1000);
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
    <div className="min-h-screen bg-[#FFFCF7] flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Manrope:wght@400;500;600;700&display=swap');

        @keyframes blobMove {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(24px, -18px) scale(1.08); }
          66% { transform: translate(-18px, 14px) scale(0.95); }
        }
        @keyframes floatSpec {
          0% { transform: translateY(0) rotate(0deg); opacity: 0.5; }
          50% { opacity: 0.9; }
          100% { transform: translateY(-140px) rotate(40deg); opacity: 0; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes badgeSizzle {
          0%, 100% { transform: rotate(-4deg) scale(1); }
          50% { transform: rotate(4deg) scale(1.05); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes panelOpen {
          from { opacity: 0; transform: translateY(-8px); max-height: 0; }
          to { opacity: 1; transform: translateY(0); max-height: 2000px; }
        }

        .fade-up { animation: fadeSlideUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .badge-sizzle { animation: badgeSizzle 2.6s ease-in-out infinite; }
        .blob { animation: blobMove 10s ease-in-out infinite; }
        .float-spec { animation: floatSpec linear infinite; }
        .dot-bounce { animation: dotBounce 1.1s ease-in-out infinite; }
        .panel-open { animation: panelOpen 0.4s cubic-bezier(0.22, 1, 0.36, 1) both; }
      `}</style>

      {/* Ambient background: warm blobs + drifting spice specks */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="blob absolute -top-24 -left-16 w-80 h-80 rounded-full bg-[#D93425]/10 blur-3xl" />
        <div
          className="blob absolute -bottom-28 -right-20 w-96 h-96 rounded-full bg-[#E8A93B]/15 blur-3xl"
          style={{ animationDelay: "-3s" }}
        />
        {[
          { l: "10%", d: "0s", dur: "7s", e: "🌶️" },
          { l: "26%", d: "1.4s", dur: "8.5s", e: "✨" },
          { l: "56%", d: "0.6s", dur: "7.5s", e: "🧄" },
          { l: "74%", d: "2.2s", dur: "9s", e: "✨" },
          { l: "90%", d: "1s", dur: "8s", e: "🌿" },
        ].map((p, i) => (
          <span
            key={i}
            className="float-spec absolute bottom-0 text-lg opacity-0"
            style={{ left: p.l, animationDelay: p.d, animationDuration: p.dur }}
          >
            {p.e}
          </span>
        ))}
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* ================= BRAND ================= */}
        <div className="text-center mb-7 fade-up" style={{ animationDelay: "0.05s" }}>
          <div className="badge-sizzle inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D93425] to-[#B32418] text-white text-3xl shadow-lg shadow-[#D93425]/25 mb-4">
            🍔
          </div>

          <h1 className="text-3xl font-extrabold text-[#241608]" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
            Join Foodie
          </h1>

          <p className="text-[#8A7461] mt-2 font-medium">
            Create your account and get started
          </p>
        </div>

        {/* ================= CARD ================= */}
        <div
          className="fade-up bg-white/90 backdrop-blur-sm rounded-[28px] shadow-xl shadow-[#D93425]/5 border border-[#F0E4D4] p-8 relative"
          style={{ animationDelay: "0.15s" }}
        >
          {/* Receipt-style dashed accent at top of card */}
          <div className="absolute -top-px left-8 right-8 h-px bg-[repeating-linear-gradient(90deg,#E8A93B_0_8px,transparent_8px_16px)]" />

          <h2 className="text-2xl font-bold text-[#241608]" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
            Create Account
          </h2>

          <p className="text-[#8A7461] mt-1 mb-6 text-sm font-medium">
            Enter your details below
          </p>

          {/* ================= ERROR ================= */}
          {error && (
            <div className="mb-5 rounded-xl bg-[#FDECEA] border border-[#F3C6C0] px-4 py-3 text-sm text-[#B32418] font-medium fade-up">
              {error}
            </div>
          )}

          {/* ================= SUCCESS ================= */}
          {success && (
            <div className="mb-5 rounded-xl bg-[#EFF6E9] border border-[#CFE4BE] px-4 py-3 text-sm text-[#4A7A2E] font-medium fade-up">
              {success}
            </div>
          )}

          {/* ================= FORM ================= */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ================= FULL NAME ================= */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-[#241608] mb-2">
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
                autoComplete="name"
                className="w-full px-4 py-3 rounded-xl border border-[#EAE0D2] bg-[#FFFCF7] outline-none transition-all duration-200 focus:border-[#D93425] focus:ring-4 focus:ring-[#D93425]/10 focus:bg-white text-[#241608] placeholder:text-[#B8A996]"
              />
            </div>

            {/* ================= EMAIL ================= */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#241608] mb-2">
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
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-[#EAE0D2] bg-[#FFFCF7] outline-none transition-all duration-200 focus:border-[#D93425] focus:ring-4 focus:ring-[#D93425]/10 focus:bg-white text-[#241608] placeholder:text-[#B8A996]"
              />
            </div>

            {/* ================= PHONE ================= */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-[#241608] mb-2">
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
                autoComplete="tel"
                className="w-full px-4 py-3 rounded-xl border border-[#EAE0D2] bg-[#FFFCF7] outline-none transition-all duration-200 focus:border-[#D93425] focus:ring-4 focus:ring-[#D93425]/10 focus:bg-white text-[#241608] placeholder:text-[#B8A996]"
              />
            </div>

            {/* ================= PASSWORD ================= */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[#241608] mb-2">
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
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-xl border border-[#EAE0D2] bg-[#FFFCF7] outline-none transition-all duration-200 focus:border-[#D93425] focus:ring-4 focus:ring-[#D93425]/10 focus:bg-white text-[#241608] placeholder:text-[#B8A996]"
              />
              <p className="text-xs text-[#B8A996] mt-1">
                Minimum 6 characters
              </p>
            </div>

            {/* ================= ACCOUNT TYPE ================= */}
            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-[#241608] mb-2">
                Account Type
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-[#EAE0D2] bg-[#FFFCF7] outline-none transition-all duration-200 focus:border-[#D93425] focus:ring-4 focus:ring-[#D93425]/10 focus:bg-white text-[#241608] cursor-pointer"
              >
                <option value="customer">👤 Customer</option>
                <option value="restaurantOwner">🏪 Restaurant Owner</option>
              </select>
            </div>

            {/* ================= ROLE INFO ================= */}
            <div className="bg-[#FDF3E0] border border-[#F0DFB0] rounded-xl px-4 py-3 transition-all duration-300">
              <p className="text-sm text-[#8A6412]">
                {formData.role === "customer" ? (
                  <>
                    👤 Account Type:{" "}
                    <span className="font-bold">Customer</span>
                  </>
                ) : (
                  <>
                    🏪 Account Type:{" "}
                    <span className="font-bold">Restaurant Owner</span>
                  </>
                )}
              </p>
            </div>

            {/* ================================================= */}
            {/* RESTAURANT DETAILS */}
            {/* ================================================= */}
            {formData.role === "restaurantOwner" && (
              <div className="panel-open mt-6 pt-6 border-t border-[#F0E4D4] space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-[#241608]" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                    🏪 Restaurant Details
                  </h3>
                  <p className="text-sm text-[#8A7461] mt-1">
                    These details will be sent to Super Admin for approval.
                  </p>
                </div>

                {/* Restaurant Name */}
                <div>
                  <label htmlFor="restaurantName" className="block text-sm font-semibold text-[#241608] mb-2">
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
                    className="w-full px-4 py-3 rounded-xl border border-[#EAE0D2] bg-[#FFFCF7] outline-none transition-all duration-200 focus:border-[#D93425] focus:ring-4 focus:ring-[#D93425]/10 focus:bg-white text-[#241608] placeholder:text-[#B8A996]"
                  />
                </div>

                {/* Restaurant Email */}
                <div>
                  <label htmlFor="restaurantEmail" className="block text-sm font-semibold text-[#241608] mb-2">
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
                    className="w-full px-4 py-3 rounded-xl border border-[#EAE0D2] bg-[#FFFCF7] outline-none transition-all duration-200 focus:border-[#D93425] focus:ring-4 focus:ring-[#D93425]/10 focus:bg-white text-[#241608] placeholder:text-[#B8A996]"
                  />
                </div>

                {/* Restaurant Phone */}
                <div>
                  <label htmlFor="restaurantPhone" className="block text-sm font-semibold text-[#241608] mb-2">
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
                    className="w-full px-4 py-3 rounded-xl border border-[#EAE0D2] bg-[#FFFCF7] outline-none transition-all duration-200 focus:border-[#D93425] focus:ring-4 focus:ring-[#D93425]/10 focus:bg-white text-[#241608] placeholder:text-[#B8A996]"
                  />
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-sm font-semibold text-[#241608] mb-2">
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
                    className="w-full px-4 py-3 rounded-xl border border-[#EAE0D2] bg-[#FFFCF7] outline-none resize-none transition-all duration-200 focus:border-[#D93425] focus:ring-4 focus:ring-[#D93425]/10 focus:bg-white text-[#241608] placeholder:text-[#B8A996]"
                  />
                </div>

                {/* City */}
                <div>
                  <label htmlFor="city" className="block text-sm font-semibold text-[#241608] mb-2">
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
                    className="w-full px-4 py-3 rounded-xl border border-[#EAE0D2] bg-[#FFFCF7] outline-none transition-all duration-200 focus:border-[#D93425] focus:ring-4 focus:ring-[#D93425]/10 focus:bg-white text-[#241608] placeholder:text-[#B8A996]"
                  />
                </div>

                {/* State */}
                <div>
                  <label htmlFor="state" className="block text-sm font-semibold text-[#241608] mb-2">
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
                    className="w-full px-4 py-3 rounded-xl border border-[#EAE0D2] bg-[#FFFCF7] outline-none transition-all duration-200 focus:border-[#D93425] focus:ring-4 focus:ring-[#D93425]/10 focus:bg-white text-[#241608] placeholder:text-[#B8A996]"
                  />
                </div>

                {/* Pending Info */}
                <div className="bg-[#FDF3E0] border border-[#F0DFB0] rounded-xl p-4">
                  <p className="text-sm text-[#8A6412]">
                    ⏳ Your restaurant will remain{" "}
                    <strong>Pending</strong> until the Super Admin approves it.
                  </p>
                </div>
              </div>
            )}

            {/* ================= SUBMIT ================= */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#D93425] to-[#B32418] hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100 text-white font-bold py-3.5 rounded-xl transition-all duration-150 shadow-md shadow-[#D93425]/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="flex gap-1">
                    <span className="dot-bounce w-1.5 h-1.5 rounded-full bg-white" style={{ animationDelay: "0s" }} />
                    <span className="dot-bounce w-1.5 h-1.5 rounded-full bg-white" style={{ animationDelay: "0.15s" }} />
                    <span className="dot-bounce w-1.5 h-1.5 rounded-full bg-white" style={{ animationDelay: "0.3s" }} />
                  </span>
                  Sending OTP
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* ================= LOGIN ================= */}
          <div className="mt-6 text-center text-sm text-[#8A7461]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-[#D93425] hover:text-[#B32418] transition-colors"
            >
              Login
            </Link>
          </div>
        </div>

        {/* ================= FOOTER ================= */}
        <p className="text-center text-xs text-[#B8A996] mt-6 fade-up" style={{ animationDelay: "0.25s" }}>
          © 2026 Foodie. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default Signup;
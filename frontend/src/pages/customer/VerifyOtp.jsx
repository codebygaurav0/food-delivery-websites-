import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import api from "../../services/api";

function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ================= VERIFY OTP =================

  const handleVerify = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email) {
      setError("Email not found. Please signup again.");
      return;
    }

    if (otp.length !== 6) {
      setError("Please enter a valid 6 digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(
        "/user/signup/verify-otp",
        {
          email,
          otp,
        }
      );

      if (response.data.success) {
        setSuccess(
          "Email verified successfully! Account created."
        );

        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (error) {
      console.error(
        "OTP Verification Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Invalid or expired OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= RESEND OTP =================

  const handleResend = async () => {
    setError("");
    setSuccess("");

    if (!email) {
      setError(
        "Email not found. Please signup again."
      );
      return;
    }

    setResending(true);

    try {
      const response = await api.post(
        "/user/signup/resend-otp",
        {
          email,
        }
      );

      if (response.data.success) {
        setSuccess(
          "New OTP has been sent to your email."
        );

        setOtp("");
      }
    } catch (error) {
      console.error(
        "Resend OTP Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to resend OTP."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center px-4 py-8">

      <div className="w-full max-w-md">

        {/* ================= BRAND ================= */}

        <div className="text-center mb-7">

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500 text-white text-3xl shadow-lg mb-4">
            ✉️
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Verify Your Email
          </h1>

          <p className="text-gray-500 mt-2">
            We have sent a 6 digit OTP to
          </p>

          <p className="font-semibold text-orange-500 mt-1 break-all">
            {email || "your email"}
          </p>

        </div>

        {/* ================= CARD ================= */}

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">

          {/* ERROR */}

          {error && (
            <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="mb-5 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-600">
              {success}
            </div>
          )}

          {/* ================= VERIFY FORM ================= */}

          <form
            onSubmit={handleVerify}
            className="space-y-5"
          >

            <div>

              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Enter OTP
              </label>

              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  const value =
                    e.target.value.replace(
                      /\D/g,
                      ""
                    );

                  setOtp(value);
                }}
                placeholder="Enter 6 digit OTP"
                className="w-full px-4 py-4 rounded-xl border border-gray-300 outline-none text-center text-2xl font-bold tracking-[0.5em] focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />

            </div>

            {/* VERIFY BUTTON */}

            <button
              type="submit"
              disabled={
                loading ||
                otp.length !== 6 ||
                !email
              }
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3.5 rounded-xl transition duration-200 shadow-md"
            >
              {loading
                ? "Verifying..."
                : "Verify OTP"}
            </button>

          </form>

          {/* ================= RESEND ================= */}

          <div className="text-center mt-6">

            <p className="text-sm text-gray-500">
              Didn't receive the OTP?
            </p>

            <button
              type="button"
              onClick={handleResend}
              disabled={
                resending || !email
              }
              className="mt-2 font-semibold text-orange-500 hover:text-orange-600 disabled:text-orange-300"
            >
              {resending
                ? "Sending..."
                : "Resend OTP"}
            </button>

          </div>

          {/* ================= BACK ================= */}

          <div className="mt-6 pt-5 border-t border-gray-100 text-center">

            <Link
              to="/signup"
              className="text-sm font-semibold text-gray-500 hover:text-orange-500"
            >
              ← Back to Signup
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

export default VerifyOtp;
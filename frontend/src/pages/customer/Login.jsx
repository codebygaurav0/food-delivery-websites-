import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post(
        "/user/login",
        formData
      );

      console.log("LOGIN RESPONSE:", response.data);

      if (response.data.success) {
        const { token, user } = response.data;

        // Save token
        localStorage.setItem("token", token);

        // Save user
        localStorage.setItem(
          "user",
          JSON.stringify(user)
        );

        console.log("LOGIN USER:", user);
        console.log("USER ROLE:", user.role);

        // =====================================================
        // ROLE BASED REDIRECT
        // =====================================================

        // RIDER
        if (user.role === "rider") {
          navigate("/rider/dashboard");

        // RESTAURANT OWNER
        } else if (
          user.role === "restaurantOwner"
        ) {
          navigate("/restaurant/dashboard");

        // ADMIN / SUPER ADMIN
        } else if (
          user.role === "admin" ||
          user.role === "superAdmin"
        ) {
          navigate("/admin/dashboard");

        // CUSTOMER
        } else if (
          user.role === "customer"
        ) {
          navigate("/");

        // UNKNOWN ROLE
        } else {
          console.warn(
            "Unknown user role:",
            user.role
          );

          navigate("/");
        }
      }
    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
          "Login failed. Please try again."
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
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }

          33% {
            transform: translate(24px, -18px) scale(1.08);
          }

          66% {
            transform: translate(-18px, 14px) scale(0.95);
          }
        }

        @keyframes floatSpec {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.5;
          }

          50% {
            opacity: 0.9;
          }

          100% {
            transform: translateY(-140px) rotate(40deg);
            opacity: 0;
          }
        }

        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes badgeSizzle {
          0%, 100% {
            transform: rotate(-4deg) scale(1);
          }

          50% {
            transform: rotate(4deg) scale(1.05);
          }
        }

        @keyframes dotBounce {
          0%, 80%, 100% {
            transform: scale(0.6);
            opacity: 0.5;
          }

          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .fade-up {
          animation: fadeSlideUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .badge-sizzle {
          animation: badgeSizzle 2.6s ease-in-out infinite;
        }

        .blob {
          animation: blobMove 10s ease-in-out infinite;
        }

        .float-spec {
          animation: floatSpec linear infinite;
        }

        .dot-bounce {
          animation: dotBounce 1.1s ease-in-out infinite;
        }
      `}</style>

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="absolute inset-0 pointer-events-none overflow-hidden">

        <div className="blob absolute -top-24 -left-16 w-80 h-80 rounded-full bg-[#D93425]/10 blur-3xl" />

        <div
          className="blob absolute -bottom-28 -right-20 w-96 h-96 rounded-full bg-[#E8A93B]/15 blur-3xl"
          style={{
            animationDelay: "-3s",
          }}
        />

        {[
          {
            l: "12%",
            d: "0s",
            dur: "7s",
            e: "🌶️",
          },
          {
            l: "28%",
            d: "1.4s",
            dur: "8.5s",
            e: "✨",
          },
          {
            l: "58%",
            d: "0.6s",
            dur: "7.5s",
            e: "🧄",
          },
          {
            l: "76%",
            d: "2.2s",
            dur: "9s",
            e: "✨",
          },
          {
            l: "90%",
            d: "1s",
            dur: "8s",
            e: "🌿",
          },
        ].map((p, i) => (
          <span
            key={i}
            className="float-spec absolute bottom-0 text-lg opacity-0"
            style={{
              left: p.l,
              animationDelay: p.d,
              animationDuration: p.dur,
            }}
          >
            {p.e}
          </span>
        ))}
      </div>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="w-full max-w-md relative z-10">

        {/* =====================================================
            BRAND
        ===================================================== */}

        <div
          className="text-center mb-8 fade-up"
          style={{
            animationDelay: "0.05s",
          }}
        >

          <div className="badge-sizzle inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D93425] to-[#B32418] text-white text-3xl shadow-lg shadow-[#D93425]/25 mb-4">
            🍔
          </div>

          <h1
            className="text-4xl font-extrabold text-[#241608]"
            style={{
              fontFamily: "'Baloo 2', sans-serif",
            }}
          >
            Foodie
          </h1>

          <p className="text-[#8A7461] mt-2 font-medium">
            Delicious food, delivered to your door
          </p>

        </div>

        {/* =====================================================
            CARD
        ===================================================== */}

        <div
          className="fade-up bg-white/90 backdrop-blur-sm rounded-[28px] shadow-xl shadow-[#D93425]/5 border border-[#F0E4D4] p-8 relative"
          style={{
            animationDelay: "0.15s",
          }}
        >

          {/* Dashed top line */}

          <div className="absolute -top-px left-8 right-8 h-px bg-[repeating-linear-gradient(90deg,#E8A93B_0_8px,transparent_8px_16px)]" />

          {/* Heading */}

          <div className="mb-6">

            <h2
              className="text-2xl font-bold text-[#241608]"
              style={{
                fontFamily: "'Baloo 2', sans-serif",
              }}
            >
              Welcome Back
            </h2>

            <p className="text-[#8A7461] mt-1 text-sm font-medium">
              Login to continue your cravings
            </p>

          </div>

          {/* =====================================================
              ERROR
          ===================================================== */}

          {error && (
            <div className="mb-5 rounded-xl bg-[#FDECEA] border border-[#F3C6C0] px-4 py-3 text-sm text-[#B32418] font-medium fade-up">
              {error}
            </div>
          )}

          {/* =====================================================
              FORM
          ===================================================== */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* EMAIL */}

            <div>

              <label className="block text-sm font-semibold text-[#241608] mb-2">
                Email Address
              </label>

              <input
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

            {/* PASSWORD */}

            <div>

              <label className="block text-sm font-semibold text-[#241608] mb-2">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl border border-[#EAE0D2] bg-[#FFFCF7] outline-none transition-all duration-200 focus:border-[#D93425] focus:ring-4 focus:ring-[#D93425]/10 focus:bg-white text-[#241608] placeholder:text-[#B8A996]"
              />

            </div>

            {/* =====================================================
                LOGIN BUTTON
            ===================================================== */}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#D93425] to-[#B32418] hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100 text-white font-bold py-3.5 rounded-xl transition-all duration-150 shadow-md shadow-[#D93425]/25 flex items-center justify-center gap-2 cursor-pointer"
            >

              {loading ? (
                <>
                  <span className="flex gap-1">

                    <span
                      className="dot-bounce w-1.5 h-1.5 rounded-full bg-white"
                      style={{
                        animationDelay: "0s",
                      }}
                    />

                    <span
                      className="dot-bounce w-1.5 h-1.5 rounded-full bg-white"
                      style={{
                        animationDelay: "0.15s",
                      }}
                    />

                    <span
                      className="dot-bounce w-1.5 h-1.5 rounded-full bg-white"
                      style={{
                        animationDelay: "0.3s",
                      }}
                    />

                  </span>

                  Logging in
                </>
              ) : (
                "Login"
              )}

            </button>

          </form>

          {/* =====================================================
              SIGNUP
          ===================================================== */}

          <div className="mt-6 text-center text-sm text-[#8A7461]">

            Don't have an account?{" "}

            <Link
              to="/signup"
              className="font-bold text-[#D93425] hover:text-[#B32418] transition-colors"
            >
              Create Account
            </Link>

          </div>

        </div>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <p
          className="text-center text-xs text-[#B8A996] mt-6 fade-up"
          style={{
            animationDelay: "0.25s",
          }}
        >
          © 2026 Foodie. All rights reserved.
        </p>

      </div>

    </div>
  );
}

export default Login;
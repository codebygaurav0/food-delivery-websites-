import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  // =====================================================
  // FETCH DASHBOARD
  // =====================================================

  const fetchDashboard = async () => {
    let loadedRestaurant = null;

    try {
      // =================================================
      // LOAD RESTAURANT
      // =================================================

      const response = await api.get(
        "/restaurant/my-restaurant"
      );

      if (response.data?.success) {
        loadedRestaurant =
          response.data.restaurant;
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        setError(
          error.response?.data?.message ||
            "Unable to load restaurant status"
        );
      }
    }

    setRestaurant(loadedRestaurant);

    // =================================================
    // LOAD ORDERS
    // Orders only after restaurant is Approved
    // =================================================

    if (loadedRestaurant?.status === "Approved") {
      try {
        const response = await api.get(
          "/order/restaurant"
        );

        console.log(
          "Restaurant Orders Response:",
          response.data
        );

        if (response.data?.success) {
          setOrders(
            response.data.orders || []
          );
        } else {
          setError(
            response.data?.message ||
              "Unable to load restaurant orders"
          );
        }
      } catch (error) {
        console.error(
          "Get Restaurant Orders Error:",
          error.response?.data || error
        );

        setError(
          error.response?.data?.message ||
            "Unable to load dashboard"
        );
      }
    } else {
      setOrders([]);
    }

    setLoading(false);
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchDashboard();
  }, []);

  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // =====================================================
  // ORDER CALCULATIONS
  // =====================================================

  // Active orders
  const pendingOrders = orders.filter(
    (order) =>
      order.orderStatus !== "Delivered" &&
      order.orderStatus !== "Cancelled"
  );

  // Delivered orders
  const deliveredOrders = orders.filter(
    (order) =>
      order.orderStatus === "Delivered"
  );

  // =====================================================
  // RESTAURANT SALES
  //
  // Only Delivered orders are counted.
  // PaymentStatus is NOT required here.
  // =====================================================

  const totalSales = deliveredOrders.reduce(
    (total, order) =>
      total + Number(order.totalAmount || 0),
    0
  );

  // =====================================================
  // MONEY FORMAT
  // =====================================================

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }
    );
  };

  // =====================================================
  // STATUS STYLE
  // =====================================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "Placed":
        return "bg-[#FDF3E0] text-[#8A6412] border border-[#F0DFB0]";

      case "Confirmed":
        return "bg-[#F1E9FB] text-[#6D3FB0] border border-[#DCC9F2]";

      case "Preparing":
        return "bg-[#FDECD2] text-[#B5650F] border border-[#F5D19C]";

      case "Out for Delivery":
        return "bg-[#E6F0FB] text-[#1D5FA8] border border-[#C4DEF5]";

      case "Delivered":
        return "bg-[#EFF6E9] text-[#4A7A2E] border border-[#CFE4BE]";

      case "Cancelled":
        return "bg-[#FDECEA] text-[#B32418] border border-[#F3C6C0]";

      default:
        return "bg-[#F3EEE6] text-[#6B5D4E] border border-[#E4DACB]";
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFCF7]">

        <style>{`
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

          .dot-bounce {
            animation: dotBounce 1.1s ease-in-out infinite;
          }
        `}</style>

        <div className="text-center space-y-3">

          <span className="flex gap-1.5 justify-center">

            <span
              className="dot-bounce w-2.5 h-2.5 rounded-full bg-[#D93425]"
              style={{
                animationDelay: "0s",
              }}
            />

            <span
              className="dot-bounce w-2.5 h-2.5 rounded-full bg-[#D93425]"
              style={{
                animationDelay: "0.15s",
              }}
            />

            <span
              className="dot-bounce w-2.5 h-2.5 rounded-full bg-[#D93425]"
              style={{
                animationDelay: "0.3s",
              }}
            />

          </span>

          <p className="text-[#8A7461] font-medium">
            Loading dashboard...
          </p>

        </div>
      </div>
    );
  }

  // =====================================================
  // DASHBOARD
  // =====================================================

  return (
    <div className="min-h-screen bg-[#FFFCF7]">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Manrope:wght@400;500;600;700&display=swap');

        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes countUp {
          from {
            opacity: 0;
            transform: translateY(6px) scale(0.9);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes badgeSizzle {
          0%, 100% {
            transform: rotate(-3deg) scale(1);
          }

          50% {
            transform: rotate(3deg) scale(1.04);
          }
        }

        .fade-up {
          animation: fadeSlideUp 0.5s
            cubic-bezier(0.22, 1, 0.36, 1)
            both;
        }

        .count-up {
          animation: countUp 0.4s
            cubic-bezier(0.22, 1, 0.36, 1)
            both;
        }

        .badge-sizzle {
          animation: badgeSizzle 3s
            ease-in-out infinite;
        }

        .stat-card,
        .action-card {
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            border-color 0.25s ease;
        }

        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow:
            0 10px 28px
            rgba(217, 52, 37, 0.08);
        }

        .action-card:hover {
          transform: translateY(-4px);
          box-shadow:
            0 12px 30px
            rgba(217, 52, 37, 0.1);
          border-color: #F0D9A8;
        }
      `}</style>

      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav className="bg-white/90 backdrop-blur-sm border-b border-[#F0E4D4]">

        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="badge-sizzle w-10 h-10 rounded-xl bg-gradient-to-br from-[#D93425] to-[#B32418] flex items-center justify-center text-xl shadow-md shadow-[#D93425]/20">
              🍔
            </div>

            <div>

              <h1
                className="text-xl font-extrabold text-[#D93425]"
                style={{
                  fontFamily:
                    "'Baloo 2', sans-serif",
                }}
              >
                Foodie
              </h1>

              <p className="text-xs text-[#8A7461] font-medium">
                Restaurant Panel
              </p>

            </div>

          </div>

          <div className="flex items-center gap-3">

            <span className="hidden md:block text-sm text-[#8A7461]">

              Hi,{" "}

              <span className="font-bold text-[#241608]">
                {user?.name ||
                  "Restaurant Owner"}
              </span>

            </span>

            <button
              onClick={logout}
              className="px-4 py-2 bg-[#FDECEA] text-[#B32418] rounded-lg font-semibold hover:bg-[#FADAD5] transition-colors cursor-pointer"
            >
              Logout
            </button>

          </div>

        </div>

      </nav>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="max-w-7xl mx-auto px-4 py-10">

        {/* HEADER */}

        <div className="mb-8 fade-up">

          <h2
            className="text-3xl font-extrabold text-[#241608]"
            style={{
              fontFamily:
                "'Baloo 2', sans-serif",
            }}
          >
            Restaurant Dashboard
          </h2>

          <p className="text-[#8A7461] mt-1 font-medium">
            Manage your restaurant, menu and
            customer orders.
          </p>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 bg-[#FDECEA] border border-[#F3C6C0] text-[#B32418] p-4 rounded-xl fade-up font-medium">
            {error}
          </div>
        )}

        {/* =================================================
            RESTAURANT STATUS
        ================================================= */}

        {!restaurant ? (

          <div className="mb-8 rounded-2xl border border-[#F0DFB0] bg-[#FDF3E0] p-6 fade-up">

            <h3
              className="text-xl font-bold text-[#241608]"
              style={{
                fontFamily:
                  "'Baloo 2', sans-serif",
              }}
            >
              Register your restaurant
              to get started
            </h3>

            <p className="mt-2 text-[#8A6412]">
              Food management becomes
              available after an admin
              approves your registration.
            </p>

            <button
              onClick={() =>
                navigate(
                  "/restaurant/register"
                )
              }
              className="mt-4 rounded-xl bg-gradient-to-r from-[#D93425] to-[#B32418] px-5 py-3 font-bold text-white hover:opacity-90 active:scale-[0.98] transition-all shadow-md shadow-[#D93425]/20 cursor-pointer"
            >
              Register Restaurant
            </button>

          </div>

        ) : restaurant.status !==
          "Approved" ? (

          <div className="mb-8 rounded-2xl border border-[#F5D19C] bg-[#FDECD2] p-6 fade-up">

            <h3
              className="text-xl font-bold text-[#241608]"
              style={{
                fontFamily:
                  "'Baloo 2', sans-serif",
              }}
            >
              Registration{" "}
              {restaurant.status}
            </h3>

            <p className="mt-2 text-[#8A5A15]">

              {restaurant.status ===
              "Pending"
                ? "An admin must approve your restaurant before you can manage foods or receive orders."
                : restaurant.rejectionReason ||
                  "Please contact an administrator for next steps."}

            </p>

          </div>

        ) : null}

        {/* =================================================
            STATS
        ================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          {/* TOTAL ORDERS */}

          <div
            className="stat-card count-up bg-white rounded-2xl border border-[#F0E4D4] shadow-sm p-6"
            style={{
              animationDelay: "0.05s",
            }}
          >

            <div className="flex items-center justify-between">

              <div>

                <p className="text-[#8A7461] text-sm font-medium">
                  Total Orders
                </p>

                <p
                  className="text-3xl font-extrabold text-[#241608] mt-2"
                  style={{
                    fontFamily:
                      "'Baloo 2', sans-serif",
                  }}
                >
                  {orders.length}
                </p>

              </div>

              <div className="w-12 h-12 rounded-xl bg-[#FDF3E0] flex items-center justify-center text-2xl">
                📦
              </div>

            </div>

          </div>

          {/* ACTIVE ORDERS */}

          <div
            className="stat-card count-up bg-white rounded-2xl border border-[#F0E4D4] shadow-sm p-6"
            style={{
              animationDelay: "0.1s",
            }}
          >

            <div className="flex items-center justify-between">

              <div>

                <p className="text-[#8A7461] text-sm font-medium">
                  Active Orders
                </p>

                <p
                  className="text-3xl font-extrabold text-[#D93425] mt-2"
                  style={{
                    fontFamily:
                      "'Baloo 2', sans-serif",
                  }}
                >
                  {pendingOrders.length}
                </p>

              </div>

              <div className="w-12 h-12 rounded-xl bg-[#FDECEA] flex items-center justify-center text-2xl">
                🔥
              </div>

            </div>

          </div>

          {/* DELIVERED */}

          <div
            className="stat-card count-up bg-white rounded-2xl border border-[#F0E4D4] shadow-sm p-6"
            style={{
              animationDelay: "0.15s",
            }}
          >

            <div className="flex items-center justify-between">

              <div>

                <p className="text-[#8A7461] text-sm font-medium">
                  Delivered
                </p>

                <p
                  className="text-3xl font-extrabold text-[#4A7A2E] mt-2"
                  style={{
                    fontFamily:
                      "'Baloo 2', sans-serif",
                  }}
                >
                  {deliveredOrders.length}
                </p>

              </div>

              <div className="w-12 h-12 rounded-xl bg-[#EFF6E9] flex items-center justify-center text-2xl">
                ✅
              </div>

            </div>

          </div>

          {/* =================================================
              RESTAURANT EARNINGS
          ================================================= */}

          <div
            className="stat-card count-up bg-white rounded-2xl border border-[#F0E4D4] shadow-sm p-6"
            style={{
              animationDelay: "0.2s",
            }}
          >

            <div className="flex items-center justify-between">

              <div>

                <p className="text-[#8A7461] text-sm font-medium">
                  Delivered Sales
                </p>

                <p
                  className="text-3xl font-extrabold text-[#1D5FA8] mt-2"
                  style={{
                    fontFamily:
                      "'Baloo 2', sans-serif",
                  }}
                >
                  ₹{formatMoney(totalSales)}
                </p>

              </div>

              <div className="w-12 h-12 rounded-xl bg-[#E6F0FB] flex items-center justify-center text-2xl">
                💰
              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <div
          className="mt-10 fade-up"
          style={{
            animationDelay: "0.1s",
          }}
        >

          <h3
            className="text-xl font-bold text-[#241608] mb-5"
            style={{
              fontFamily:
                "'Baloo 2', sans-serif",
            }}
          >
            Quick Actions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* MENU */}

            <button
              onClick={() =>
                navigate(
                  "/restaurant/foods"
                )
              }
              className="action-card bg-white border border-[#F0E4D4] shadow-sm rounded-2xl p-6 text-left cursor-pointer"
            >

              <div className="text-4xl mb-4">
                🍽️
              </div>

              <h4
                className="text-lg font-bold text-[#241608]"
                style={{
                  fontFamily:
                    "'Baloo 2', sans-serif",
                }}
              >
                Manage Menu
              </h4>

              <p className="text-[#8A7461] text-sm mt-1">
                Add, edit and remove food
                items.
              </p>

              <p className="text-[#D93425] font-bold mt-4">
                Open Menu →
              </p>

            </button>

            {/* ORDERS */}

            <button
              onClick={() =>
                navigate(
                  "/restaurant/orders"
                )
              }
              className="action-card bg-white border border-[#F0E4D4] shadow-sm rounded-2xl p-6 text-left cursor-pointer"
            >

              <div className="text-4xl mb-4">
                📦
              </div>

              <h4
                className="text-lg font-bold text-[#241608]"
                style={{
                  fontFamily:
                    "'Baloo 2', sans-serif",
                }}
              >
                Manage Orders
              </h4>

              <p className="text-[#8A7461] text-sm mt-1">
                View and update customer
                orders.
              </p>

              <p className="text-[#D93425] font-bold mt-4">
                View Orders →
              </p>

            </button>

            {/* ADD FOOD */}

            <button
              onClick={() =>
                navigate(
                  "/restaurant/foods"
                )
              }
              className="action-card bg-white border border-[#F0E4D4] shadow-sm rounded-2xl p-6 text-left cursor-pointer"
            >

              <div className="text-4xl mb-4">
                ➕
              </div>

              <h4
                className="text-lg font-bold text-[#241608]"
                style={{
                  fontFamily:
                    "'Baloo 2', sans-serif",
                }}
              >
                Add Food
              </h4>

              <p className="text-[#8A7461] text-sm mt-1">
                Add a new food item to your
                menu.
              </p>

              <p className="text-[#D93425] font-bold mt-4">
                Add Food →
              </p>

            </button>

          </div>

        </div>

        {/* =================================================
            RECENT ORDERS
        ================================================= */}

        <div
          className="mt-10 fade-up"
          style={{
            animationDelay: "0.15s",
          }}
        >

          <div className="flex items-center justify-between mb-5">

            <div>

              <h3
                className="text-xl font-bold text-[#241608]"
                style={{
                  fontFamily:
                    "'Baloo 2', sans-serif",
                }}
              >
                Recent Orders
              </h3>

              <p className="text-[#8A7461] text-sm mt-1">
                Latest customer orders.
              </p>

            </div>

            <button
              onClick={() =>
                navigate(
                  "/restaurant/orders"
                )
              }
              className="text-[#D93425] font-bold hover:text-[#B32418] transition-colors cursor-pointer"
            >
              View All →
            </button>

          </div>

          {orders.length === 0 ? (

            <div className="bg-white rounded-2xl border border-[#F0E4D4] p-10 text-center">

              <div className="text-5xl mb-3">
                📦
              </div>

              <p className="font-bold text-[#241608]">
                No orders yet
              </p>

              <p className="text-[#8A7461] text-sm mt-1">
                Customer orders will appear
                here.
              </p>

            </div>

          ) : (

            <div className="bg-white rounded-2xl border border-[#F0E4D4] shadow-sm overflow-hidden">

              <div className="divide-y divide-[#F0E4D4]">

                {orders
                  .slice(0, 5)
                  .map((order) => (

                    <div
                      key={order._id}
                      className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-[#FFFCF7] transition-colors"
                    >

                      <div>

                        <p className="font-bold text-[#241608]">
                          #{order._id}
                        </p>

                        <p className="text-sm text-[#8A7461] mt-1">
                          {order.user?.name ||
                            "Customer"}
                        </p>

                      </div>

                      <div className="flex items-center gap-4">

                        <span
                          className={`px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusStyle(
                            order.orderStatus
                          )}`}
                        >
                          {order.orderStatus}
                        </span>

                        <p className="font-bold text-[#D93425]">
                          ₹
                          {formatMoney(
                            order.totalAmount
                          )}
                        </p>

                      </div>

                    </div>

                  ))}

              </div>

            </div>

          )}

        </div>

      </main>

    </div>
  );
}

export default Dashboard;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function MyOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      const response = await api.get("/order/my-orders");

      if (response.data.success) {
        setOrders(response.data.orders);
        setError("");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load your orders"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(fetchOrders);

    const interval = setInterval(() => {
      fetchOrders();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFCF7]">
        <style>{`
          @keyframes dotBounce {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
            40% { transform: scale(1); opacity: 1; }
          }
          .dot-bounce { animation: dotBounce 1.1s ease-in-out infinite; }
        `}</style>
        <div className="text-center space-y-3">
          <span className="flex gap-1.5 justify-center">
            <span className="dot-bounce w-2.5 h-2.5 rounded-full bg-[#D93425]" style={{ animationDelay: "0s" }} />
            <span className="dot-bounce w-2.5 h-2.5 rounded-full bg-[#D93425]" style={{ animationDelay: "0.15s" }} />
            <span className="dot-bounce w-2.5 h-2.5 rounded-full bg-[#D93425]" style={{ animationDelay: "0.3s" }} />
          </span>
          <p className="text-[#8A7461] font-medium">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFCF7]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Manrope:wght@400;500;600;700&display=swap');

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popCheck {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes livePulse {
          0% { box-shadow: 0 0 0 0 rgba(217,52,37,0.45); }
          70% { box-shadow: 0 0 0 8px rgba(217,52,37,0); }
          100% { box-shadow: 0 0 0 0 rgba(217,52,37,0); }
        }
        @keyframes growLine {
          from { width: 0%; }
        }

        .fade-up { animation: fadeSlideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .pop-check { animation: popCheck 0.35s ease-out both; }
        .live-dot { animation: livePulse 1.8s ease-out infinite; }
        .progress-fill { animation: growLine 0.8s ease-out both; }
        .order-card { transition: box-shadow 0.25s ease, border-color 0.25s ease; }
        .order-card:hover { box-shadow: 0 8px 30px rgba(217,52,37,0.06); border-color: #F0D9A8; }
      `}</style>

      {/* Navbar */}
      <nav className="bg-white/90 backdrop-blur-sm border-b border-[#F0E4D4]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="text-3xl">🍔</span>
            <span
              className="text-2xl font-extrabold text-[#D93425]"
              style={{ fontFamily: "'Baloo 2', sans-serif" }}
            >
              Foodie
            </span>
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 text-[#8A7461] font-semibold hover:text-[#241608] transition-colors cursor-pointer"
            >
              Home
            </button>

            <button
              onClick={() => navigate("/cart")}
              className="px-4 py-2 bg-gradient-to-r from-[#D93425] to-[#B32418] text-white rounded-lg font-semibold hover:opacity-90 active:scale-[0.97] transition-all shadow-md shadow-[#D93425]/20 cursor-pointer"
            >
              🛒 Cart
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 fade-up">
          <div>
            <h1 className="text-3xl font-extrabold text-[#241608]" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
              My Orders
            </h1>
            <p className="text-[#8A7461] mt-1 font-medium">
              Track your food orders and delivery status.
            </p>
          </div>

          {/* Auto refresh indicator */}
          <div className="flex items-center gap-2 text-sm text-[#8A7461] bg-white border border-[#F0E4D4] px-4 py-2 rounded-lg font-medium">
            <span className="relative flex items-center justify-center w-2.5 h-2.5">
              <span className="live-dot absolute w-2.5 h-2.5 bg-[#D93425] rounded-full"></span>
              <span className="w-2 h-2 bg-[#D93425] rounded-full"></span>
            </span>
            Live updates
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-[#FDECEA] border border-[#F3C6C0] text-[#B32418] p-4 rounded-xl fade-up font-medium">
            {error}
          </div>
        )}

        {/* Empty */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#F0E4D4] p-12 text-center fade-up">
            <div className="text-7xl mb-5">📦</div>
            <h2 className="text-2xl font-bold text-[#241608]" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
              No Orders Yet
            </h2>
            <p className="text-[#8A7461] mt-2">
              Your placed orders will appear here.
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 bg-gradient-to-r from-[#D93425] to-[#B32418] hover:opacity-90 active:scale-[0.98] text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-[#D93425]/20 cursor-pointer"
            >
              Order Food
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, orderIdx) => {
              const statuses = [
                "Placed",
                "Confirmed",
                "Preparing",
                "Out for Delivery",
                "Delivered",
              ];
              const currentIndex = statuses.indexOf(order.orderStatus);
              const progressPct =
                currentIndex <= 0
                  ? 0
                  : (currentIndex / (statuses.length - 1)) * 100;

              return (
                <div
                  key={order._id}
                  className="order-card fade-up bg-white rounded-2xl border border-[#F0E4D4] shadow-sm p-6"
                  style={{ animationDelay: `${0.05 * (orderIdx % 6)}s` }}
                >
                  {/* Order Header */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <p className="text-sm text-[#8A7461]">Order ID</p>
                      <h2 className="font-bold text-lg text-[#241608]">
                        #{order._id}
                      </h2>
                      <p className="text-[#8A7461] mt-1 text-sm">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusStyle(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus}
                      </span>

                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold ${
                          order.paymentStatus === "Paid"
                            ? "bg-[#EFF6E9] text-[#4A7A2E] border border-[#CFE4BE]"
                            : "bg-[#FDF3E0] text-[#8A6412] border border-[#F0DFB0]"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Order Progress */}
                  <div className="mt-6 bg-[#FFFCF7] rounded-xl p-5 border border-[#F0E4D4]">
                    <p className="font-semibold text-[#241608] mb-5">
                      Order Status
                    </p>

                    <div className="relative">
                      {/* Track line */}
                      <div className="absolute top-4 left-0 right-0 h-1 bg-[#EAE0D2] rounded-full mx-4" />
                      <div
                        className="progress-fill absolute top-4 left-4 h-1 bg-gradient-to-r from-[#D93425] to-[#E8A93B] rounded-full"
                        style={{ width: `calc(${progressPct}% - ${progressPct > 0 ? '8px' : '0px'})` }}
                      />

                      <div className="relative flex items-center justify-between">
                        {statuses.map((status, index) => {
                          const completed = index <= currentIndex;

                          return (
                            <div
                              key={status}
                              className="flex-1 flex flex-col items-center relative"
                            >
                              <div
                                className={`pop-check w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                                  completed
                                    ? "bg-gradient-to-br from-[#D93425] to-[#B32418] text-white"
                                    : "bg-white border-2 border-[#EAE0D2] text-[#B8A996]"
                                }`}
                              >
                                {completed ? "✓" : index + 1}
                              </div>

                              <p
                                className={`text-xs mt-2 text-center font-medium ${
                                  completed
                                    ? "text-[#B32418] font-semibold"
                                    : "text-[#B8A996]"
                                }`}
                              >
                                {status}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Restaurant */}
                  <div className="mt-6 bg-[#FDF3E0] rounded-xl p-4 border border-[#F0DFB0]">
                    <p className="text-sm text-[#8A6412]">Restaurant</p>
                    <p className="font-bold text-[#241608] mt-1">
                      {order.restaurant?.restaurantName || "Restaurant"}
                    </p>
                    {order.restaurant?.city && (
                      <p className="text-sm text-[#8A6412] mt-1">
                        📍 {order.restaurant.city}
                      </p>
                    )}
                  </div>

                  {/* Items */}
                  <div className="mt-6">
                    <h3 className="font-bold text-[#241608] mb-4">
                      Order Items
                    </h3>

                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center border-b border-[#F0E4D4] pb-3"
                        >
                          <div>
                            <p className="font-medium text-[#241608]">
                              {item.name}
                            </p>
                            <p className="text-sm text-[#8A7461]">
                              {item.quantity} × ₹{item.price}
                            </p>
                          </div>
                          <p className="font-semibold text-[#241608]">
                            ₹{item.subtotal}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="mt-6 bg-[#FFFCF7] rounded-xl p-4 border border-[#F0E4D4]">
                    <p className="text-sm text-[#8A7461]">Delivery Address</p>
                    <p className="font-medium text-[#241608] mt-1">
                      📍 {order.deliveryAddress}
                    </p>

                    {order.deliveryLocation?.latitude !== undefined && (
                      <div className="mt-3 text-sm text-[#8A7461]">
                        <p>Latitude: {order.deliveryLocation.latitude}</p>
                        <p>Longitude: {order.deliveryLocation.longitude}</p>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${order.deliveryLocation.latitude},${order.deliveryLocation.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-block font-semibold text-[#D93425] hover:text-[#B32418] transition-colors"
                        >
                          📍 View on Map
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-6 pt-5 border-t border-[#F0E4D4] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="text-sm text-[#8A7461]">Total Amount</p>
                      <p className="text-2xl font-extrabold text-[#D93425]" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                        ₹{order.totalAmount}
                      </p>
                    </div>

                    {order.orderStatus === "Delivered" && (
                      <span className="pop-check bg-[#EFF6E9] text-[#4A7A2E] border border-[#CFE4BE] px-5 py-3 rounded-xl font-semibold">
                        ✓ Delivered
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyOrders;
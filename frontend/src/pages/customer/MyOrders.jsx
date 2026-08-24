import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function MyOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());

  // ============================================================
  // FETCH ORDERS
  // ============================================================

  const fetchOrders = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      }

      const response = await api.get("/order/my-orders");

      if (response.data?.success) {
        setOrders(response.data.orders || []);
        setError("");
      }
    } catch (error) {
      console.error(
        "My Orders Error:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load your orders"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ============================================================
  // INITIAL LOAD + API REFRESH
  // ============================================================

  useEffect(() => {
    fetchOrders(true);

    const apiInterval = setInterval(() => {
      fetchOrders(false);
    }, 5000);

    return () => {
      clearInterval(apiInterval);
    };
  }, []);

  // ============================================================
  // LIVE CLOCK
  //
  // This updates the elapsed delivery time every second.
  // ============================================================

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      clearInterval(clockInterval);
    };
  }, []);

  // ============================================================
  // MONEY FORMAT
  // ============================================================

  const money = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  // ============================================================
  // DATE / TIME FORMAT
  // ============================================================

  const formatDateTime = (value) => {
    if (!value) {
      return "Not available";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // ============================================================
  // SHORT TIME
  // ============================================================

  const formatTime = (value) => {
    if (!value) {
      return "--:--";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "--:--";
    }

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // ============================================================
  // DURATION FORMAT
  // ============================================================

  const formatDuration = (milliseconds) => {
    if (!milliseconds || milliseconds < 0) {
      return "0 min";
    }

    const totalSeconds = Math.floor(
      milliseconds / 1000
    );

    const totalMinutes = Math.floor(
      totalSeconds / 60
    );

    const seconds = totalSeconds % 60;

    const hours = Math.floor(
      totalMinutes / 60
    );

    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }

    return `${seconds}s`;
  };

  // ============================================================
  // TOTAL ORDER / DELIVERY TIME
  //
  // If delivered:
  // createdAt -> deliveredAt
  //
  // If still active:
  // createdAt -> current time
  // ============================================================

  const getOrderElapsedTime = (order) => {
    if (!order?.createdAt) {
      return "0 min";
    }

    const start = new Date(
      order.createdAt
    ).getTime();

    if (Number.isNaN(start)) {
      return "0 min";
    }

    const end = order.deliveredAt
      ? new Date(order.deliveredAt).getTime()
      : now;

    if (Number.isNaN(end)) {
      return "0 min";
    }

    return formatDuration(
      Math.max(0, end - start)
    );
  };

  // ============================================================
  // RIDER DELIVERY TIME
  //
  // Rider accepted -> Delivered
  // ============================================================

  const getRiderDeliveryTime = (order) => {
    if (!order?.riderAcceptedAt) {
      return "Not started";
    }

    const start = new Date(
      order.riderAcceptedAt
    ).getTime();

    if (Number.isNaN(start)) {
      return "Not available";
    }

    const end = order.deliveredAt
      ? new Date(order.deliveredAt).getTime()
      : now;

    if (Number.isNaN(end)) {
      return "Not available";
    }

    return formatDuration(
      Math.max(0, end - start)
    );
  };

  // ============================================================
  // STATUS STYLE
  // ============================================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "Placed":
        return "bg-[#FDF3E0] text-[#8A6412] border border-[#F0DFB0]";

      case "Confirmed":
        return "bg-[#F1E9FB] text-[#6D3FB0] border border-[#DCC9F2]";

      case "Preparing":
        return "bg-[#FDECD2] text-[#B5650F] border border-[#F5D19C]";

      case "Ready for Pickup":
        return "bg-[#FFF1DD] text-[#B5650F] border border-[#F0D09A]";

      case "Searching Rider":
        return "bg-[#FFF1DD] text-[#B5650F] border border-[#F0D09A]";

      case "Rider Assigned":
        return "bg-[#EAF2FF] text-[#2563A6] border border-[#C7DCF7]";

      case "Picked Up":
        return "bg-[#F1E9FB] text-[#6D3FB0] border border-[#DCC9F2]";

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

  // ============================================================
  // PAYMENT STYLE
  // ============================================================

  const getPaymentStyle = (status) => {
    if (status === "Paid") {
      return "bg-[#EFF6E9] text-[#4A7A2E] border border-[#CFE4BE]";
    }

    return "bg-[#FDF3E0] text-[#8A6412] border border-[#F0DFB0]";
  };

  // ============================================================
  // DELIVERY STATUS
  //
  // Use deliveryStatus first because rider changes this field.
  // ============================================================

  const getCurrentDeliveryStatus = (order) => {
    return (
      order?.deliveryStatus ||
      order?.orderStatus ||
      "Placed"
    );
  };

  // ============================================================
  // TIMELINE
  // ============================================================

  const getTimeline = (order) => {
    const deliveryStatus =
      getCurrentDeliveryStatus(order);

    const placed = Boolean(
      order?.createdAt
    );

    const accepted = Boolean(
      order?.riderAcceptedAt ||
        deliveryStatus === "Rider Assigned" ||
        deliveryStatus === "Picked Up" ||
        deliveryStatus === "Out for Delivery" ||
        deliveryStatus === "Delivered"
    );

    const pickedUp = Boolean(
      order?.pickedUpAt ||
        deliveryStatus === "Picked Up" ||
        deliveryStatus === "Out for Delivery" ||
        deliveryStatus === "Delivered"
    );

    const outForDelivery = Boolean(
      order?.outForDeliveryAt ||
        deliveryStatus === "Out for Delivery" ||
        deliveryStatus === "Delivered"
    );

    const delivered = Boolean(
      order?.deliveredAt ||
        deliveryStatus === "Delivered"
    );

    return {
      placed,
      accepted,
      pickedUp,
      outForDelivery,
      delivered,
    };
  };

  // ============================================================
  // TIMELINE CURRENT STEP
  // ============================================================

  const getTimelineStep = (order) => {
    const status =
      getCurrentDeliveryStatus(order);

    switch (status) {
      case "Placed":
        return 0;

      case "Confirmed":
        return 1;

      case "Preparing":
        return 2;

      case "Ready for Pickup":
        return 2;

      case "Searching Rider":
        return 2;

      case "Rider Assigned":
        return 3;

      case "Picked Up":
        return 4;

      case "Out for Delivery":
        return 5;

      case "Delivered":
        return 6;

      case "Cancelled":
        return -1;

      default:
        return 0;
    }
  };

  // ============================================================
  // TIMELINE ITEM
  // ============================================================

  const TimelineItem = ({
    icon,
    title,
    time,
    active,
    current,
    last = false,
  }) => {
    return (
      <div className="relative flex gap-4">

        {/* LINE + ICON */}

        <div className="flex flex-col items-center">

          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold shrink-0 transition-all ${
              active
                ? "bg-gradient-to-br from-[#D93425] to-[#B32418] text-white shadow-md shadow-[#D93425]/20"
                : "bg-[#F3EEE6] text-[#B8A996] border border-[#E4DACB]"
            } ${
              current
                ? "ring-4 ring-[#D93425]/10"
                : ""
            }`}
          >
            {active ? "✓" : icon}
          </div>

          {!last && (
            <div
              className={`w-0.5 min-h-12 ${
                active
                  ? "bg-[#E8A93B]"
                  : "bg-[#E4DACB]"
              }`}
            />
          )}

        </div>

        {/* CONTENT */}

        <div className="pt-1 pb-5">

          <div className="flex flex-wrap items-center gap-2">

            <p
              className={`font-bold ${
                active
                  ? "text-[#241608]"
                  : "text-[#B8A996]"
              }`}
            >
              {title}
            </p>

            {current && (
              <span className="px-2 py-0.5 rounded-full bg-[#FDECEA] text-[#B32418] text-[10px] font-bold">
                CURRENT
              </span>
            )}

          </div>

          <p
            className={`text-sm mt-1 ${
              active
                ? "text-[#8A7461]"
                : "text-[#B8A996]"
            }`}
          >
            {time}
          </p>

        </div>

      </div>
    );
  };

  // ============================================================
  // LOADING
  // ============================================================

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
            Loading your orders...
          </p>

        </div>

      </div>
    );
  }

  // ============================================================
  // MAIN
  // ============================================================

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

        @keyframes popCheck {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }

          60% {
            transform: scale(1.2);
            opacity: 1;
          }

          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes livePulse {
          0% {
            box-shadow: 0 0 0 0 rgba(217,52,37,0.45);
          }

          70% {
            box-shadow: 0 0 0 8px rgba(217,52,37,0);
          }

          100% {
            box-shadow: 0 0 0 0 rgba(217,52,37,0);
          }
        }

        .fade-up {
          animation: fadeSlideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .pop-check {
          animation: popCheck 0.35s ease-out both;
        }

        .live-dot {
          animation: livePulse 1.8s ease-out infinite;
        }

        .order-card {
          transition:
            box-shadow 0.25s ease,
            border-color 0.25s ease;
        }

        .order-card:hover {
          box-shadow: 0 8px 30px rgba(217,52,37,0.06);
          border-color: #F0D9A8;
        }
      `}</style>

      {/* ======================================================
          NAVBAR
      ====================================================== */}

      <nav className="bg-white/90 backdrop-blur-sm border-b border-[#F0E4D4] sticky top-0 z-50">

        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="text-3xl">
              🍔
            </span>

            <span
              className="text-2xl font-extrabold text-[#D93425]"
              style={{
                fontFamily:
                  "'Baloo 2', sans-serif",
              }}
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

      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="max-w-5xl mx-auto px-4 py-10">

        {/* HEADER */}

        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 fade-up">

          <div>

            <h1
              className="text-3xl font-extrabold text-[#241608]"
              style={{
                fontFamily:
                  "'Baloo 2', sans-serif",
              }}
            >
              My Orders
            </h1>

            <p className="text-[#8A7461] mt-1 font-medium">
              Track your food orders and delivery timing.
            </p>

          </div>

          {/* LIVE UPDATE */}

          <div className="flex items-center gap-3">

            <div className="flex items-center gap-2 text-sm text-[#8A7461] bg-white border border-[#F0E4D4] px-4 py-2 rounded-lg font-medium">

              <span className="relative flex items-center justify-center w-2.5 h-2.5">

                <span className="live-dot absolute w-2.5 h-2.5 bg-[#D93425] rounded-full" />

                <span className="w-2 h-2 bg-[#D93425] rounded-full" />

              </span>

              Live updates

            </div>

            <button
              onClick={() => fetchOrders(true)}
              disabled={refreshing}
              className="px-4 py-2 bg-white border border-[#F0E4D4] rounded-lg text-[#8A7461] font-semibold hover:bg-[#FFFCF7] disabled:opacity-50"
            >
              {refreshing
                ? "Refreshing..."
                : "🔄 Refresh"}
            </button>

          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 bg-[#FDECEA] border border-[#F3C6C0] text-[#B32418] p-4 rounded-xl fade-up font-medium">
            {error}
          </div>
        )}

        {/* EMPTY */}

        {orders.length === 0 ? (

          <div className="bg-white rounded-2xl border border-[#F0E4D4] p-12 text-center fade-up">

            <div className="text-7xl mb-5">
              📦
            </div>

            <h2
              className="text-2xl font-bold text-[#241608]"
              style={{
                fontFamily:
                  "'Baloo 2', sans-serif",
              }}
            >
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

              const deliveryStatus =
                getCurrentDeliveryStatus(
                  order
                );

              const timeline =
                getTimeline(order);

              const timelineStep =
                getTimelineStep(order);

              const isDelivered =
                deliveryStatus ===
                  "Delivered" ||
                Boolean(order.deliveredAt);

              const isCancelled =
                deliveryStatus ===
                  "Cancelled" ||
                order.orderStatus ===
                  "Cancelled";

              return (

                <div
                  key={order._id}
                  className="order-card fade-up bg-white rounded-2xl border border-[#F0E4D4] shadow-sm p-6"
                  style={{
                    animationDelay: `${
                      0.05 *
                      (orderIdx % 6)
                    }s`,
                  }}
                >

                  {/* ==================================================
                      ORDER HEADER
                  ================================================== */}

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                    <div>

                      <p className="text-sm text-[#8A7461]">
                        Order ID
                      </p>

                      <h2 className="font-bold text-lg text-[#241608]">
                        #
                        {order._id}
                      </h2>

                      <p className="text-[#8A7461] mt-1 text-sm">
                        🕐 Placed:{" "}
                        {formatDateTime(
                          order.createdAt
                        )}
                      </p>

                    </div>

                    <div className="flex flex-wrap gap-3">

                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusStyle(
                          deliveryStatus
                        )}`}
                      >
                        {deliveryStatus}
                      </span>

                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold ${getPaymentStyle(
                          order.paymentStatus
                        )}`}
                      >
                        {order.paymentStatus ||
                          "Pending"}
                      </span>

                    </div>

                  </div>

                  {/* ==================================================
                      LIVE TIMER
                  ================================================== */}

                  {!isCancelled && (

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">

                      {/* TOTAL TIME */}

                      <div className="bg-[#FFF7EA] border border-[#F0DFB0] rounded-xl p-4">

                        <p className="text-xs text-[#8A6412] font-semibold">
                          ⏱️ TOTAL ORDER TIME
                        </p>

                        <p className="text-2xl font-extrabold text-[#8A6412] mt-2">
                          {getOrderElapsedTime(
                            order
                          )}
                        </p>

                        <p className="text-xs text-[#8A7461] mt-1">
                          {isDelivered
                            ? "Order completed"
                            : "Live timer"}
                        </p>

                      </div>

                      {/* RIDER TIME */}

                      <div className="bg-[#EEF5FF] border border-[#C7DCF7] rounded-xl p-4">

                        <p className="text-xs text-[#2563A6] font-semibold">
                          🛵 RIDER DELIVERY TIME
                        </p>

                        <p className="text-2xl font-extrabold text-[#2563A6] mt-2">
                          {getRiderDeliveryTime(
                            order
                          )}
                        </p>

                        <p className="text-xs text-[#6B7F96] mt-1">
                          From rider acceptance
                        </p>

                      </div>

                      {/* CURRENT STATUS */}

                      <div className="bg-[#EFF6E9] border border-[#CFE4BE] rounded-xl p-4">

                        <p className="text-xs text-[#4A7A2E] font-semibold">
                          📍 CURRENT STATUS
                        </p>

                        <p className="text-xl font-extrabold text-[#4A7A2E] mt-2">
                          {deliveryStatus}
                        </p>

                        <p className="text-xs text-[#6A8060] mt-1">
                          {isDelivered
                            ? "Delivered successfully"
                            : "Updating live"}
                        </p>

                      </div>

                    </div>

                  )}

                  {/* ==================================================
                      DELIVERY TIMELINE
                  ================================================== */}

                  <div className="mt-6 bg-[#FFFCF7] rounded-2xl p-5 border border-[#F0E4D4]">

                    <div className="flex items-center justify-between mb-5">

                      <div>

                        <h3 className="font-bold text-lg text-[#241608]">
                          Delivery Timeline
                        </h3>

                        <p className="text-xs text-[#8A7461] mt-1">
                          Exact order and rider timing
                        </p>

                      </div>

                      <div className="text-2xl">
                        🕐
                      </div>

                    </div>

                    {isCancelled ? (

                      <div className="bg-[#FDECEA] border border-[#F3C6C0] rounded-xl p-4">

                        <p className="font-bold text-[#B32418]">
                          ❌ Order Cancelled
                        </p>

                        <p className="text-sm text-[#8A7461] mt-1">
                          This order was cancelled and delivery tracking has stopped.
                        </p>

                      </div>

                    ) : (

                      <div>

                        {/* ORDER PLACED */}

                        <TimelineItem
                          icon="📝"
                          title="Order Placed"
                          time={
                            order.createdAt
                              ? formatDateTime(
                                  order.createdAt
                                )
                              : "Not available"
                          }
                          active={
                            timeline.placed
                          }
                          current={
                            timelineStep ===
                            0
                          }
                        />

                        {/* CONFIRMED */}

                        <TimelineItem
                          icon="✓"
                          title="Restaurant Confirmed"
                          time={
                            order.confirmedAt
                              ? formatDateTime(
                                  order.confirmedAt
                                )
                              : order.orderStatus ===
                                  "Confirmed" ||
                                order.orderStatus ===
                                  "Preparing" ||
                                order.orderStatus ===
                                  "Ready for Pickup" ||
                                timeline.accepted
                              ? "Confirmed"
                              : "Waiting"
                          }
                          active={
                            order.orderStatus ===
                              "Confirmed" ||
                            order.orderStatus ===
                              "Preparing" ||
                            order.orderStatus ===
                              "Ready for Pickup" ||
                            timeline.accepted
                          }
                          current={
                            timelineStep ===
                            1
                          }
                        />

                        {/* PREPARING */}

                        <TimelineItem
                          icon="👨‍🍳"
                          title="Preparing"
                          time={
                            order.preparingAt
                              ? formatDateTime(
                                  order.preparingAt
                                )
                              : order.orderStatus ===
                                  "Preparing" ||
                                order.orderStatus ===
                                  "Ready for Pickup" ||
                                timeline.accepted
                              ? "In progress"
                              : "Waiting"
                          }
                          active={
                            order.orderStatus ===
                              "Preparing" ||
                            order.orderStatus ===
                              "Ready for Pickup" ||
                            timeline.accepted
                          }
                          current={
                            timelineStep ===
                            2
                          }
                        />

                        {/* RIDER ACCEPTED */}

                        <TimelineItem
                          icon="🛵"
                          title="Rider Accepted"
                          time={
                            order.riderAcceptedAt
                              ? formatDateTime(
                                  order.riderAcceptedAt
                                )
                              : "Waiting for rider"
                          }
                          active={
                            timeline.accepted
                          }
                          current={
                            timelineStep ===
                            3
                          }
                        />

                        {/* PICKED UP */}

                        <TimelineItem
                          icon="📦"
                          title="Picked Up"
                          time={
                            order.pickedUpAt
                              ? formatDateTime(
                                  order.pickedUpAt
                                )
                              : "Waiting for pickup"
                          }
                          active={
                            timeline.pickedUp
                          }
                          current={
                            timelineStep ===
                            4
                          }
                        />

                        {/* OUT FOR DELIVERY */}

                        <TimelineItem
                          icon="🚚"
                          title="Out for Delivery"
                          time={
                            order.outForDeliveryAt
                              ? formatDateTime(
                                  order.outForDeliveryAt
                                )
                              : "Waiting"
                          }
                          active={
                            timeline.outForDelivery
                          }
                          current={
                            timelineStep ===
                            5
                          }
                        />

                        {/* DELIVERED */}

                        <TimelineItem
                          icon="✅"
                          title="Delivered"
                          time={
                            order.deliveredAt
                              ? formatDateTime(
                                  order.deliveredAt
                                )
                              : "Waiting"
                          }
                          active={
                            timeline.delivered
                          }
                          current={
                            timelineStep ===
                            6
                          }
                          last
                        />

                      </div>

                    )}

                  </div>

                  {/* ==================================================
                      RIDER DETAILS
                  ================================================== */}

                  {order.rider && (

                    <div className="mt-6 bg-[#EEF5FF] border border-[#C7DCF7] rounded-xl p-5">

                      <div className="flex items-center justify-between gap-4">

                        <div>

                          <p className="text-xs text-[#2563A6] font-bold">
                            🛵 YOUR DELIVERY PARTNER
                          </p>

                          <p className="text-xl font-bold text-[#241608] mt-2">
                            {order.rider.name ||
                              "Delivery Rider"}
                          </p>

                          {order.rider.phone && (
                            <p className="text-sm text-[#6B7F96] mt-1">
                              📞{" "}
                              {order.rider.phone}
                            </p>
                          )}

                        </div>

                        <div className="w-14 h-14 rounded-full bg-white border border-[#C7DCF7] flex items-center justify-center text-3xl">
                          🛵
                        </div>

                      </div>

                    </div>

                  )}

                  {/* ==================================================
                      RESTAURANT
                  ================================================== */}

                  <div className="mt-6 bg-[#FDF3E0] rounded-xl p-4 border border-[#F0DFB0]">

                    <p className="text-sm text-[#8A6412]">
                      Restaurant
                    </p>

                    <p className="font-bold text-[#241608] mt-1">
                      {order.restaurant
                        ?.restaurantName ||
                        "Restaurant"}
                    </p>

                    {order.restaurant
                      ?.city && (
                      <p className="text-sm text-[#8A6412] mt-1">
                        📍{" "}
                        {order.restaurant.city}
                      </p>
                    )}

                    {order.restaurant
                      ?.address && (
                      <p className="text-sm text-[#8A7461] mt-1">
                        {order.restaurant.address}
                      </p>
                    )}

                  </div>

                  {/* ==================================================
                      PICKUP + DELIVERY
                  ================================================== */}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">

                    {/* PICKUP */}

                    <div className="bg-[#FFF4E5] rounded-xl p-4 border border-[#F0D9A8]">

                      <p className="text-xs text-[#B5650F] font-bold">
                        🏪 PICKUP LOCATION
                      </p>

                      <p className="font-medium text-[#241608] mt-2">
                        {order.pickupLocation
                          ?.address ||
                          order.restaurant
                            ?.address ||
                          "-"}
                      </p>

                      {order.pickupLocation
                        ?.latitude !==
                        undefined &&
                        order.pickupLocation
                          ?.longitude !==
                          undefined && (

                          <p className="text-xs text-[#8A7461] mt-2">
                            📍{" "}
                            {Number(
                              order.pickupLocation
                                .latitude
                            ).toFixed(5)}
                            ,{" "}
                            {Number(
                              order.pickupLocation
                                .longitude
                            ).toFixed(5)}
                          </p>

                        )}

                    </div>

                    {/* DELIVERY */}

                    <div className="bg-[#EFF6E9] rounded-xl p-4 border border-[#CFE4BE]">

                      <p className="text-xs text-[#4A7A2E] font-bold">
                        📍 DELIVERY LOCATION
                      </p>

                      <p className="font-medium text-[#241608] mt-2">
                        {order.deliveryLocation
                          ?.address ||
                          order.deliveryAddress ||
                          "-"}
                      </p>

                      {order.deliveryLocation
                        ?.latitude !==
                        undefined &&
                        order.deliveryLocation
                          ?.longitude !==
                        undefined && (

                          <div className="mt-2">

                            <p className="text-xs text-[#6A8060]">
                              📍{" "}
                              {Number(
                                order.deliveryLocation
                                  .latitude
                              ).toFixed(5)}
                              ,{" "}
                              {Number(
                                order.deliveryLocation
                                  .longitude
                              ).toFixed(5)}
                            </p>

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

                  </div>

                  {/* ==================================================
                      ORDER ITEMS
                  ================================================== */}

                  <div className="mt-6">

                    <h3 className="font-bold text-[#241608] mb-4">
                      Order Items
                    </h3>

                    <div className="space-y-3">

                      {(order.items || []).map(
                        (item, index) => (

                          <div
                            key={index}
                            className="flex justify-between items-center border-b border-[#F0E4D4] pb-3"
                          >

                            <div>

                              <p className="font-medium text-[#241608]">
                                {item.name}
                              </p>

                              <p className="text-sm text-[#8A7461]">
                                {item.quantity} ×{" "}
                                {money(
                                  item.price
                                )}
                              </p>

                            </div>

                            <p className="font-semibold text-[#241608]">
                              {money(
                                item.subtotal
                              )}
                            </p>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                  {/* ==================================================
                      ORDER INFORMATION
                  ================================================== */}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">

                    {/* DISTANCE */}

                    <div className="bg-[#FFFCF7] border border-[#F0E4D4] rounded-xl p-4">

                      <p className="text-xs text-[#8A7461]">
                        Distance
                      </p>

                      <p className="font-bold text-[#241608] mt-1">
                        {Number(
                          order.distanceKm || 0
                        ).toFixed(1)}{" "}
                        km
                      </p>

                    </div>

                    {/* FOOD */}

                    <div className="bg-[#FFFCF7] border border-[#F0E4D4] rounded-xl p-4">

                      <p className="text-xs text-[#8A7461]">
                        Food Amount
                      </p>

                      <p className="font-bold text-[#241608] mt-1">
                        {money(
                          order.totalAmount
                        )}
                      </p>

                    </div>

                    {/* DELIVERY FEE */}

                    <div className="bg-[#FFFCF7] border border-[#F0E4D4] rounded-xl p-4">

                      <p className="text-xs text-[#8A7461]">
                        Delivery Fee
                      </p>

                      <p className="font-bold text-[#241608] mt-1">
                        {money(
                          order.deliveryFee
                        )}
                      </p>

                    </div>

                    {/* PAYMENT */}

                    <div className="bg-[#FFFCF7] border border-[#F0E4D4] rounded-xl p-4">

                      <p className="text-xs text-[#8A7461]">
                        Payment
                      </p>

                      <p className="font-bold text-[#241608] mt-1">
                        {order.paymentMethod ||
                          "-"}
                      </p>

                    </div>

                  </div>

                  {/* ==================================================
                      TIMING SUMMARY
                  ================================================== */}

                  {!isCancelled && (

                    <div className="mt-6 bg-[#241608] rounded-2xl p-5 text-white">

                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                        <div>

                          <p className="text-white/60 text-xs font-semibold">
                            DELIVERY TIMING
                          </p>

                          <p className="text-3xl font-extrabold mt-1">
                            {getOrderElapsedTime(
                              order
                            )}
                          </p>

                          <p className="text-white/60 text-sm mt-1">
                            {isDelivered
                              ? "Total time from order placed to delivered"
                              : "Live time since order was placed"}
                          </p>

                        </div>

                        <div className="grid grid-cols-2 gap-4">

                          <div className="bg-white/10 rounded-xl p-4 min-w-[140px]">

                            <p className="text-xs text-white/60">
                              Rider Accepted
                            </p>

                            <p className="font-bold mt-1">
                              {formatTime(
                                order.riderAcceptedAt
                              )}
                            </p>

                          </div>

                          <div className="bg-white/10 rounded-xl p-4 min-w-[140px]">

                            <p className="text-xs text-white/60">
                              Delivered
                            </p>

                            <p className="font-bold mt-1">
                              {order.deliveredAt
                                ? formatTime(
                                    order.deliveredAt
                                  )
                                : "--:--"}
                            </p>

                          </div>

                        </div>

                      </div>

                    </div>

                  )}

                  {/* ==================================================
                      TOTAL
                  ================================================== */}

                  <div className="mt-6 pt-5 border-t border-[#F0E4D4] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                    <div>

                      <p className="text-sm text-[#8A7461]">
                        Final Amount
                      </p>

                      <p
                        className="text-3xl font-extrabold text-[#D93425]"
                        style={{
                          fontFamily:
                            "'Baloo 2', sans-serif",
                        }}
                      >
                        {money(
                          order.finalAmount ??
                            order.totalAmount
                        )}
                      </p>

                    </div>

                    <div className="flex flex-wrap gap-3">

                      {isDelivered && (

                        <span className="pop-check bg-[#EFF6E9] text-[#4A7A2E] border border-[#CFE4BE] px-5 py-3 rounded-xl font-semibold">
                          ✓ Delivered
                        </span>

                      )}

                      {isCancelled && (

                        <span className="bg-[#FDECEA] text-[#B32418] border border-[#F3C6C0] px-5 py-3 rounded-xl font-semibold">
                          ✕ Cancelled
                        </span>

                      )}

                    </div>

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
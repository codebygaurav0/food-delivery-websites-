import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const [availableOrders, setAvailableOrders] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);

  const [earnings, setEarnings] = useState({
    totalDeliveries: 0,
    totalEarnings: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionId, setActionId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Used to refresh elapsed delivery time every second
  const [currentTime, setCurrentTime] = useState(Date.now());

  const knownAvailableOrderIds = useRef(new Set());
  const firstLoad = useRef(true);

  // =====================================================
  // MONEY FORMAT
  // =====================================================

  const money = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  // =====================================================
  // DATE / TIME FORMAT
  // =====================================================

  const formatDateTime = (value) => {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =====================================================
  // TIME ONLY
  // =====================================================

  const formatTime = (value) => {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =====================================================
  // ELAPSED DELIVERY TIME
  // =====================================================

  const getElapsedDeliveryTime = (value) => {
    if (!value) {
      return "-";
    }

    const start = new Date(value);

    if (Number.isNaN(start.getTime())) {
      return "-";
    }

    const diffMs =
      currentTime - start.getTime();

    if (diffMs < 0) {
      return "0 min";
    }

    const totalMinutes = Math.floor(
      diffMs / (1000 * 60)
    );

    const hours = Math.floor(
      totalMinutes / 60
    );

    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${minutes} min`;
  };

  // =====================================================
  // LIVE CLOCK
  // Updates elapsed delivery time every second
  // =====================================================

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // =====================================================
  // FETCH RIDER DATA
  // =====================================================

  const fetchRiderData = async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      // =================================================
      // ONE API FAILURE SHOULD NOT BREAK DASHBOARD
      // =================================================

      const results = await Promise.allSettled([
        api.get("/order/rider/available"),
        api.get("/order/rider/orders"),
        api.get("/order/rider/earnings"),
      ]);

      const [
        availableResult,
        activeResult,
        earningsResult,
      ] = results;

      // =================================================
      // AVAILABLE ORDERS
      // =================================================

      let newAvailableOrders = [];

      if (availableResult.status === "fulfilled") {
        newAvailableOrders =
          availableResult.value?.data?.orders || [];
      } else {
        console.error(
          "Rider Available Orders Error:",
          availableResult.reason?.response?.data ||
            availableResult.reason
        );
      }

      // =================================================
      // ACTIVE ORDERS
      // =================================================

      let newActiveOrders = [];

      if (activeResult.status === "fulfilled") {
        newActiveOrders =
          activeResult.value?.data?.orders || [];
      } else {
        console.error(
          "Rider Active Orders Error:",
          activeResult.reason?.response?.data ||
            activeResult.reason
        );
      }

      // =================================================
      // EARNINGS
      // =================================================

      let newEarnings = {
        totalDeliveries: 0,
        totalEarnings: 0,
      };

      if (earningsResult.status === "fulfilled") {
        const apiEarnings =
          earningsResult.value?.data?.earnings;

        if (apiEarnings) {
          newEarnings = {
            totalDeliveries: Number(
              apiEarnings.totalDeliveries || 0
            ),
            totalEarnings: Number(
              apiEarnings.totalEarnings || 0
            ),
          };
        }
      } else {
        console.error(
          "Rider Earnings API Error:",
          earningsResult.reason?.response?.data ||
            earningsResult.reason
        );
      }

      // =================================================
      // DEBUG
      // =================================================

      console.log(
        "================================="
      );

      console.log(
        "RIDER DASHBOARD DATA"
      );

      console.log(
        "Available Orders:",
        newAvailableOrders.length
      );

      console.log(
        "Active Orders:",
        newActiveOrders.length
      );

      console.log(
        "Completed Deliveries:",
        newEarnings.totalDeliveries
      );

      console.log(
        "Total Earnings:",
        newEarnings.totalEarnings
      );

      console.log(
        "================================="
      );

      // =================================================
      // DEBUG ACTIVE ORDER TIMES
      // =================================================

      newActiveOrders.forEach((order) => {
        console.log(
          "Order Timeline:",
          {
            orderId:
              order?._id?.slice(-6),

            deliveryStatus:
              order?.deliveryStatus,

            createdAt:
              order?.createdAt,

            riderAcceptedAt:
              order?.riderAcceptedAt,

            pickedUpAt:
              order?.pickedUpAt,

            outForDeliveryAt:
              order?.outForDeliveryAt,

            deliveredAt:
              order?.deliveredAt,
          }
        );
      });

      // =================================================
      // DETECT NEW DELIVERY
      // =================================================

      const currentIds = new Set(
        newAvailableOrders
          .map((order) => order?._id)
          .filter(Boolean)
      );

      if (!firstLoad.current) {
        const newlyAvailable =
          newAvailableOrders.filter(
            (order) =>
              order?._id &&
              !knownAvailableOrderIds.current.has(
                order._id
              )
          );

        if (newlyAvailable.length > 0) {
          const firstOrder =
            newlyAvailable[0];

          const orderShortId =
            firstOrder?._id?.slice(-6) ||
            "------";

          setSuccess(
            `🛵 New delivery request! Order #${orderShortId} is ready for pickup.`
          );

          // =================================================
          // BROWSER NOTIFICATION
          // =================================================

          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            try {
              new Notification(
                "🛵 New Foodie Delivery",
                {
                  body: `Order #${orderShortId} is ready for pickup.`,
                }
              );
            } catch (
              notificationError
            ) {
              console.error(
                "Notification Error:",
                notificationError
              );
            }
          }

          // =================================================
          // NOTIFICATION SOUND
          // =================================================

          try {
            const audio = new Audio(
              "/notification.mp3"
            );

            audio.volume = 0.7;

            audio.play().catch(() => {});
          } catch {
            // Ignore audio errors
          }

          setTimeout(() => {
            setSuccess("");
          }, 5000);
        }
      }

      knownAvailableOrderIds.current =
        currentIds;

      firstLoad.current = false;

      // =================================================
      // UPDATE STATE
      // =================================================

      setAvailableOrders(
        newAvailableOrders
      );

      setActiveOrders(
        newActiveOrders
      );

      setEarnings(newEarnings);
    } catch (error) {
      console.error(
        "Rider Dashboard Error:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load rider dashboard"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =====================================================
  // INITIAL LOAD + AUTO REFRESH
  // =====================================================

  useEffect(() => {
    fetchRiderData(true);

    // =================================================
    // BROWSER NOTIFICATION PERMISSION
    // =================================================

    if (
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission().catch(
        () => {}
      );
    }

    // =================================================
    // REFRESH EVERY 5 SECONDS
    // =================================================

    const interval = setInterval(() => {
      fetchRiderData(false);
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // =====================================================
  // ACCEPT ORDER
  // POST /order/:id/accept
  // =====================================================

  const acceptOrder = async (orderId) => {
    try {
      setActionId(orderId);
      setError("");
      setSuccess("");

      console.log(
        "Accepting Rider Order:",
        orderId
      );

      const response = await api.post(
        `/order/${orderId}/accept`
      );

      console.log(
        "Accept Order Response:",
        response.data
      );

      if (response.data?.success) {
        setSuccess(
          "🛵 Delivery accepted successfully."
        );

        await fetchRiderData(false);

        setTimeout(() => {
          setSuccess("");
        }, 3000);
      } else {
        setError(
          response.data?.message ||
            "Unable to accept order"
        );
      }
    } catch (error) {
      console.error(
        "Accept Order Error:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
          "Unable to accept order"
      );
    } finally {
      setActionId("");
    }
  };

  // =====================================================
  // UPDATE DELIVERY STATUS
  // =====================================================

  const updateDeliveryStatus = async (
    orderId,
    endpoint,
    successMessage
  ) => {
    try {
      setActionId(orderId);
      setError("");
      setSuccess("");

      console.log(
        "Updating Delivery:",
        {
          orderId,
          endpoint,
        }
      );

      const response = await api.put(
        `/order/${orderId}/${endpoint}`
      );

      console.log(
        "Delivery Status Response:",
        response.data
      );

      if (response.data?.success) {
        setSuccess(successMessage);

        await fetchRiderData(false);

        setTimeout(() => {
          setSuccess("");
        }, 3000);
      } else {
        setError(
          response.data?.message ||
            "Unable to update delivery"
        );
      }
    } catch (error) {
      console.error(
        "Delivery Status Error:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
          "Unable to update delivery"
      );
    } finally {
      setActionId("");
    }
  };

  // =====================================================
  // NEXT ACTION
  // =====================================================

  const getNextAction = (order) => {
    switch (order.deliveryStatus) {
      case "Rider Assigned":
        return {
          label: "Mark Picked Up",
          endpoint: "picked-up",
          message:
            "📦 Order marked as picked up.",
        };

      case "Picked Up":
        return {
          label: "Out for Delivery",
          endpoint:
            "out-for-delivery",
          message:
            "🚚 Order is now out for delivery.",
        };

      case "Out for Delivery":
        return {
          label: "Mark Delivered",
          endpoint: "delivered",
          message:
            "✅ Order delivered successfully.",
        };

      default:
        return null;
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "Rider Assigned":
        return "bg-blue-100 text-blue-700";

      case "Picked Up":
        return "bg-purple-100 text-purple-700";

      case "Out for Delivery":
        return "bg-orange-100 text-orange-700";

      case "Delivered":
        return "bg-green-100 text-green-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // =====================================================
  // TIMELINE STATUS
  // =====================================================

  const getTimelineStatus = (order) => {
    const status =
      order?.deliveryStatus;

    return {
      placed: Boolean(
        order?.createdAt
      ),

      accepted: Boolean(
        order?.riderAcceptedAt ||
          status === "Rider Assigned" ||
          status === "Picked Up" ||
          status ===
            "Out for Delivery"
      ),

      pickedUp: Boolean(
        order?.pickedUpAt ||
          status === "Picked Up" ||
          status ===
            "Out for Delivery"
      ),

      outForDelivery: Boolean(
        order?.outForDeliveryAt ||
          status ===
            "Out for Delivery"
      ),

      delivered: Boolean(
        order?.deliveredAt ||
          status === "Delivered"
      ),
    };
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">

          <div className="text-5xl mb-4">
            🛵
          </div>

          <p className="text-lg font-semibold text-gray-800">
            Loading Rider Dashboard...
          </p>

          <p className="text-sm text-gray-500 mt-2">
            Please wait
          </p>

        </div>

      </div>
    );
  }

  // =====================================================
  // DASHBOARD
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">

        <div className="max-w-7xl mx-auto px-4 py-4">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-2xl">
                🛵
              </div>

              <div>

                <h1 className="text-xl font-bold text-gray-900">
                  Foodie Rider
                </h1>

                <p className="text-xs text-gray-500">
                  Delivery Partner Dashboard
                </p>

              </div>

            </div>

            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition"
            >
              Logout
            </button>

          </div>

        </div>

      </nav>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">

            <div className="flex items-center justify-between gap-4">

              <p>{error}</p>

              <button
                onClick={() =>
                  setError("")
                }
                className="font-bold"
              >
                ×
              </button>

            </div>

          </div>
        )}

        {/* =================================================
            SUCCESS
        ================================================= */}

        {success && (
          <div className="mb-5 bg-green-50 border border-green-200 text-green-700 px-4 py-4 rounded-xl">

            <div className="flex items-center justify-between gap-4">

              <div>

                <p className="font-semibold">
                  {success}
                </p>

                <p className="text-sm mt-1">
                  Dashboard has been refreshed.
                </p>

              </div>

              <button
                onClick={() =>
                  setSuccess("")
                }
                className="font-bold text-lg"
              >
                ×
              </button>

            </div>

          </div>
        )}

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

          <div>

            <h2 className="text-3xl font-bold text-gray-900">
              Rider Dashboard
            </h2>

            <p className="text-gray-500 mt-1">
              Manage deliveries and track your earnings.
            </p>

          </div>

          <button
            onClick={() =>
              fetchRiderData(false)
            }
            disabled={refreshing}
            className="px-5 py-3 bg-white border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {refreshing
              ? "Refreshing..."
              : "🔄 Refresh"}
          </button>

        </div>

        {/* =================================================
            STATS
        ================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">

          {/* AVAILABLE */}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-500">
                  Available Orders
                </p>

                <p className="text-4xl font-bold text-orange-500 mt-2">
                  {availableOrders.length}
                </p>

              </div>

              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-2xl">
                📦
              </div>

            </div>

          </div>

          {/* ACTIVE */}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-500">
                  Active Deliveries
                </p>

                <p className="text-4xl font-bold text-blue-600 mt-2">
                  {activeOrders.length}
                </p>

              </div>

              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl">
                🚴
              </div>

            </div>

          </div>

          {/* COMPLETED */}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-500">
                  Completed
                </p>

                <p className="text-4xl font-bold text-green-600 mt-2">
                  {Number(
                    earnings.totalDeliveries || 0
                  )}
                </p>

              </div>

              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-2xl">
                ✅
              </div>

            </div>

          </div>

          {/* TOTAL EARNINGS */}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-500">
                  Total Earnings
                </p>

                <p className="text-3xl font-bold text-green-600 mt-2">
                  {money(
                    earnings.totalEarnings
                  )}
                </p>

              </div>

              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-2xl">
                💰
              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            AVAILABLE DELIVERIES
        ================================================= */}

        <section className="mb-10">

          <div className="mb-5">

            <h3 className="text-2xl font-bold text-gray-900">
              Available Deliveries
            </h3>

            <p className="text-gray-500 mt-1">
              Orders marked Ready for Pickup by restaurants.
            </p>

          </div>

          {availableOrders.length === 0 ? (

            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">

              <div className="text-6xl mb-4">
                📭
              </div>

              <h4 className="text-xl font-bold text-gray-900">
                No deliveries available
              </h4>

              <p className="text-gray-500 mt-2">
                New delivery requests will appear automatically.
              </p>

              <p className="text-xs text-gray-400 mt-3">
                Checking for new orders every 5 seconds.
              </p>

            </div>

          ) : (

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {availableOrders.map(
                (order) => (

                  <div
                    key={order._id}
                    className="bg-white rounded-2xl border-2 border-orange-100 shadow-sm p-6"
                  >

                    {/* TOP */}

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <p className="text-xs text-gray-500">
                          Order #
                          {order._id?.slice(-6)}
                        </p>

                        <h4 className="text-xl font-bold text-gray-900 mt-1">
                          {order.restaurant
                            ?.restaurantName ||
                            "Restaurant"}
                        </h4>

                      </div>

                      <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold whitespace-nowrap">
                        🛵 Ready for Pickup
                      </span>

                    </div>

                    {/* ORDER TIME */}

                    <div className="mt-4 bg-gray-50 rounded-xl p-3">

                      <p className="text-xs text-gray-500">
                        🕐 Order Placed
                      </p>

                      <p className="font-semibold text-gray-800 mt-1">
                        {formatDateTime(
                          order.createdAt
                        )}
                      </p>

                    </div>

                    {/* LOCATIONS */}

                    <div className="mt-5 space-y-4">

                      {/* PICKUP */}

                      <div className="flex gap-3">

                        <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
                          🏪
                        </div>

                        <div>

                          <p className="text-xs text-gray-500">
                            Pickup
                          </p>

                          <p className="font-medium text-gray-800">
                            {order.pickupLocation
                              ?.address ||
                              order.restaurant
                                ?.address ||
                              "-"}
                          </p>

                        </div>

                      </div>

                      {/* CUSTOMER */}

                      <div className="flex gap-3">

                        <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                          📍
                        </div>

                        <div>

                          <p className="text-xs text-gray-500">
                            Customer Delivery
                          </p>

                          <p className="font-medium text-gray-800">
                            {order.deliveryLocation
                              ?.address ||
                              order.deliveryAddress ||
                              "-"}
                          </p>

                        </div>

                      </div>

                    </div>

                    {/* INFO */}

                    <div className="grid grid-cols-3 gap-3 mt-5">

                      <div className="bg-gray-50 rounded-xl p-3">

                        <p className="text-xs text-gray-500">
                          Distance
                        </p>

                        <p className="font-bold mt-1">
                          {Number(
                            order.distanceKm || 0
                          ).toFixed(1)}{" "}
                          km
                        </p>

                      </div>

                      <div className="bg-gray-50 rounded-xl p-3">

                        <p className="text-xs text-gray-500">
                          Delivery Fee
                        </p>

                        <p className="font-bold mt-1">
                          {money(
                            order.deliveryFee
                          )}
                        </p>

                      </div>

                      <div className="bg-green-50 rounded-xl p-3">

                        <p className="text-xs text-green-600">
                          Your Earning
                        </p>

                        <p className="font-bold text-green-700 mt-1">
                          {money(
                            order.riderEarning
                          )}
                        </p>

                      </div>

                    </div>

                    {/* ACCEPT */}

                    <button
                      onClick={() =>
                        acceptOrder(
                          order._id
                        )
                      }
                      disabled={
                        actionId ===
                        order._id
                      }
                      className="w-full mt-5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3.5 rounded-xl transition"
                    >
                      {actionId ===
                      order._id
                        ? "Accepting..."
                        : "🛵 Accept Delivery"}
                    </button>

                  </div>

                )
              )}

            </div>

          )}

        </section>

        {/* =================================================
            ACTIVE DELIVERIES
        ================================================= */}

        <section>

          <div className="mb-5">

            <h3 className="text-2xl font-bold text-gray-900">
              Active Deliveries
            </h3>

            <p className="text-gray-500 mt-1">
              Orders currently assigned to you.
            </p>

          </div>

          {activeOrders.length === 0 ? (

            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">

              <div className="text-6xl mb-4">
                ✅
              </div>

              <h4 className="text-xl font-bold text-gray-900">
                No active deliveries
              </h4>

              <p className="text-gray-500 mt-2">
                Accepted orders will appear here.
              </p>

            </div>

          ) : (

            <div className="space-y-5">

              {activeOrders.map(
                (order) => {

                  const nextAction =
                    getNextAction(order);

                  const timeline =
                    getTimelineStatus(
                      order
                    );

                  const elapsedDeliveryTime =
                    getElapsedDeliveryTime(
                      order.outForDeliveryAt
                    );

                  return (

                    <div
                      key={order._id}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
                    >

                      {/* =================================================
                          HEADER
                      ================================================= */}

                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                        <div>

                          <p className="text-xs text-gray-500">
                            Order #
                            {order._id?.slice(-6)}
                          </p>

                          <h4 className="text-xl font-bold text-gray-900 mt-1">
                            {order.restaurant
                              ?.restaurantName ||
                              "Restaurant"}
                          </h4>

                          <p className="text-sm text-gray-500 mt-1">
                            🕐 Placed{" "}
                            {formatDateTime(
                              order.createdAt
                            )}
                          </p>

                          <div className="mt-2">

                            <span
                              className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                                order.deliveryStatus
                              )}`}
                            >
                              {order.deliveryStatus}
                            </span>

                          </div>

                        </div>

                        {nextAction && (

                          <button
                            onClick={() =>
                              updateDeliveryStatus(
                                order._id,
                                nextAction.endpoint,
                                nextAction.message
                              )
                            }
                            disabled={
                              actionId ===
                              order._id
                            }
                            className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold px-6 py-3 rounded-xl transition"
                          >
                            {actionId ===
                            order._id
                              ? "Updating..."
                              : nextAction.label}
                          </button>

                        )}

                      </div>

                      {/* =================================================
                          LIVE DELIVERY TIMER
                      ================================================= */}

                      {order.deliveryStatus ===
                        "Out for Delivery" && (

                        <div className="mt-5 bg-orange-50 border border-orange-200 rounded-2xl p-5">

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                            <div>

                              <p className="text-xs font-bold text-orange-600 uppercase tracking-wide">
                                🚚 Currently Out for Delivery
                              </p>

                              <p className="text-3xl font-bold text-gray-900 mt-1">
                                ⏱️{" "}
                                {
                                  elapsedDeliveryTime
                                }
                              </p>

                              <p className="text-sm text-gray-500 mt-1">
                                Started at{" "}
                                <span className="font-semibold">
                                  {formatDateTime(
                                    order.outForDeliveryAt
                                  )}
                                </span>
                              </p>

                            </div>

                            <div className="text-5xl">
                              🛵
                            </div>

                          </div>

                        </div>
                      )}

                      {/* =================================================
                          ORDER TIMELINE
                      ================================================= */}

                      <div className="mt-6 bg-white border border-gray-100 rounded-2xl p-5">

                        <div className="flex items-center justify-between mb-5">

                          <div>

                            <h5 className="text-lg font-bold text-gray-900">
                              Order Timeline
                            </h5>

                            <p className="text-xs text-gray-500 mt-1">
                              Track order progress and timing.
                            </p>

                          </div>

                          <div className="text-2xl">
                            🕐
                          </div>

                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

                          {/* ORDER PLACED */}

                          <div className="bg-gray-50 rounded-xl p-4">

                            <div className="flex items-center gap-2">

                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                📝
                              </div>

                              <p className="font-semibold text-sm">
                                Order Placed
                              </p>

                            </div>

                            <p className="text-xs text-gray-500 mt-3">
                              {formatDateTime(
                                order.createdAt
                              )}
                            </p>

                          </div>

                          {/* RIDER ACCEPTED */}

                          <div
                            className={`rounded-xl p-4 ${
                              timeline.accepted
                                ? "bg-blue-50"
                                : "bg-gray-50"
                            }`}
                          >

                            <div className="flex items-center gap-2">

                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  timeline.accepted
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-200"
                                }`}
                              >
                                🛵
                              </div>

                              <p className="font-semibold text-sm">
                                Rider Accepted
                              </p>

                            </div>

                            <p className="text-xs text-gray-500 mt-3">
                              {formatDateTime(
                                order.riderAcceptedAt
                              )}
                            </p>

                          </div>

                          {/* PICKED UP */}

                          <div
                            className={`rounded-xl p-4 ${
                              timeline.pickedUp
                                ? "bg-purple-50"
                                : "bg-gray-50"
                            }`}
                          >

                            <div className="flex items-center gap-2">

                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  timeline.pickedUp
                                    ? "bg-purple-500 text-white"
                                    : "bg-gray-200"
                                }`}
                              >
                                📦
                              </div>

                              <p className="font-semibold text-sm">
                                Picked Up
                              </p>

                            </div>

                            <p className="text-xs text-gray-500 mt-3">
                              {formatDateTime(
                                order.pickedUpAt
                              )}
                            </p>

                          </div>

                          {/* OUT FOR DELIVERY */}

                          <div
                            className={`rounded-xl p-4 ${
                              timeline.outForDelivery
                                ? "bg-orange-50"
                                : "bg-gray-50"
                            }`}
                          >

                            <div className="flex items-center gap-2">

                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  timeline.outForDelivery
                                    ? "bg-orange-500 text-white"
                                    : "bg-gray-200"
                                }`}
                              >
                                🚚
                              </div>

                              <p className="font-semibold text-sm">
                                Out for Delivery
                              </p>

                            </div>

                            <p className="text-xs text-gray-500 mt-3">
                              {formatDateTime(
                                order.outForDeliveryAt
                              )}
                            </p>

                            {timeline.outForDelivery &&
                              order.outForDeliveryAt && (
                                <p className="text-xs text-orange-600 font-semibold mt-1">
                                  ⏱️{" "}
                                  {getElapsedDeliveryTime(
                                    order.outForDeliveryAt
                                  )}
                                </p>
                              )}

                          </div>

                          {/* DELIVERED */}

                          <div
                            className={`rounded-xl p-4 ${
                              timeline.delivered
                                ? "bg-green-50"
                                : "bg-gray-50"
                            }`}
                          >

                            <div className="flex items-center gap-2">

                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  timeline.delivered
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-200"
                                }`}
                              >
                                ✅
                              </div>

                              <p className="font-semibold text-sm">
                                Delivered
                              </p>

                            </div>

                            <p className="text-xs text-gray-500 mt-3">
                              {formatDateTime(
                                order.deliveredAt
                              )}
                            </p>

                          </div>

                        </div>

                      </div>

                      {/* =================================================
                          DELIVERY DETAILS
                      ================================================= */}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">

                        {/* PICKUP */}

                        <div className="bg-orange-50 rounded-xl p-4">

                          <p className="text-xs text-orange-600 font-semibold">
                            🏪 PICKUP
                          </p>

                          <p className="font-medium text-gray-800 mt-2">
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
                              <p className="text-xs text-gray-500 mt-2">
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

                        {/* CUSTOMER */}

                        <div className="bg-blue-50 rounded-xl p-4">

                          <p className="text-xs text-blue-600 font-semibold">
                            👤 CUSTOMER
                          </p>

                          <p className="font-semibold text-gray-800 mt-2">
                            {order.user?.name ||
                              "-"}
                          </p>

                          <p className="text-sm text-gray-500 mt-1">
                            📞{" "}
                            {order.user?.phone ||
                              "-"}
                          </p>

                        </div>

                        {/* DELIVERY */}

                        <div className="bg-green-50 rounded-xl p-4">

                          <p className="text-xs text-green-600 font-semibold">
                            📍 DELIVERY
                          </p>

                          <p className="font-medium text-gray-800 mt-2">
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
                              <p className="text-xs text-gray-500 mt-2">
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
                            )}

                        </div>

                        {/* EARNING */}

                        <div className="bg-purple-50 rounded-xl p-4">

                          <p className="text-xs text-purple-600 font-semibold">
                            💰 YOUR EARNING
                          </p>

                          <p className="text-2xl font-bold text-purple-700 mt-2">
                            {money(
                              order.riderEarning
                            )}
                          </p>

                        </div>

                      </div>

                      {/* =================================================
                          ORDER INFO
                      ================================================= */}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">

                        <div className="border border-gray-100 rounded-xl p-3">

                          <p className="text-xs text-gray-500">
                            Distance
                          </p>

                          <p className="font-bold mt-1">
                            {Number(
                              order.distanceKm || 0
                            ).toFixed(1)}{" "}
                            km
                          </p>

                        </div>

                        <div className="border border-gray-100 rounded-xl p-3">

                          <p className="text-xs text-gray-500">
                            Order Amount
                          </p>

                          <p className="font-bold mt-1">
                            {money(
                              order.finalAmount
                            )}
                          </p>

                        </div>

                        <div className="border border-gray-100 rounded-xl p-3">

                          <p className="text-xs text-gray-500">
                            Payment
                          </p>

                          <p className="font-bold mt-1">
                            {order.paymentMethod ||
                              "-"}
                          </p>

                        </div>

                        <div className="border border-gray-100 rounded-xl p-3">

                          <p className="text-xs text-gray-500">
                            Payment Status
                          </p>

                          <p className="font-bold mt-1">
                            {order.paymentStatus ||
                              "-"}
                          </p>

                        </div>

                      </div>

                    </div>

                  );
                }
              )}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default Dashboard;
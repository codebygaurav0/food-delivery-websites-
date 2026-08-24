import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  // =====================================================
  // FETCH RESTAURANT ORDERS
  // GET /order/restaurant
  // =====================================================

  const fetchOrders = async (showLoader = false) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const response = await api.get("/order/restaurant");

      console.log("Restaurant Orders Response:", response.data);

      if (response.data?.success) {
        setOrders(response.data.orders || []);
      } else {
        setError(
          response.data?.message ||
            "Unable to load restaurant orders"
        );
      }
    } catch (requestError) {
      console.error(
        "Get Restaurant Orders Error:",
        requestError.response?.data || requestError
      );

      setError(
        requestError.response?.data?.message ||
          "Unable to load restaurant orders"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchOrders(true);

    // Automatically refresh every 10 seconds
    const interval = setInterval(() => {
      fetchOrders(false);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // =====================================================
  // UPDATE ORDER STATUS
  // =====================================================

  const updateStatus = async (orderId, status) => {
    try {
      setUpdatingId(orderId);
      setError("");
      setSuccess("");

      console.log("Updating order:", {
        orderId,
        status,
      });

      const response = await api.put(
        `/order/restaurant/${orderId}/status`,
        {
          orderStatus: status,
        }
      );

      console.log(
        "Update Order Response:",
        response.data
      );

      if (response.data?.success) {
        setOrders((previousOrders) =>
          previousOrders.map((order) =>
            order._id === orderId
              ? response.data.order
              : order
          )
        );

        setSuccess(
          `Order status changed to "${status}".`
        );

        setTimeout(() => {
          setSuccess("");
        }, 3000);
      } else {
        setError(
          response.data?.message ||
            "Unable to update order status"
        );
      }
    } catch (requestError) {
      console.error(
        "Update Order Status Error:",
        requestError.response?.data || requestError
      );

      setError(
        requestError.response?.data?.message ||
          "Unable to update order status"
      );
    } finally {
      setUpdatingId("");
    }
  };

  // =====================================================
  // CONFIRM COD PAYMENT
  // =====================================================

  const confirmCodPayment = async (orderId) => {
    const confirmed = window.confirm(
      "Confirm that COD payment has been received for this order?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingId(orderId);
      setError("");
      setSuccess("");

      const response = await api.put(
        `/order/restaurant/${orderId}/confirm-cod`
      );

      console.log(
        "COD Payment Response:",
        response.data
      );

      if (response.data?.success) {
        setOrders((previousOrders) =>
          previousOrders.map((order) =>
            order._id === orderId
              ? response.data.order
              : order
          )
        );

        setSuccess(
          "COD payment confirmed successfully."
        );

        setTimeout(() => {
          setSuccess("");
        }, 3000);
      } else {
        setError(
          response.data?.message ||
            "Unable to confirm COD payment"
        );
      }
    } catch (requestError) {
      console.error(
        "Confirm COD Payment Error:",
        requestError.response?.data ||
          requestError
      );

      setError(
        requestError.response?.data?.message ||
          "Unable to confirm COD payment"
      );
    } finally {
      setUpdatingId("");
    }
  };

  // =====================================================
  // STATUS STYLE
  // =====================================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "Placed":
        return "bg-orange-100 text-orange-700";

      case "Confirmed":
        return "bg-purple-100 text-purple-700";

      case "Preparing":
        return "bg-yellow-100 text-yellow-700";

      case "Ready for Pickup":
        return "bg-blue-100 text-blue-700";

      case "Rider Assigned":
        return "bg-indigo-100 text-indigo-700";

      case "Picked Up":
        return "bg-cyan-100 text-cyan-700";

      case "Out for Delivery":
        return "bg-sky-100 text-sky-700";

      case "Delivered":
        return "bg-green-100 text-green-700";

      case "Cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // =====================================================
  // PAYMENT STYLE
  // =====================================================

  const getPaymentStyle = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700";

      case "Failed":
        return "bg-red-100 text-red-700";

      case "Pending":
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  // =====================================================
  // NEXT RESTAURANT STATUS
  // =====================================================

  const getNextStatus = (status) => {
    switch (status) {
      case "Placed":
        return "Confirmed";

      case "Confirmed":
        return "Preparing";

      case "Preparing":
        return "Ready for Pickup";

      default:
        return null;
    }
  };

  // =====================================================
  // ORDER COUNTS
  // =====================================================

  const totalOrders = orders.length;

  const placedOrders = orders.filter(
    (order) =>
      order.orderStatus === "Placed"
  ).length;

  const preparingOrders = orders.filter(
    (order) =>
      order.orderStatus === "Confirmed" ||
      order.orderStatus === "Preparing"
  ).length;

  const readyOrders = orders.filter(
    (order) =>
      order.orderStatus === "Ready for Pickup" ||
      order.orderStatus === "Rider Assigned"
  ).length;

  const deliveredOrders = orders.filter(
    (order) =>
      order.orderStatus === "Delivered"
  ).length;

  const cancelledOrders = orders.filter(
    (order) =>
      order.orderStatus === "Cancelled"
  ).length;

  const pendingCodOrders = orders.filter(
    (order) =>
      order.paymentMethod === "COD" &&
      order.paymentStatus !== "Paid" &&
      order.orderStatus === "Delivered"
  ).length;

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-5xl mb-4">
            📦
          </div>

          <p className="text-gray-500">
            Loading restaurant orders...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav className="bg-white border-b border-gray-200 sticky top-0 z-20">

        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">

          <button
            onClick={() =>
              navigate("/restaurant/dashboard")
            }
            className="text-orange-500 font-semibold hover:text-orange-600"
          >
            ← Dashboard
          </button>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-orange-500">
              📦 Orders
            </h1>

            <p className="text-xs text-gray-500">
              Restaurant Order Management
            </p>
          </div>

          <div className="flex items-center gap-2">

            <button
              onClick={() => fetchOrders(false)}
              disabled={refreshing}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium disabled:opacity-50"
            >
              {refreshing
                ? "Refreshing..."
                : "↻ Refresh"}
            </button>

            <button
              onClick={() =>
                navigate("/restaurant/foods")
              }
              className="bg-orange-50 text-orange-600 px-4 py-2 rounded-lg font-medium"
            >
              🍽️ Menu
            </button>

          </div>

        </div>
      </nav>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="max-w-7xl mx-auto px-4 py-10">

        {/* HEADER */}

        <div className="mb-8">

          <h2 className="text-3xl font-bold text-gray-900">
            Customer Orders
          </h2>

          <p className="text-gray-500 mt-1">
            Manage incoming orders and prepare them
            for rider pickup.
          </p>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl">
            <p className="font-semibold">
              Error
            </p>

            <p className="mt-1">
              {error}
            </p>
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="mb-5 bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl">
            {success}
          </div>
        )}

        {/* =================================================
            STATS
        ================================================= */}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm text-gray-500">
              Total
            </p>

            <p className="text-3xl font-bold text-gray-900 mt-2">
              {totalOrders}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm text-gray-500">
              New
            </p>

            <p className="text-3xl font-bold text-orange-500 mt-2">
              {placedOrders}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm text-gray-500">
              Preparing
            </p>

            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {preparingOrders}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm text-gray-500">
              Ready
            </p>

            <p className="text-3xl font-bold text-blue-600 mt-2">
              {readyOrders}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm text-gray-500">
              Delivered
            </p>

            <p className="text-3xl font-bold text-green-600 mt-2">
              {deliveredOrders}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm text-gray-500">
              COD Pending
            </p>

            <p className="text-3xl font-bold text-red-600 mt-2">
              {pendingCodOrders}
            </p>
          </div>

        </div>

        {/* =================================================
            EMPTY
        ================================================= */}

        {orders.length === 0 ? (

          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">

            <div className="text-6xl mb-4">
              📦
            </div>

            <h3 className="text-xl font-bold text-gray-900">
              No orders yet
            </h3>

            <p className="text-gray-500 mt-2">
              Customer orders will appear here.
            </p>

          </div>

        ) : (

          <div className="space-y-6">

            {orders.map((order) => {

              const nextStatus =
                getNextStatus(
                  order.orderStatus
                );

              const canConfirmCod =
                order.paymentMethod === "COD" &&
                order.paymentStatus !== "Paid" &&
                order.orderStatus === "Delivered";

              const isUpdating =
                updatingId === order._id;

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
                >

                  {/* =================================================
                      ORDER HEADER
                  ================================================= */}

                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                    <div>

                      <p className="text-sm text-gray-500">
                        Order ID
                      </p>

                      <h3 className="font-bold text-lg text-gray-900 break-all">
                        #{order._id}
                      </h3>

                      {order.user && (
                        <p className="text-gray-500 mt-1">
                          Customer:{" "}
                          <span className="font-medium text-gray-700">
                            {order.user.name ||
                              "Customer"}
                          </span>
                        </p>
                      )}

                      <p className="text-xs text-gray-400 mt-1">
                        {order.createdAt
                          ? new Date(
                              order.createdAt
                            ).toLocaleString("en-IN")
                          : "-"}
                      </p>

                    </div>

                    <div className="flex items-center gap-3 flex-wrap">

                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${getStatusStyle(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus}
                      </span>

                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${getPaymentStyle(
                          order.paymentStatus
                        )}`}
                      >
                        {order.paymentMethod} •{" "}
                        {order.paymentStatus}
                      </span>

                    </div>

                  </div>

                  {/* =================================================
                      CUSTOMER
                  ================================================= */}

                  {order.user && (
                    <div className="mt-6 bg-gray-50 rounded-xl p-4">

                      <h4 className="font-semibold text-gray-900 mb-3">
                        Customer Details
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">

                        <p>
                          👤{" "}
                          <span className="font-medium text-gray-800">
                            {order.user.name || "-"}
                          </span>
                        </p>

                        <p>
                          📧{" "}
                          {order.user.email || "-"}
                        </p>

                        <p>
                          📞{" "}
                          {order.user.phone || "-"}
                        </p>

                      </div>

                    </div>
                  )}

                  {/* =================================================
                      ITEMS
                  ================================================= */}

                  <div className="mt-6">

                    <h4 className="font-bold text-gray-900 mb-4">
                      🍽️ Order Items
                    </h4>

                    <div className="space-y-3">

                      {order.items?.map(
                        (item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center border-b border-gray-100 pb-3"
                          >

                            <div>

                              <p className="font-medium text-gray-900">
                                {item.name ||
                                  "Food Item"}
                              </p>

                              <p className="text-sm text-gray-500">
                                {item.quantity} × ₹
                                {item.price}
                              </p>

                            </div>

                            <p className="font-semibold text-gray-900">
                              ₹
                              {Number(
                                item.subtotal || 0
                              ).toFixed(2)}
                            </p>

                          </div>
                        )
                      )}

                    </div>

                  </div>

                  {/* =================================================
                      DELIVERY
                  ================================================= */}

                  <div className="mt-6 bg-orange-50 rounded-xl p-4">

                    <h4 className="font-semibold text-gray-900">
                      📍 Delivery Details
                    </h4>

                    <p className="text-sm text-gray-500 mt-3">
                      Delivery Address
                    </p>

                    <p className="font-medium text-gray-900 mt-1">
                      {order.deliveryAddress ||
                        order.deliveryLocation?.address ||
                        "-"}
                    </p>

                    {order.deliveryLocation?.latitude !== undefined &&
                      order.deliveryLocation?.longitude !== undefined && (

                        <div className="mt-4 text-sm text-gray-600">

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                            <div className="bg-white rounded-lg p-3">
                              <p className="text-xs text-gray-400">
                                Latitude
                              </p>

                              <p className="font-semibold">
                                {order.deliveryLocation.latitude}
                              </p>
                            </div>

                            <div className="bg-white rounded-lg p-3">
                              <p className="text-xs text-gray-400">
                                Longitude
                              </p>

                              <p className="font-semibold">
                                {order.deliveryLocation.longitude}
                              </p>
                            </div>

                          </div>

                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${order.deliveryLocation.latitude},${order.deliveryLocation.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-4 inline-block font-semibold text-orange-600 hover:text-orange-700"
                          >
                            📍 View Customer Location
                          </a>

                        </div>
                      )}

                  </div>

                  {/* =================================================
                      FINANCIALS
                  ================================================= */}

                  <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">

                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500">
                        Food
                      </p>

                      <p className="font-bold mt-1">
                        ₹
                        {Number(
                          order.totalAmount || 0
                        ).toFixed(2)}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500">
                        Delivery
                      </p>

                      <p className="font-bold mt-1">
                        ₹
                        {Number(
                          order.deliveryFee || 0
                        ).toFixed(2)}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500">
                        Platform
                      </p>

                      <p className="font-bold mt-1">
                        ₹
                        {Number(
                          order.platformFee || 0
                        ).toFixed(2)}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500">
                        Tax
                      </p>

                      <p className="font-bold mt-1">
                        ₹
                        {Number(
                          order.taxAmount || 0
                        ).toFixed(2)}
                      </p>
                    </div>

                    <div className="bg-orange-50 rounded-xl p-4">
                      <p className="text-xs text-orange-600">
                        Customer Total
                      </p>

                      <p className="font-bold text-orange-600 mt-1">
                        ₹
                        {Number(
                          order.finalAmount || 0
                        ).toFixed(2)}
                      </p>
                    </div>

                  </div>

                  {/* =================================================
                      RIDER
                  ================================================= */}

                  {order.rider && (
                    <div className="mt-6 bg-blue-50 rounded-xl p-4">

                      <h4 className="font-semibold text-gray-900">
                        🛵 Rider
                      </h4>

                      <div className="mt-2 text-sm text-gray-600">

                        <p>
                          Name:{" "}
                          <span className="font-medium text-gray-900">
                            {order.rider.name || "-"}
                          </span>
                        </p>

                        <p className="mt-1">
                          Phone:{" "}
                          {order.rider.phone || "-"}
                        </p>

                      </div>

                    </div>
                  )}

                  {/* =================================================
                      ACTIONS
                  ================================================= */}

                  <div className="mt-6 pt-5 border-t border-gray-100">

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                      <div>

                        <p className="text-sm text-gray-500">
                          Final Customer Amount
                        </p>

                        <p className="text-2xl font-bold text-orange-500">
                          ₹
                          {Number(
                            order.finalAmount ||
                              order.totalAmount ||
                              0
                          ).toFixed(2)}
                        </p>

                      </div>

                      <div className="flex flex-wrap gap-3">

                        {/* NEXT RESTAURANT STATUS */}

                        {nextStatus && (
                          <button
                            onClick={() =>
                              updateStatus(
                                order._id,
                                nextStatus
                              )
                            }
                            disabled={isUpdating}
                            className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold px-6 py-3 rounded-xl"
                          >
                            {isUpdating
                              ? "Updating..."
                              : `Mark as ${nextStatus}`}
                          </button>
                        )}

                        {/* COD */}

                        {canConfirmCod && (
                          <button
                            onClick={() =>
                              confirmCodPayment(
                                order._id
                              )
                            }
                            disabled={isUpdating}
                            className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold px-6 py-3 rounded-xl"
                          >
                            {isUpdating
                              ? "Confirming..."
                              : "✓ Confirm COD Payment"}
                          </button>
                        )}

                        {/* WAITING FOR RIDER */}

                        {order.orderStatus ===
                          "Ready for Pickup" && (
                          <div className="bg-blue-100 text-blue-700 px-5 py-3 rounded-xl font-semibold">
                            🛵 Waiting for Rider
                          </div>
                        )}

                        {/* RIDER ASSIGNED */}

                        {order.orderStatus ===
                          "Rider Assigned" && (
                          <div className="bg-indigo-100 text-indigo-700 px-5 py-3 rounded-xl font-semibold">
                            🛵 Rider Assigned
                          </div>
                        )}

                        {/* PICKED UP */}

                        {order.orderStatus ===
                          "Picked Up" && (
                          <div className="bg-cyan-100 text-cyan-700 px-5 py-3 rounded-xl font-semibold">
                            📦 Picked Up
                          </div>
                        )}

                        {/* OUT FOR DELIVERY */}

                        {order.orderStatus ===
                          "Out for Delivery" && (
                          <div className="bg-sky-100 text-sky-700 px-5 py-3 rounded-xl font-semibold">
                            🚚 Out for Delivery
                          </div>
                        )}

                        {/* DELIVERED */}

                        {order.orderStatus ===
                          "Delivered" && (
                          <div className="bg-green-100 text-green-700 px-5 py-3 rounded-xl font-semibold">
                            ✓ Delivered
                          </div>
                        )}

                        {/* CANCELLED */}

                        {order.orderStatus ===
                          "Cancelled" && (
                          <div className="bg-red-100 text-red-700 px-5 py-3 rounded-xl font-semibold">
                            ✕ Cancelled
                          </div>
                        )}

                      </div>

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

export default Orders;
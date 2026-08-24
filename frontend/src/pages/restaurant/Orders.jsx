import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const fetchOrders = async () => {
    try {
      const response = await api.get(
        "/order/restaurant-orders"
      );

      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load orders"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(fetchOrders);
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      setUpdatingId(orderId);

      const response = await api.put(
        `/order/${orderId}/status`,
        {
          orderStatus: status,
        }
      );

      if (response.data.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId
              ? response.data.order
              : order
          )
        );
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to update order status"
      );
    } finally {
      setUpdatingId("");
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700";

      case "Out for Delivery":
        return "bg-blue-100 text-blue-700";

      case "Preparing":
        return "bg-yellow-100 text-yellow-700";

      case "Confirmed":
        return "bg-purple-100 text-purple-700";

      default:
        return "bg-orange-100 text-orange-600";
    }
  };

  const getNextStatus = (status) => {
    switch (status) {
      case "Placed":
        return "Confirmed";

      case "Confirmed":
        return "Preparing";

      case "Preparing":
        return "Out for Delivery";

      case "Out for Delivery":
        return "Delivered";

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">
          Loading orders...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200">

        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">

          <button
            onClick={() =>
              navigate("/restaurant/dashboard")
            }
            className="text-orange-500 font-semibold"
          >
            ← Dashboard
          </button>

          <h1 className="text-2xl font-bold text-orange-500">
            📦 Orders
          </h1>

          <button
            onClick={() =>
              navigate("/restaurant/foods")
            }
            className="bg-orange-50 text-orange-600 px-4 py-2 rounded-lg font-medium"
          >
            🍽️ Menu
          </button>

        </div>

      </nav>

      <main className="max-w-7xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">

          <h2 className="text-3xl font-bold text-gray-900">
            Customer Orders
          </h2>

          <p className="text-gray-500 mt-1">
            Manage and update your restaurant orders.
          </p>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl">
            {error}
          </div>
        )}

        {/* Empty */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">

            <div className="text-6xl mb-4">
              📦
            </div>

            <h3 className="text-xl font-bold">
              No orders yet
            </h3>

            <p className="text-gray-500 mt-2">
              Customer orders will appear here.
            </p>

          </div>
        ) : (
          <div className="space-y-6">

            {orders.map((order) => {

              const nextStatus = getNextStatus(
                order.orderStatus
              );

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
                >

                  {/* Order Header */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                    <div>

                      <p className="text-sm text-gray-500">
                        Order ID
                      </p>

                      <h3 className="font-bold text-lg">
                        #{order._id}
                      </h3>

                      {order.user && (
                        <p className="text-gray-500 mt-1">
                          Customer:{" "}
                          {order.user.name}
                        </p>
                      )}

                    </div>

                    {/* Status + Payment */}
                    <div className="flex items-center gap-3 flex-wrap">

                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${getStatusStyle(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus}
                      </span>

                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
                          order.paymentStatus ===
                          "Paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>

                    </div>

                  </div>

                  {/* Customer Details */}
                  {order.user && (
                    <div className="mt-6 bg-gray-50 rounded-xl p-4">

                      <h4 className="font-semibold text-gray-900 mb-2">
                        Customer Details
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">

                        <p>
                          👤 {order.user.name}
                        </p>

                        <p>
                          📧 {order.user.email}
                        </p>

                        <p>
                          📞 {order.user.phone}
                        </p>

                      </div>

                    </div>
                  )}

                  {/* Items */}
                  <div className="mt-6">

                    <h4 className="font-bold text-gray-900 mb-4">
                      Order Items
                    </h4>

                    <div className="space-y-3">

                      {order.items.map(
                        (item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center border-b border-gray-100 pb-3"
                          >

                            <div>

                              <p className="font-medium">
                                {item.name}
                              </p>

                              <p className="text-sm text-gray-500">
                                {item.quantity} × ₹
                                {item.price}
                              </p>

                            </div>

                            <p className="font-semibold">
                              ₹{item.subtotal}
                            </p>

                          </div>
                        )
                      )}

                    </div>

                  </div>

                  {/* Delivery */}
                  <div className="mt-6 bg-orange-50 rounded-xl p-4">

                    <p className="text-sm text-gray-500">
                      Delivery Address
                    </p>

                    <p className="font-medium text-gray-900 mt-1">
                      📍 {order.deliveryAddress}
                    </p>

                    {order.deliveryLocation?.latitude !== undefined && (
                      <div className="mt-3 text-sm text-gray-600">
                        <p>Latitude: {order.deliveryLocation.latitude}</p>
                        <p>Longitude: {order.deliveryLocation.longitude}</p>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${order.deliveryLocation.latitude},${order.deliveryLocation.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-block font-semibold text-orange-600 hover:text-orange-700"
                        >
                          📍 View on Map
                        </a>
                      </div>
                    )}

                  </div>

                  {/* Footer */}
                  <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                    <div>

                      <p className="text-sm text-gray-500">
                        Total Amount
                      </p>

                      <p className="text-2xl font-bold text-orange-500">
                        ₹{order.totalAmount}
                      </p>

                    </div>

                    {nextStatus && (
                      <button
                        onClick={() =>
                          updateStatus(
                            order._id,
                            nextStatus
                          )
                        }
                        disabled={
                          updatingId === order._id
                        }
                        className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold px-6 py-3 rounded-xl"
                      >
                        {updatingId === order._id
                          ? "Updating..."
                          : `Mark as ${nextStatus}`}
                      </button>
                    )}

                    {!nextStatus && (
                      <span className="bg-green-100 text-green-700 px-5 py-3 rounded-xl font-semibold">
                        ✓ Order Completed
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

export default Orders;
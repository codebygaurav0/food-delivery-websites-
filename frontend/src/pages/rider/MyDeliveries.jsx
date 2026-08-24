import { useEffect, useState } from "react";
import api from "../../services/api";

function MyDeliveries() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState("");
  const [error, setError] = useState("");

  const money = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        "/order/rider/orders"
      );

      setOrders(response.data?.orders || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load deliveries"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, endpoint) => {
    try {
      setActionId(id);

      await api.put(`/order/${id}/${endpoint}`);

      await fetchOrders();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to update delivery"
      );
    } finally {
      setActionId("");
    }
  };

  const getNextAction = (status) => {
    if (status === "Rider Assigned") {
      return {
        endpoint: "picked-up",
        label: "Mark Picked Up",
      };
    }

    if (status === "Picked Up") {
      return {
        endpoint: "out-for-delivery",
        label: "Out for Delivery",
      };
    }

    if (status === "Out for Delivery") {
      return {
        endpoint: "delivered",
        label: "Mark Delivered",
      };
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">
          My Deliveries
        </h1>

        <p className="text-gray-500 mt-1 mb-8">
          Manage your assigned deliveries.
        </p>

        {error && (
          <div className="mb-5 bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white p-10 rounded-2xl text-center">
            Loading deliveries...
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl text-center">
            <div className="text-5xl mb-3">✅</div>
            <h2 className="text-xl font-bold">
              No Active Deliveries
            </h2>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => {
              const action = getNextAction(
                order.deliveryStatus
              );

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        Order #{order._id?.slice(-6)}
                      </p>

                      <h2 className="text-xl font-bold mt-1">
                        {order.restaurant?.restaurantName ||
                          "Restaurant"}
                      </h2>

                      <p className="text-sm text-gray-500 mt-1">
                        Status:{" "}
                        <span className="font-semibold text-orange-600">
                          {order.deliveryStatus}
                        </span>
                      </p>
                    </div>

                    {action && (
                      <button
                        onClick={() =>
                          updateStatus(
                            order._id,
                            action.endpoint
                          )
                        }
                        disabled={actionId === order._id}
                        className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold px-5 py-3 rounded-xl"
                      >
                        {actionId === order._id
                          ? "Updating..."
                          : action.label}
                      </button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mt-5">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500">
                        Pickup
                      </p>
                      <p className="font-medium mt-1">
                        {order.pickupLocation?.address ||
                          "-"}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500">
                        Customer
                      </p>
                      <p className="font-medium mt-1">
                        {order.user?.name || "-"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.user?.phone || "-"}
                      </p>
                    </div>

                    <div className="bg-green-50 rounded-xl p-4">
                      <p className="text-sm text-green-600">
                        Earning
                      </p>
                      <p className="text-xl font-bold text-green-700 mt-1">
                        {money(order.riderEarning)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyDeliveries;
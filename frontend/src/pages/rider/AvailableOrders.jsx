import { useEffect, useState } from "react";
import api from "../../services/api";

function AvailableOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState("");
  const [error, setError] = useState("");

  const money = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/order/rider/available"
      );

      setOrders(response.data?.orders || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load available orders"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const acceptOrder = async (orderId) => {
    try {
      setActionId(orderId);

      const response = await api.post(
        `/order/${orderId}/accept`
      );

      if (response.data?.success) {
        await fetchOrders();
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to accept order"
      );
    } finally {
      setActionId("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Available Deliveries
          </h1>

          <p className="text-gray-500 mt-1">
            Orders ready for pickup.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <p className="text-gray-500">
              Loading available orders...
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="text-6xl mb-4">
              📭
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              No Available Deliveries
            </h2>

            <p className="text-gray-500 mt-2">
              New delivery requests will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      Order #{order._id?.slice(-6)}
                    </p>

                    <h2 className="text-xl font-bold text-gray-900 mt-1">
                      {order.restaurant?.restaurantName ||
                        "Restaurant"}
                    </h2>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
                    Ready
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      Pickup Location
                    </p>

                    <p className="font-medium text-gray-900 mt-1">
                      {order.pickupLocation?.address ||
                        order.restaurant?.address ||
                        "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Delivery Location
                    </p>

                    <p className="font-medium text-gray-900 mt-1">
                      {order.deliveryLocation?.address ||
                        order.deliveryAddress ||
                        "-"}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500">
                        Distance
                      </p>

                      <p className="font-bold text-gray-900 mt-1">
                        {Number(
                          order.distanceKm || 0
                        ).toFixed(1)}{" "}
                        KM
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500">
                        Delivery Fee
                      </p>

                      <p className="font-bold text-gray-900 mt-1">
                        {money(order.deliveryFee)}
                      </p>
                    </div>

                    <div className="bg-green-50 rounded-xl p-3">
                      <p className="text-xs text-green-600">
                        Your Earning
                      </p>

                      <p className="font-bold text-green-700 mt-1">
                        {money(order.riderEarning)}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() =>
                    acceptOrder(order._id)
                  }
                  disabled={
                    actionId === order._id
                  }
                  className="w-full mt-6 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 rounded-xl"
                >
                  {actionId === order._id
                    ? "Accepting..."
                    : "Accept Delivery"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AvailableOrders;
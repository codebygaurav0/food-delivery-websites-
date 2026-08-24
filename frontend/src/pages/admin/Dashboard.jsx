import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState("");

  useEffect(() => {
    fetchPendingRestaurants();
  }, []);

  const fetchPendingRestaurants = async () => {
    try {
      const response = await api.get(
        "/admin/restaurants/pending"
      );

      if (response.data.success) {
        setRestaurants(response.data.restaurants);
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load pending restaurants"
      );
    } finally {
      setLoading(false);
    }
  };

  const approveRestaurant = async (restaurantId) => {
    try {
      setActionId(restaurantId);

      const response = await api.put(
        `/admin/restaurants/${restaurantId}/approve`
      );

      if (response.data.success) {
        setRestaurants((prev) =>
          prev.filter(
            (restaurant) =>
              restaurant._id !== restaurantId
          )
        );
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to approve restaurant"
      );
    } finally {
      setActionId("");
    }
  };

  const rejectRestaurant = async (restaurantId) => {
    const reason = window.prompt(
      "Enter rejection reason:"
    );

    if (!reason) return;

    try {
      setActionId(restaurantId);

      const response = await api.put(
        `/admin/restaurants/${restaurantId}/reject`,
        {
          rejectionReason: reason,
        }
      );

      if (response.data.success) {
        setRestaurants((prev) =>
          prev.filter(
            (restaurant) =>
              restaurant._id !== restaurantId
          )
        );
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to reject restaurant"
      );
    } finally {
      setActionId("");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200">

        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold text-orange-500">
              🍔 Foodie
            </h1>

            <p className="text-xs text-gray-500">
              Super Admin
            </p>
          </div>

          <button
            onClick={logout}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100"
          >
            Logout
          </button>

        </div>

      </nav>

      <main className="max-w-7xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">

          <h2 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h2>

          <p className="text-gray-500 mt-1">
            Manage restaurant registration requests.
          </p>

        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

            <p className="text-gray-500">
              Pending Restaurants
            </p>

            <p className="text-4xl font-bold text-orange-500 mt-2">
              {restaurants.length}
            </p>

          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

            <p className="text-gray-500">
              Panel
            </p>

            <p className="text-xl font-bold text-gray-900 mt-3">
              Super Admin
            </p>

          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

            <p className="text-gray-500">
              Status
            </p>

            <p className="text-xl font-bold text-green-600 mt-3">
              ● Active
            </p>

          </div>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl">
            {error}
          </div>
        )}

        {/* Pending Restaurants */}
        <div className="mb-5">

          <h2 className="text-2xl font-bold text-gray-900">
            Pending Restaurant Requests
          </h2>

          <p className="text-gray-500 mt-1">
            Review and approve or reject restaurant registrations.
          </p>

        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <p className="text-gray-500">
              Loading requests...
            </p>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">

            <div className="text-6xl mb-4">
              ✅
            </div>

            <h3 className="text-xl font-bold text-gray-900">
              No Pending Requests
            </h3>

            <p className="text-gray-500 mt-2">
              All restaurant requests have been processed.
            </p>

          </div>
        ) : (
          <div className="space-y-6">

            {restaurants.map((restaurant) => (

              <div
                key={restaurant._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
              >

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                  <div>

                    <p className="text-sm text-gray-500">
                      Restaurant
                    </p>

                    <h3 className="text-2xl font-bold text-gray-900">
                      {restaurant.restaurantName}
                    </h3>

                    <span className="inline-block mt-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                      {restaurant.status}
                    </span>

                  </div>

                  <div className="flex flex-wrap gap-3">

                    <button
                      onClick={() =>
                        approveRestaurant(
                          restaurant._id
                        )
                      }
                      disabled={
                        actionId === restaurant._id
                      }
                      className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold px-6 py-3 rounded-xl"
                    >
                      {actionId === restaurant._id
                        ? "Processing..."
                        : "✓ Approve"}
                    </button>

                    <button
                      onClick={() =>
                        rejectRestaurant(
                          restaurant._id
                        )
                      }
                      disabled={
                        actionId === restaurant._id
                      }
                      className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold px-6 py-3 rounded-xl"
                    >
                      ✕ Reject
                    </button>

                  </div>

                </div>

                {/* Restaurant Details */}
                <div className="mt-6 bg-gray-50 rounded-xl p-5">

                  <h4 className="font-bold text-gray-900 mb-4">
                    Restaurant Details
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">

                    <div>
                      <p className="text-gray-500">
                        Email
                      </p>

                      <p className="font-medium mt-1">
                        {restaurant.email}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">
                        Phone
                      </p>

                      <p className="font-medium mt-1">
                        {restaurant.phone}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">
                        Address
                      </p>

                      <p className="font-medium mt-1">
                        {restaurant.address}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">
                        City
                      </p>

                      <p className="font-medium mt-1">
                        {restaurant.city}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">
                        State
                      </p>

                      <p className="font-medium mt-1">
                        {restaurant.state}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">
                        Owner
                      </p>

                      <p className="font-medium mt-1">
                        {restaurant.owner?.name ||
                          "Restaurant Owner"}
                      </p>
                    </div>

                  </div>

                </div>

              </div>

            ))}

          </div>
        )}

      </main>

    </div>
  );
}

export default Dashboard;
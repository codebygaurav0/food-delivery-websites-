import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [riders, setRiders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState("");

  const [activeSection, setActiveSection] = useState("dashboard");

  // =====================================================
  // FETCH DASHBOARD DATA
  // =====================================================

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const requests = await Promise.allSettled([
        api.get("/admin/dashboard"),
        api.get("/admin/restaurants/pending"),
        api.get("/admin/riders/pending"),
        api.get("/admin/customers"),
        api.get("/admin/orders"),
      ]);

      // Dashboard stats
      if (requests[0].status === "fulfilled") {
        setDashboard(
          requests[0].value.data?.dashboard ||
            requests[0].value.data ||
            null
        );
      }

      // Restaurants
      if (requests[1].status === "fulfilled") {
        setRestaurants(
          requests[1].value.data?.restaurants || []
        );
      }

      // Pending Riders
      if (requests[2].status === "fulfilled") {
        setRiders(
          requests[2].value.data?.riders || []
        );
      }

      // Customers
      if (requests[3].status === "fulfilled") {
        setCustomers(
          requests[3].value.data?.customers || []
        );
      }

      // Orders
      if (requests[4].status === "fulfilled") {
        setOrders(
          requests[4].value.data?.orders || []
        );
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load admin dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // =====================================================
  // RESTAURANT APPROVE
  // =====================================================

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

        await refreshDashboardStats();
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

  // =====================================================
  // RESTAURANT REJECT
  // =====================================================

  const rejectRestaurant = async (restaurantId) => {
    const reason = window.prompt(
      "Enter rejection reason:"
    );

    if (!reason?.trim()) return;

    try {
      setActionId(restaurantId);

      const response = await api.put(
        `/admin/restaurants/${restaurantId}/reject`,
        {
          rejectionReason: reason.trim(),
        }
      );

      if (response.data.success) {
        setRestaurants((prev) =>
          prev.filter(
            (restaurant) =>
              restaurant._id !== restaurantId
          )
        );

        await refreshDashboardStats();
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

  // =====================================================
  // RIDER APPROVE
  // =====================================================

  const approveRider = async (riderId) => {
    try {
      setActionId(riderId);

      const response = await api.put(
        `/admin/riders/${riderId}/approve`
      );

      if (response.data.success) {
        setRiders((prev) =>
          prev.filter(
            (rider) => rider._id !== riderId
          )
        );

        await refreshDashboardStats();
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to approve rider"
      );
    } finally {
      setActionId("");
    }
  };

  // =====================================================
  // RIDER REJECT
  // =====================================================

  const rejectRider = async (riderId) => {
    const reason = window.prompt(
      "Enter rider rejection reason:"
    );

    if (!reason?.trim()) return;

    try {
      setActionId(riderId);

      const response = await api.put(
        `/admin/riders/${riderId}/reject`,
        {
          rejectionReason: reason.trim(),
        }
      );

      if (response.data.success) {
        setRiders((prev) =>
          prev.filter(
            (rider) => rider._id !== riderId
          )
        );

        await refreshDashboardStats();
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to reject rider"
      );
    } finally {
      setActionId("");
    }
  };

  // =====================================================
  // REFRESH DASHBOARD STATS
  // =====================================================

  const refreshDashboardStats = async () => {
    try {
      const response = await api.get(
        "/admin/dashboard"
      );

      if (response.data.success) {
        setDashboard(
          response.data.dashboard || null
        );
      }
    } catch (error) {
      console.error(
        "Refresh dashboard stats error:",
        error
      );
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
  // FORMAT MONEY
  // =====================================================

  const money = (value) => {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return "₹0";
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "₹0";
    }

    return `₹${number.toLocaleString("en-IN")}`;
  };

  // =====================================================
  // REAL STATS
  // =====================================================

  const stats = useMemo(() => {
    return {
      customers:
        dashboard?.totalCustomers ??
        customers.length,

      restaurants:
        dashboard?.totalRestaurants ??
        0,

      riders:
        dashboard?.totalRiders ??
        0,

      orders:
        dashboard?.totalOrders ??
        orders.length,

      sales:
        dashboard?.totalSales ??
        0,

      restaurantEarnings:
        dashboard?.restaurantEarnings ??
        0,

      riderEarnings:
        dashboard?.riderEarnings ??
        0,

      platformCommission:
        dashboard?.platformCommission ??
        0,

      platformFee:
        dashboard?.platformFee ??
        0,

      taxCollected:
        dashboard?.taxCollected ??
        0,

      superAdminRevenue:
        dashboard?.superAdminRevenue ??
        0,

      pendingRestaurantRequests:
        dashboard?.pendingRestaurantRequests ??
        restaurants.length,

      pendingRiderRequests:
        dashboard?.pendingRiderRequests ??
        riders.length,
    };
  }, [
    dashboard,
    customers.length,
    orders.length,
    restaurants.length,
    riders.length,
  ]);

  // =====================================================
  // STAT CARD
  // =====================================================

  const StatCard = ({
    title,
    value,
    icon,
    iconBg = "bg-orange-100",
    iconColor = "text-orange-600",
  }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            {title}
          </p>

          <p className="text-2xl font-bold text-gray-900 mt-2">
            {value}
          </p>
        </div>

        <div
          className={`w-12 h-12 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center text-xl`}
        >
          {icon}
        </div>
      </div>
    </div>
  );

  // =====================================================
  // SECTION BUTTON
  // =====================================================

  const NavButton = ({
    id,
    label,
    icon,
    count,
  }) => (
    <button
      onClick={() => setActiveSection(id)}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition ${
        activeSection === id
          ? "bg-orange-500 text-white"
          : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
      }`}
    >
      <span className="flex items-center gap-3">
        <span>{icon}</span>
        <span className="font-medium">
          {label}
        </span>
      </span>

      {count !== undefined && (
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            activeSection === id
              ? "bg-white/20 text-white"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );

  // =====================================================
  // DASHBOARD HOME
  // =====================================================

  const DashboardHome = () => (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Dashboard Overview
        </h2>

        <p className="text-gray-500 mt-1">
          Monitor your food delivery platform.
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Customers"
          value={stats.customers}
          icon="👤"
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />

        <StatCard
          title="Total Restaurants"
          value={stats.restaurants}
          icon="🏪"
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
        />

        <StatCard
          title="Approved Riders"
          value={stats.riders}
          icon="🛵"
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />

        <StatCard
          title="Total Orders"
          value={stats.orders}
          icon="📦"
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
      </div>

      {/* Financial */}
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        Financial Overview
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
        <StatCard
          title="Total Sales"
          value={money(stats.sales)}
          icon="💰"
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />

        <StatCard
          title="Platform Commission"
          value={money(stats.platformCommission)}
          icon="📊"
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />

        <StatCard
          title="Platform Fee"
          value={money(stats.platformFee)}
          icon="💳"
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />

        <StatCard
          title="Tax Collected"
          value={money(stats.taxCollected)}
          icon="🧾"
          iconBg="bg-yellow-100"
          iconColor="text-yellow-600"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">
        <StatCard
          title="Restaurant Earnings"
          value={money(stats.restaurantEarnings)}
          icon="🏪"
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
        />

        <StatCard
          title="Rider Payout"
          value={money(stats.riderEarnings)}
          icon="🛵"
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />

        <StatCard
          title="Super Admin Revenue"
          value={money(stats.superAdminRevenue)}
          icon="👑"
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
      </div>

      {/* Pending Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">
                Restaurant Requests
              </p>

              <h3 className="text-3xl font-bold text-gray-900 mt-1">
                {stats.pendingRestaurantRequests}
              </h3>
            </div>

            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center text-xl">
              🏪
            </div>
          </div>

          <button
            onClick={() =>
              setActiveSection("restaurants")
            }
            className="mt-5 w-full bg-orange-50 text-orange-600 py-3 rounded-xl font-semibold hover:bg-orange-100"
          >
            Review Restaurant Requests →
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">
                Rider Requests
              </p>

              <h3 className="text-3xl font-bold text-gray-900 mt-1">
                {stats.pendingRiderRequests}
              </h3>
            </div>

            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-xl">
              🛵
            </div>
          </div>

          <button
            onClick={() =>
              setActiveSection("riders")
            }
            className="mt-5 w-full bg-purple-50 text-purple-600 py-3 rounded-xl font-semibold hover:bg-purple-100"
          >
            Review Rider Requests →
          </button>
        </div>
      </div>
    </>
  );

  // =====================================================
  // RESTAURANT REQUESTS
  // =====================================================

  const RestaurantRequests = () => (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Restaurant Owner Requests
        </h2>

        <p className="text-gray-500 mt-1">
          Approve or reject restaurant registrations.
        </p>
      </div>

      {restaurants.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="text-5xl mb-4">
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
        <div className="space-y-5">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                <div>
                  <p className="text-sm text-gray-500">
                    Restaurant
                  </p>

                  <h3 className="text-xl font-bold text-gray-900">
                    {restaurant.restaurantName}
                  </h3>

                  <span className="inline-block mt-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                    {restaurant.status || "Pending"}
                  </span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      approveRestaurant(
                        restaurant._id
                      )
                    }
                    disabled={
                      actionId === restaurant._id
                    }
                    className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-5 py-2.5 rounded-xl font-semibold"
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
                    className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-5 py-2.5 rounded-xl font-semibold"
                  >
                    ✕ Reject
                  </button>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50 rounded-xl p-5 text-sm">
                <div>
                  <p className="text-gray-500">
                    Owner
                  </p>

                  <p className="font-medium mt-1">
                    {restaurant.owner?.name ||
                      "Restaurant Owner"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">
                    Email
                  </p>

                  <p className="font-medium mt-1 break-all">
                    {restaurant.email || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">
                    Phone
                  </p>

                  <p className="font-medium mt-1">
                    {restaurant.phone || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">
                    Address
                  </p>

                  <p className="font-medium mt-1">
                    {restaurant.address || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">
                    City
                  </p>

                  <p className="font-medium mt-1">
                    {restaurant.city || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">
                    State
                  </p>

                  <p className="font-medium mt-1">
                    {restaurant.state || "-"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  // =====================================================
  // RIDER REQUESTS
  // =====================================================

  const RiderRequests = () => (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Rider Requests
        </h2>

        <p className="text-gray-500 mt-1">
          Review and approve delivery rider registrations.
        </p>
      </div>

      {riders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="text-5xl mb-4">
            🛵
          </div>

          <h3 className="text-xl font-bold text-gray-900">
            No Pending Rider Requests
          </h3>

          <p className="text-gray-500 mt-2">
            New rider registration requests will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {riders.map((rider) => (
            <div
              key={rider._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-2xl">
                    🛵
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {rider.name || "Rider"}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {rider.email || "-"}
                    </p>
                  </div>
                </div>

                <span className="w-fit px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
                  {rider.riderRequestStatus ||
                    "Pending"}
                </span>
              </div>

              {/* Rider Details */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 rounded-xl p-5 text-sm">
                <div>
                  <p className="text-gray-500">
                    Phone
                  </p>

                  <p className="font-medium mt-1">
                    {rider.phone || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">
                    City
                  </p>

                  <p className="font-medium mt-1">
                    {rider.riderCity ||
                      rider.city ||
                      "-"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">
                    Vehicle Type
                  </p>

                  <p className="font-medium mt-1">
                    {rider.vehicleType || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">
                    Vehicle Number
                  </p>

                  <p className="font-medium mt-1">
                    {rider.vehicleNumber || "-"}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-gray-500">
                    Driving License
                  </p>

                  <p className="font-medium mt-1">
                    {rider.drivingLicenseNumber ||
                      "-"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">
                    Email Verification
                  </p>

                  <p
                    className={`font-semibold mt-1 ${
                      rider.isVerified
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {rider.isVerified
                      ? "Verified"
                      : "Not Verified"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">
                    Account Status
                  </p>

                  <p className="font-semibold mt-1 capitalize">
                    {rider.status || "-"}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  onClick={() =>
                    approveRider(rider._id)
                  }
                  disabled={
                    actionId === rider._id ||
                    !rider.isVerified
                  }
                  title={
                    !rider.isVerified
                      ? "Rider must verify email first"
                      : ""
                  }
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-3 rounded-xl"
                >
                  {actionId === rider._id
                    ? "Processing..."
                    : !rider.isVerified
                    ? "Email Not Verified"
                    : "✓ Approve Rider"}
                </button>

                <button
                  onClick={() =>
                    rejectRider(rider._id)
                  }
                  disabled={
                    actionId === rider._id
                  }
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold py-3 rounded-xl"
                >
                  {actionId === rider._id
                    ? "Processing..."
                    : "✕ Reject Rider"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  // =====================================================
  // CUSTOMERS
  // =====================================================

  const Customers = () => (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Customers
        </h2>

        <p className="text-gray-500 mt-1">
          Customer management.
        </p>
      </div>

      {customers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="text-5xl mb-4">
            👤
          </div>

          <h3 className="text-xl font-bold">
            No Customer Data
          </h3>

          <p className="text-gray-500 mt-2">
            Customer records will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4">
                  Name
                </th>

                <th className="text-left p-4">
                  Email
                </th>

                <th className="text-left p-4">
                  Phone
                </th>

                <th className="text-left p-4">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {customers.map((customer) => (
                <tr
                  key={customer._id}
                  className="border-t"
                >
                  <td className="p-4 font-medium">
                    {customer.name || "-"}
                  </td>

                  <td className="p-4">
                    {customer.email || "-"}
                  </td>

                  <td className="p-4">
                    {customer.phone || "-"}
                  </td>

                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700">
                      {customer.status ||
                        "Active"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );

  // =====================================================
  // ORDERS
  // =====================================================

  const Orders = () => (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Orders
        </h2>

        <p className="text-gray-500 mt-1">
          Monitor all platform orders.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="text-5xl mb-4">
            📦
          </div>

          <h3 className="text-xl font-bold">
            No Order Data
          </h3>

          <p className="text-gray-500 mt-2">
            Orders will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm min-w-[1100px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">
                  Order
                </th>

                <th className="p-4 text-left">
                  Customer
                </th>

                <th className="p-4 text-left">
                  Restaurant
                </th>

                <th className="p-4 text-left">
                  Rider
                </th>

                <th className="p-4 text-left">
                  Food Amount
                </th>

                <th className="p-4 text-left">
                  Delivery Fee
                </th>

                <th className="p-4 text-left">
                  Commission
                </th>

                <th className="p-4 text-left">
                  Platform Fee
                </th>

                <th className="p-4 text-left">
                  Tax
                </th>

                <th className="p-4 text-left">
                  Final Amount
                </th>

                <th className="p-4 text-left">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr
                  key={order._id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="p-4 font-medium">
                    #{order._id?.slice(-6)}
                  </td>

                  <td className="p-4">
                    {order.user?.name ||
                      order.customer?.name ||
                      "-"}
                  </td>

                  <td className="p-4">
                    {order.restaurant?.restaurantName ||
                      order.restaurant?.name ||
                      "-"}
                  </td>

                  <td className="p-4">
                    {order.rider?.name || "-"}
                  </td>

                  <td className="p-4 font-semibold">
                    {money(order.totalAmount)}
                  </td>

                  <td className="p-4">
                    {money(order.deliveryFee)}
                  </td>

                  <td className="p-4">
                    {money(
                      order.platformCommission
                    )}
                  </td>

                  <td className="p-4">
                    {money(order.platformFee)}
                  </td>

                  <td className="p-4">
                    {money(order.taxAmount)}
                  </td>

                  <td className="p-4 font-semibold text-green-700">
                    {money(order.finalAmount)}
                  </td>

                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
                      {order.orderStatus ||
                        "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );

  // =====================================================
  // REVENUE
  // =====================================================

  const Revenue = () => (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Revenue & Financial Summary
        </h2>

        <p className="text-gray-500 mt-1">
          Track platform earnings separately from tax and payouts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <StatCard
          title="Total Sales"
          value={money(stats.sales)}
          icon="💰"
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />

        <StatCard
          title="Restaurant Earnings"
          value={money(stats.restaurantEarnings)}
          icon="🏪"
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
        />

        <StatCard
          title="Rider Payout"
          value={money(stats.riderEarnings)}
          icon="🛵"
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />

        <StatCard
          title="Platform Commission"
          value={money(stats.platformCommission)}
          icon="📊"
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />

        <StatCard
          title="Platform Fee"
          value={money(stats.platformFee)}
          icon="💳"
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />

        <StatCard
          title="Tax Collected"
          value={money(stats.taxCollected)}
          icon="🧾"
          iconBg="bg-yellow-100"
          iconColor="text-yellow-600"
        />

        <StatCard
          title="Super Admin Revenue"
          value={money(stats.superAdminRevenue)}
          icon="👑"
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-5">
        <h3 className="font-bold text-blue-900">
          Financial Rule
        </h3>

        <p className="text-sm text-blue-800 mt-2">
          Tax collected is shown separately and is not
          automatically counted as Super Admin profit.
          Platform Commission and Platform Fee represent
          platform earnings.
        </p>
      </div>
    </>
  );

  // =====================================================
  // ACTIVE CONTENT
  // =====================================================

  const renderContent = () => {
    switch (activeSection) {
      case "restaurants":
        return <RestaurantRequests />;

      case "riders":
        return <RiderRequests />;

      case "customers":
        return <Customers />;

      case "orders":
        return <Orders />;

      case "revenue":
        return <Revenue />;

      default:
        return <DashboardHome />;
    }
  };

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ================= TOP NAVBAR ================= */}

      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 lg:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white text-xl">
              🍔
            </div>

            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Foodie
              </h1>

              <p className="text-xs text-gray-500">
                Super Admin Panel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-gray-900">
                Super Admin
              </p>

              <p className="text-xs text-green-600">
                ● Active
              </p>
            </div>

            <button
              onClick={logout}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* ================= LAYOUT ================= */}

      <div className="flex">
        {/* ================= SIDEBAR ================= */}

        <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] p-4 sticky top-[73px]">
          <div className="space-y-2">
            <NavButton
              id="dashboard"
              label="Dashboard"
              icon="📊"
            />

            <NavButton
              id="restaurants"
              label="Restaurant Requests"
              icon="🏪"
              count={stats.pendingRestaurantRequests}
            />

            <NavButton
              id="riders"
              label="Rider Requests"
              icon="🛵"
              count={stats.pendingRiderRequests}
            />

            <NavButton
              id="customers"
              label="Customers"
              icon="👤"
              count={customers.length}
            />

            <NavButton
              id="orders"
              label="Orders"
              icon="📦"
              count={orders.length}
            />

            <NavButton
              id="revenue"
              label="Revenue"
              icon="💰"
            />
          </div>

          <div className="mt-8 pt-6 border-t">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl">
              ⚙️
              <span className="font-medium">
                Settings
              </span>
            </button>
          </div>
        </aside>

        {/* ================= MAIN ================= */}

        <main className="flex-1 min-w-0">
          {/* Mobile navigation */}

          <div className="lg:hidden bg-white border-b p-3 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              <button
                onClick={() =>
                  setActiveSection("dashboard")
                }
                className="px-4 py-2 bg-orange-50 text-orange-600 rounded-lg font-medium"
              >
                📊 Dashboard
              </button>

              <button
                onClick={() =>
                  setActiveSection("restaurants")
                }
                className="px-4 py-2 bg-orange-50 text-orange-600 rounded-lg font-medium"
              >
                🏪 Restaurants
              </button>

              <button
                onClick={() =>
                  setActiveSection("riders")
                }
                className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg font-medium"
              >
                🛵 Riders
              </button>

              <button
                onClick={() =>
                  setActiveSection("customers")
                }
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium"
              >
                👤 Customers
              </button>

              <button
                onClick={() =>
                  setActiveSection("orders")
                }
                className="px-4 py-2 bg-green-50 text-green-600 rounded-lg font-medium"
              >
                📦 Orders
              </button>

              <button
                onClick={() =>
                  setActiveSection("revenue")
                }
                className="px-4 py-2 bg-yellow-50 text-yellow-600 rounded-lg font-medium"
              >
                💰 Revenue
              </button>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl">
                {error}
              </div>
            )}

            {loading ? (
              <div className="bg-white rounded-2xl p-16 text-center">
                <div className="text-4xl mb-4">
                  🍔
                </div>

                <p className="text-gray-500">
                  Loading admin dashboard...
                </p>
              </div>
            ) : (
              renderContent()
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
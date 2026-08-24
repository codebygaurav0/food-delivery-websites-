import { BrowserRouter, Routes, Route } from "react-router-dom";

// ================= CUSTOMER =================
import Login from "./pages/customer/Login";
import Signup from "./pages/customer/Signup";
import VerifyOtp from "./pages/customer/VerifyOtp";
import Home from "./pages/customer/Home";
import RestaurantMenu from "./pages/customer/RestaurantMenu";
import Cart from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";
import MyOrders from "./pages/customer/MyOrders";

// ================= RESTAURANT OWNER =================
import RestaurantDashboard from "./pages/restaurant/Dashboard";
import RestaurantFoods from "./pages/restaurant/Foods";
import RestaurantOrders from "./pages/restaurant/Orders";
import RegisterRestaurant from "./pages/restaurant/Register";
import RestaurantOwnerSignup from "./pages/restaurant/RestaurantOwnerSignup";

// ================= ADMIN =================
import AdminDashboard from "./pages/admin/Dashboard";

// ================= RIDER =================
import RiderSignup from "./pages/rider/Signup";
import RiderDashboard from "./pages/rider/Dashboard";
import AvailableOrders from "./pages/rider/AvailableOrders";
import MyDeliveries from "./pages/rider/MyDeliveries";
import RiderEarnings from "./pages/rider/Earnings";
import RiderProfile from "./pages/rider/Profile";

// ================= PROTECTED ROUTE =================
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =====================================================
            CUSTOMER
        ===================================================== */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        {/* ================= EMAIL OTP ================= */}

        <Route
          path="/verify-otp"
          element={<VerifyOtp />}
        />

        {/* ================= RESTAURANT MENU ================= */}

        <Route
          path="/restaurant/:restaurantId"
          element={<RestaurantMenu />}
        />

        {/* =====================================================
            CUSTOMER CART
        ===================================================== */}

        <Route
          path="/cart"
          element={
            <ProtectedRoute
              roles={["customer", "user"]}
            >
              <Cart />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            CUSTOMER CHECKOUT
        ===================================================== */}

        <Route
          path="/checkout"
          element={
            <ProtectedRoute
              roles={["customer", "user"]}
            >
              <Checkout />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            CUSTOMER ORDERS
        ===================================================== */}

        <Route
          path="/orders"
          element={
            <ProtectedRoute
              roles={["customer", "user"]}
            >
              <MyOrders />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            RESTAURANT OWNER SIGNUP
        ===================================================== */}

        <Route
          path="/restaurant-owner/signup"
          element={<RestaurantOwnerSignup />}
        />

        {/* =====================================================
            RESTAURANT OWNER DASHBOARD
        ===================================================== */}

        <Route
          path="/restaurant/dashboard"
          element={
            <ProtectedRoute
              roles={["restaurantOwner"]}
            >
              <RestaurantDashboard />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            RESTAURANT REGISTER
        ===================================================== */}

        <Route
          path="/restaurant/register"
          element={
            <ProtectedRoute
              roles={["restaurantOwner"]}
            >
              <RegisterRestaurant />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            RESTAURANT FOODS
        ===================================================== */}

        <Route
          path="/restaurant/foods"
          element={
            <ProtectedRoute
              roles={["restaurantOwner"]}
            >
              <RestaurantFoods />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            RESTAURANT ORDERS
        ===================================================== */}

        <Route
          path="/restaurant/orders"
          element={
            <ProtectedRoute
              roles={["restaurantOwner"]}
            >
              <RestaurantOrders />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            ADMIN
        ===================================================== */}

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute
              roles={["admin", "superAdmin"]}
            >
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            RIDER SIGNUP
        ===================================================== */}

        <Route
          path="/rider/signup"
          element={<RiderSignup />}
        />

        {/* =====================================================
            RIDER DASHBOARD
        ===================================================== */}

        <Route
          path="/rider/dashboard"
          element={
            <ProtectedRoute
              roles={["rider"]}
            >
              <RiderDashboard />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            RIDER AVAILABLE ORDERS
        ===================================================== */}

        <Route
          path="/rider/available-orders"
          element={
            <ProtectedRoute
              roles={["rider"]}
            >
              <AvailableOrders />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            RIDER MY DELIVERIES
        ===================================================== */}

        <Route
          path="/rider/deliveries"
          element={
            <ProtectedRoute
              roles={["rider"]}
            >
              <MyDeliveries />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            RIDER EARNINGS
        ===================================================== */}

        <Route
          path="/rider/earnings"
          element={
            <ProtectedRoute
              roles={["rider"]}
            >
              <RiderEarnings />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            RIDER PROFILE
        ===================================================== */}

        <Route
          path="/rider/profile"
          element={
            <ProtectedRoute
              roles={["rider"]}
            >
              <RiderProfile />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            UNAUTHORIZED
        ===================================================== */}

        <Route
          path="/unauthorized"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10 text-center max-w-md w-full">

                <div className="text-6xl mb-5">
                  🚫
                </div>

                <h1 className="text-2xl font-bold text-gray-900">
                  Access Denied
                </h1>

                <p className="text-gray-500 mt-2">
                  You are not authorized to view this page.
                </p>

                <div className="flex justify-center gap-3 mt-6">

                  <button
                    onClick={() => window.history.back()}
                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition"
                  >
                    Go Back
                  </button>

                  <button
                    onClick={() => {
                      window.location.href = "/";
                    }}
                    className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition"
                  >
                    Home
                  </button>

                </div>

              </div>
            </div>
          }
        />

        {/* =====================================================
            404
        ===================================================== */}

        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
              <div className="text-center">

                <div className="text-6xl mb-4">
                  🔍
                </div>

                <h1 className="text-4xl font-bold text-gray-900">
                  404
                </h1>

                <p className="text-gray-500 mt-2">
                  Page not found.
                </p>

                <button
                  onClick={() => {
                    window.location.href = "/";
                  }}
                  className="mt-6 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition"
                >
                  Go Home
                </button>

              </div>
            </div>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
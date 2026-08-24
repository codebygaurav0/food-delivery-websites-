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

        <Route
          path="/restaurant/:restaurantId"
          element={<RestaurantMenu />}
        />

        <Route
          path="/cart"
          element={<Cart />}
        />

        <Route
          path="/checkout"
          element={<Checkout />}
        />

        <Route
          path="/orders"
          element={<MyOrders />}
        />


        {/* =====================================================
            RESTAURANT OWNER SIGNUP
        ===================================================== */}

        <Route
          path="/restaurant-owner/signup"
          element={<RestaurantOwnerSignup />}
        />


        {/* =====================================================
            RESTAURANT OWNER
        ===================================================== */}

        <Route
          path="/restaurant/dashboard"
          element={
            <ProtectedRoute roles={["restaurantOwner"]}>
              <RestaurantDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/restaurant/register"
          element={
            <ProtectedRoute roles={["restaurantOwner"]}>
              <RegisterRestaurant />
            </ProtectedRoute>
          }
        />

        <Route
          path="/restaurant/foods"
          element={
            <ProtectedRoute roles={["restaurantOwner"]}>
              <RestaurantFoods />
            </ProtectedRoute>
          }
        />

        <Route
          path="/restaurant/orders"
          element={
            <ProtectedRoute roles={["restaurantOwner"]}>
              <RestaurantOrders />
            </ProtectedRoute>
          }
        />


        {/* =====================================================
            SUPER ADMIN
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
            UNAUTHORIZED
        ===================================================== */}

        <Route
          path="/unauthorized"
          element={
            <div className="min-h-screen flex items-center justify-center p-10 text-center bg-gray-50">
              <div>

                <div className="text-6xl mb-4">
                  🚫
                </div>

                <h1 className="text-2xl font-bold text-gray-900">
                  Access Denied
                </h1>

                <p className="text-gray-500 mt-2">
                  You are not authorized to view this page.
                </p>

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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">

                <div className="text-6xl mb-4">
                  🔍
                </div>

                <h1 className="text-3xl font-bold text-gray-900">
                  404
                </h1>

                <p className="text-gray-500 mt-2">
                  Page not found.
                </p>

              </div>
            </div>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
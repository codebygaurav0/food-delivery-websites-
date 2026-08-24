import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await api.get("/cart");

      if (response.data.success) {
        setCart(response.data.cart);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setCart(null);
      } else {
        setError(
          error.response?.data?.message ||
            "Unable to load cart"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (foodId, quantity) => {
    if (quantity < 1) {
      removeItem(foodId);
      return;
    }

    try {
      const response = await api.put(
        `/cart/update/${foodId}`,
        {
          quantity,
        }
      );

      if (response.data.success) {
        setCart(response.data.cart);
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to update quantity"
      );
    }
  };

  const removeItem = async (foodId) => {
    try {
      const response = await api.delete(
        `/cart/remove/${foodId}`
      );

      if (response.data.success) {
        if (response.data.cart) {
          setCart(response.data.cart);
        } else {
          setCart(null);
        }
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to remove item"
      );
    }
  };

  const clearCart = async () => {
    const confirmClear = window.confirm(
      "Are you sure you want to clear your cart?"
    );

    if (!confirmClear) return;

    try {
      const response = await api.delete("/cart/clear");

      if (response.data.success) {
        setCart(null);
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to clear cart"
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">
          Loading cart...
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
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <span className="text-3xl">
              🍔
            </span>

            <span className="text-2xl font-bold text-orange-500">
              Foodie
            </span>
          </button>

          <button
            onClick={() => navigate("/orders")}
            className="px-4 py-2 bg-orange-50 text-orange-600 rounded-lg font-medium"
          >
            📦 My Orders
          </button>

        </div>

      </nav>

      <main className="max-w-5xl mx-auto px-4 py-10">

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-gray-900">
            Your Cart
          </h1>

          <p className="text-gray-500 mt-1">
            Review your items before checkout.
          </p>

        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl">
            {error}
          </div>
        )}

        {!cart || cart.items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">

            <div className="text-7xl mb-5">
              🛒
            </div>

            <h2 className="text-2xl font-bold">
              Your cart is empty
            </h2>

            <p className="text-gray-500 mt-2">
              Add some delicious food to your cart.
            </p>

            <button
              onClick={() => navigate("/")}
              className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl"
            >
              Explore Restaurants
            </button>

          </div>
        ) : (
          <>
            {/* Restaurant */}
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 mb-6">

              <p className="text-sm text-gray-500">
                Restaurant
              </p>

              <h2 className="text-xl font-bold text-gray-900 mt-1">
                {cart.restaurant?.restaurantName}
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                📍 {cart.restaurant?.city}
              </p>

            </div>

            {/* Cart Items */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

              <div className="divide-y divide-gray-100">

                {cart.items.map((item) => (

                  <div
                    key={item.food._id}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-5"
                  >

                    {/* Food */}
                    <div className="flex items-center gap-4">

                      <div className="w-20 h-20 rounded-xl bg-orange-100 flex items-center justify-center text-4xl overflow-hidden">

                        {item.food.image ? (
                          <img
                            src={item.food.image}
                            alt={item.food.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          "🍛"
                        )}

                      </div>

                      <div>

                        <h3 className="font-bold text-lg">
                          {item.food.name}
                        </h3>

                        <p className="text-sm text-gray-500">
                          {item.food.category}
                        </p>

                        <p className="text-orange-500 font-semibold mt-1">
                          ₹{item.price}
                        </p>

                      </div>

                    </div>

                    {/* Quantity */}
                    <div className="flex items-center gap-5">

                      <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">

                        <button
                          onClick={() =>
                            updateQuantity(
                              item.food._id,
                              item.quantity - 1
                            )
                          }
                          className="px-4 py-2 hover:bg-gray-100 text-lg"
                        >
                          −
                        </button>

                        <span className="px-4 font-semibold">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            updateQuantity(
                              item.food._id,
                              item.quantity + 1
                            )
                          }
                          className="px-4 py-2 hover:bg-gray-100 text-lg"
                        >
                          +
                        </button>

                      </div>

                      <div className="text-right">

                        <p className="font-bold text-lg">
                          ₹
                          {item.price *
                            item.quantity}
                        </p>

                        <button
                          onClick={() =>
                            removeItem(
                              item.food._id
                            )
                          }
                          className="text-sm text-red-500 hover:text-red-600 mt-1"
                        >
                          Remove
                        </button>

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            </div>

            {/* Summary */}
            <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

              <div className="flex justify-between items-center">

                <div>

                  <p className="text-gray-500">
                    Total Amount
                  </p>

                  <p className="text-3xl font-bold text-orange-500 mt-1">
                    ₹{cart.totalAmount}
                  </p>

                </div>

                <button
                  onClick={() =>
                    navigate("/checkout")
                  }
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-xl"
                >
                  Proceed to Checkout →
                </button>

              </div>

              <button
                onClick={clearCart}
                className="mt-5 text-red-500 text-sm font-medium hover:text-red-600"
              >
                Clear Cart
              </button>

            </div>

          </>
        )}

      </main>

    </div>
  );
}

export default Cart;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import api from "../../services/api";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const defaultCenter = [20.5937, 78.9629];

function MapCenter({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, Math.max(map.getZoom(), 15));
    }
  }, [map, position]);

  return null;
}

function Checkout() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);

  const [deliveryAddress, setDeliveryAddress] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("COD");

  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] =
    useState(false);

  const [error, setError] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [reverseGeocoding, setReverseGeocoding] = useState(false);

  const fetchCart = async () => {
    try {
      const response = await api.get("/cart");

      if (response.data.success) {
        setCart(response.data.cart);
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load cart"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(fetchCart);
  }, []);

  const reverseGeocode = async (latitude, longitude) => {
    setReverseGeocoding(true);
    setError("");

    try {
      const response = await api.get("/location/reverse-geocode", {
        params: { lat: latitude, lon: longitude },
      });

      if (!response.data.success || !response.data.address) {
        throw new Error("No readable address returned");
      }

      setDeliveryAddress(response.data.address);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to find a readable address. You can enter it manually."
      );
    } finally {
      setReverseGeocoding(false);
    }
  };

  const selectLocation = async (latitude, longitude) => {
    setDeliveryLocation({ latitude, longitude });
    await reverseGeocode(latitude, longitude);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Location is not supported by this browser. Enter your address manually.");
      return;
    }

    setGettingLocation(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setGettingLocation(false);
        selectLocation(coords.latitude, coords.longitude);
      },
      (locationError) => {
        setGettingLocation(false);

        const messages = {
          1: "Location permission was denied. Allow location access or enter your address manually.",
          2: "Your location is unavailable. Check your device settings or enter your address manually.",
          3: "Location request timed out. Try again or enter your address manually.",
        };

        setError(messages[locationError.code] || "Unable to get your current location.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const placeOrder = async (e) => {
    e.preventDefault();

    if (!deliveryAddress.trim()) {
      setError("Please enter delivery address.");
      return;
    }

    if (!deliveryLocation) {
      setError("Please select a delivery location on the map before placing the order.");
      return;
    }
    if (!cart || cart.items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    try {
      setError("");
      setPlacingOrder(true);

      const response = await api.post(
        "/order/place",
        {
          deliveryAddress,
          deliveryLocation,
          paymentMethod,
        }
      );

      if (response.data.success) {
        alert("Order placed successfully!");

        navigate("/orders");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to place order"
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">
          Loading checkout...
        </p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">

        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4">

            <button
              onClick={() => navigate("/")}
              className="text-2xl font-bold text-orange-500"
            >
              🍔 Foodie
            </button>

          </div>
        </nav>

        <div className="max-w-xl mx-auto px-4 py-20 text-center">

          <div className="text-7xl mb-5">
            🛒
          </div>

          <h1 className="text-2xl font-bold">
            Your cart is empty
          </h1>

          <p className="text-gray-500 mt-2">
            Add some food before checkout.
          </p>

          <button
            onClick={() => navigate("/")}
            className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl"
          >
            Browse Restaurants
          </button>

        </div>

      </div>
    );
  }

  const mapPosition = deliveryLocation
    ? [deliveryLocation.latitude, deliveryLocation.longitude]
    : defaultCenter;

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
            onClick={() => navigate("/cart")}
            className="px-4 py-2 bg-orange-50 text-orange-600 rounded-lg font-medium"
          >
            ← Back to Cart
          </button>

        </div>

      </nav>

      <main className="max-w-6xl mx-auto px-4 py-10">

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-gray-900">
            Checkout
          </h1>

          <p className="text-gray-500 mt-1">
            Complete your order details.
          </p>

        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Checkout Form */}
          <div className="lg:col-span-2">

            <form
              onSubmit={placeOrder}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
            >

              {/* Delivery Address */}
              <div className="mb-8">

                <h2 className="text-xl font-bold">
                  Delivery Address
                </h2>

                <p className="text-gray-500 text-sm mt-1 mb-4">
                  Select a map location, then edit the address if needed.
                </p>

                <button
                  type="button"
                  onClick={useCurrentLocation}
                  disabled={gettingLocation || reverseGeocoding}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold px-5 py-3 rounded-xl"
                >
                  {gettingLocation ? "Getting location..." : "📍 Use Current Location"}
                </button>

                {deliveryLocation && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-sm text-gray-600">
                    <p>Latitude: {deliveryLocation.latitude.toFixed(6)}</p>
                    <p>Longitude: {deliveryLocation.longitude.toFixed(6)}</p>
                  </div>
                )}

                <div className="mt-5 overflow-hidden rounded-xl border border-gray-200">
                  <MapContainer
                    center={mapPosition}
                    zoom={deliveryLocation ? 15 : 4}
                    scrollWheelZoom
                    className="h-80 w-full"
                  >
                    <TileLayer
                      attribution="&copy; OpenStreetMap contributors"
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapCenter position={deliveryLocation ? mapPosition : null} />
                    {deliveryLocation && (
                      <Marker
                        position={mapPosition}
                        draggable
                        eventHandlers={{
                          dragend: (event) => {
                            const position = event.target.getLatLng();
                            selectLocation(position.lat, position.lng);
                          },
                        }}
                      >
                        <Popup>Drag this marker to adjust delivery location.</Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </div>

                <textarea
                  value={deliveryAddress}
                  onChange={(e) =>
                    setDeliveryAddress(
                      e.target.value
                    )
                  }
                  placeholder="Enter complete delivery address"
                  rows="4"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none resize-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />

              </div>

              {/* Payment */}
              <div>

                <h2 className="text-xl font-bold">
                  Payment Method
                </h2>

                <p className="text-gray-500 text-sm mt-1 mb-4">
                  Select your preferred payment method.
                </p>

                <label
                  className={`flex items-center gap-4 border rounded-xl p-4 cursor-pointer ${
                    paymentMethod === "COD"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200"
                  }`}
                >

                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={
                      paymentMethod === "COD"
                    }
                    onChange={(e) =>
                      setPaymentMethod(
                        e.target.value
                      )
                    }
                    className="w-5 h-5 accent-orange-500"
                  />

                  <div>

                    <p className="font-semibold">
                      💵 Cash on Delivery
                    </p>

                    <p className="text-sm text-gray-500">
                      Pay when your order arrives.
                    </p>

                  </div>

                </label>

              </div>

              {/* Place Order */}
              <button
                type="submit"
                disabled={placingOrder || reverseGeocoding}
                className="w-full mt-8 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-4 rounded-xl transition"
              >
                {placingOrder
                  ? "Placing Order..."
                  : `Place Order • ₹${cart.totalAmount}`}
              </button>

            </form>

          </div>

          {/* Order Summary */}
          <div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-6">

              <h2 className="text-xl font-bold mb-5">
                Order Summary
              </h2>

              {/* Restaurant */}
              <div className="bg-orange-50 rounded-xl p-4 mb-5">

                <p className="text-sm text-gray-500">
                  Restaurant
                </p>

                <p className="font-bold mt-1">
                  {cart.restaurant?.restaurantName}
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  📍 {cart.restaurant?.city}
                </p>

              </div>

              {/* Items */}
              <div className="space-y-4">

                {cart.items.map((item) => (

                  <div
                    key={item.food._id}
                    className="flex justify-between gap-4"
                  >

                    <div>

                      <p className="font-medium">
                        {item.food.name}
                      </p>

                      <p className="text-sm text-gray-500">
                        {item.quantity} × ₹
                        {item.price}
                      </p>

                    </div>

                    <p className="font-semibold">
                      ₹
                      {item.price *
                        item.quantity}
                    </p>

                  </div>

                ))}

              </div>

              <div className="border-t border-gray-200 mt-6 pt-5">

                <div className="flex justify-between text-lg">

                  <span className="font-semibold">
                    Total
                  </span>

                  <span className="font-bold text-orange-500">
                    ₹{cart.totalAmount}
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Checkout;
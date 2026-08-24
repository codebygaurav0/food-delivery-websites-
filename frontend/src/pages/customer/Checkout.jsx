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

// =====================================================
// LEAFLET ICON
// =====================================================

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// =====================================================
// DEFAULT MAP CENTER
// =====================================================

const defaultCenter = [20.5937, 78.9629];

// =====================================================
// BILL CONFIGURATION
// MUST MATCH BACKEND
// =====================================================

const TAX_RATE = 0.05;
const PLATFORM_FEE = 20;

const DELIVERY_BASE_FEE = 20;
const DELIVERY_PER_KM = 8;

// =====================================================
// MAP CENTER
// =====================================================

function MapCenter({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(
        position,
        Math.max(map.getZoom(), 15)
      );
    }
  }, [map, position]);

  return null;
}

// =====================================================
// CHECKOUT
// =====================================================

function Checkout() {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [cart, setCart] = useState(null);

  const [deliveryAddress, setDeliveryAddress] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("COD");

  const [deliveryLocation, setDeliveryLocation] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [placingOrder, setPlacingOrder] =
    useState(false);

  const [gettingLocation, setGettingLocation] =
    useState(false);

  const [reverseGeocoding, setReverseGeocoding] =
    useState(false);

  const [error, setError] =
    useState("");

  // =====================================================
  // MONEY
  // =====================================================

  const money = (value) => {
    return `₹${Number(value || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  // =====================================================
  // ROUND MONEY
  // =====================================================

  const roundMoney = (value) => {
    return (
      Math.round(
        (Number(value) + Number.EPSILON) * 100
      ) / 100
    );
  };

  // =====================================================
  // DISTANCE CALCULATION
  // =====================================================

  const calculateDistanceKm = (
    latitude1,
    longitude1,
    latitude2,
    longitude2
  ) => {
    const toRadians = (degree) =>
      (degree * Math.PI) / 180;

    const earthRadiusKm = 6371;

    const dLat = toRadians(
      latitude2 - latitude1
    );

    const dLon = toRadians(
      longitude2 - longitude1
    );

    const lat1 = toRadians(latitude1);
    const lat2 = toRadians(latitude2);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(dLon / 2) ** 2;

    const c =
      2 *
      Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
      );

    return earthRadiusKm * c;
  };

  // =====================================================
  // GET RESTAURANT COORDINATES
  // =====================================================

  const getRestaurantCoordinates = (
    restaurant
  ) => {
    const latitudeCandidates = [
      restaurant?.latitude,
      restaurant?.location?.latitude,
      restaurant?.location?.lat,
      restaurant?.coordinates?.latitude,
      restaurant?.coordinates?.lat,
    ];

    const longitudeCandidates = [
      restaurant?.longitude,
      restaurant?.location?.longitude,
      restaurant?.location?.lon,
      restaurant?.coordinates?.longitude,
      restaurant?.coordinates?.lon,
    ];

    const latitude =
      latitudeCandidates.find(
        (value) =>
          value !== undefined &&
          value !== null &&
          Number.isFinite(Number(value))
      );

    const longitude =
      longitudeCandidates.find(
        (value) =>
          value !== undefined &&
          value !== null &&
          Number.isFinite(Number(value))
      );

    if (
      latitude === undefined ||
      longitude === undefined
    ) {
      return null;
    }

    return {
      latitude: Number(latitude),
      longitude: Number(longitude),
    };
  };

  // =====================================================
  // CALCULATE BILL
  // =====================================================

  const calculateBill = () => {
    const foodTotal = roundMoney(
      Number(cart?.totalAmount || 0)
    );

    // ---------------------------------------------------
    // Restaurant coordinates
    // ---------------------------------------------------

    const restaurantCoordinates =
      getRestaurantCoordinates(
        cart?.restaurant
      );

    // ---------------------------------------------------
    // Distance
    // ---------------------------------------------------

    let distanceKm = 0;

    if (
      restaurantCoordinates &&
      deliveryLocation
    ) {
      distanceKm = roundMoney(
        calculateDistanceKm(
          restaurantCoordinates.latitude,
          restaurantCoordinates.longitude,
          Number(
            deliveryLocation.latitude
          ),
          Number(
            deliveryLocation.longitude
          )
        )
      );
    }

    // ---------------------------------------------------
    // Delivery Fee
    // ---------------------------------------------------

    const deliveryFee = roundMoney(
      DELIVERY_BASE_FEE +
        distanceKm * DELIVERY_PER_KM
    );

    // ---------------------------------------------------
    // Platform Fee
    // ---------------------------------------------------

    const platformFee = PLATFORM_FEE;

    // ---------------------------------------------------
    // Tax
    // ---------------------------------------------------

    const taxableAmount =
      foodTotal +
      deliveryFee +
      platformFee;

    const taxAmount = roundMoney(
      taxableAmount * TAX_RATE
    );

    // ---------------------------------------------------
    // Final Amount
    // ---------------------------------------------------

    const finalAmount = roundMoney(
      foodTotal +
        deliveryFee +
        platformFee +
        taxAmount
    );

    return {
      foodTotal,
      distanceKm,
      deliveryFee,
      platformFee,
      taxAmount,
      finalAmount,
    };
  };

  const bill = calculateBill();

  // =====================================================
  // FETCH CART
  // =====================================================

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/cart");

      console.log(
        "========== CART RESPONSE =========="
      );

      console.log(response.data);

      if (response.data?.success) {
        setCart(response.data.cart);
      } else {
        setError(
          response.data?.message ||
            "Unable to load cart"
        );
      }
    } catch (error) {
      console.error(
        "Fetch Cart Error:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load cart"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchCart();
  }, []);

  // =====================================================
  // REVERSE GEOCODING
  // =====================================================

  const reverseGeocode = async (
    latitude,
    longitude
  ) => {
    setReverseGeocoding(true);
    setError("");

    try {
      const response = await api.get(
        "/location/reverse-geocode",
        {
          params: {
            lat: latitude,
            lon: longitude,
          },
        }
      );

      console.log(
        "Reverse Geocode Response:",
        response.data
      );

      if (
        !response.data?.success ||
        !response.data?.address
      ) {
        throw new Error(
          "No readable address returned"
        );
      }

      setDeliveryAddress(
        response.data.address
      );
    } catch (requestError) {
      console.error(
        "Reverse Geocode Error:",
        requestError.response?.data ||
          requestError
      );

      setError(
        requestError.response?.data?.message ||
          "Unable to find a readable address. You can enter it manually."
      );
    } finally {
      setReverseGeocoding(false);
    }
  };

  // =====================================================
  // SELECT LOCATION
  // =====================================================

  const selectLocation = async (
    latitude,
    longitude
  ) => {
    const lat = Number(latitude);
    const lon = Number(longitude);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon)
    ) {
      setError(
        "Invalid map location. Please select the location again."
      );

      return;
    }

    if (
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
    ) {
      setError(
        "Invalid latitude or longitude."
      );

      return;
    }

    setDeliveryLocation({
      latitude: lat,
      longitude: lon,
    });

    await reverseGeocode(lat, lon);
  };

  // =====================================================
  // CURRENT LOCATION
  // =====================================================

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError(
        "Location is not supported by this browser. Enter your address manually."
      );

      return;
    }

    setGettingLocation(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setGettingLocation(false);

        selectLocation(
          coords.latitude,
          coords.longitude
        );
      },

      (locationError) => {
        setGettingLocation(false);

        const messages = {
          1:
            "Location permission was denied. Allow location access or enter your address manually.",

          2:
            "Your location is unavailable. Check your device settings or enter your address manually.",

          3:
            "Location request timed out. Try again or enter your address manually.",
        };

        setError(
          messages[locationError.code] ||
            "Unable to get your current location."
        );
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  // =====================================================
  // PLACE ORDER
  // =====================================================

  const placeOrder = async (e) => {
    e.preventDefault();

    setError("");

    // ---------------------------------------------------
    // ADDRESS VALIDATION
    // ---------------------------------------------------

    if (!deliveryAddress.trim()) {
      setError(
        "Please enter delivery address."
      );

      return;
    }

    // ---------------------------------------------------
    // LOCATION VALIDATION
    // ---------------------------------------------------

    if (!deliveryLocation) {
      setError(
        "Please select a delivery location on the map before placing the order."
      );

      return;
    }

    const latitude = Number(
      deliveryLocation.latitude
    );

    const longitude = Number(
      deliveryLocation.longitude
    );

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      setError(
        "Invalid delivery coordinates. Please select your location again."
      );

      return;
    }

    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      setError(
        "Invalid delivery latitude or longitude."
      );

      return;
    }

    // ---------------------------------------------------
    // CART VALIDATION
    // ---------------------------------------------------

    if (
      !cart ||
      !cart.items ||
      cart.items.length === 0
    ) {
      setError("Your cart is empty.");

      return;
    }

    // ---------------------------------------------------
    // ORDER DATA
    // ---------------------------------------------------

    const orderData = {
      deliveryAddress:
        deliveryAddress.trim(),

      paymentMethod,

      deliveryLocation: {
        latitude,
        longitude,
      },
    };

    console.log(
      "========================================"
    );

    console.log(
      "        PLACE ORDER REQUEST"
    );

    console.log(
      "========================================"
    );

    console.log(
      "Order Data:",
      orderData
    );

    console.log(
      "Bill Preview:",
      bill
    );

    // ---------------------------------------------------
    // API REQUEST
    // ---------------------------------------------------

    try {
      setPlacingOrder(true);

      const response = await api.post(
        "/order/place",
        orderData
      );

      console.log(
        "PLACE ORDER RESPONSE:",
        response.data
      );

      if (response.data?.success) {
        alert(
          paymentMethod === "ONLINE"
            ? "Online payment selected. Razorpay integration will be opened here."
            : "Order placed successfully!"
        );

        navigate("/orders");

        return;
      }

      setError(
        response.data?.message ||
          "Unable to place order"
      );
    } catch (error) {
      console.error(
        "PLACE ORDER ERROR:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
          "Unable to place order"
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">
          Loading checkout...
        </p>
      </div>
    );
  }

  // =====================================================
  // EMPTY CART
  // =====================================================

  if (
    !cart ||
    !cart.items ||
    cart.items.length === 0
  ) {
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

  // =====================================================
  // MAP POSITION
  // =====================================================

  const mapPosition = deliveryLocation
    ? [
        deliveryLocation.latitude,
        deliveryLocation.longitude,
      ]
    : defaultCenter;

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50">

      {/* =================================================
          NAVBAR
      ================================================= */}

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

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="max-w-6xl mx-auto px-4 py-10">

        {/* HEADER */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-gray-900">
            Checkout
          </h1>

          <p className="text-gray-500 mt-1">
            Complete your order details.
          </p>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl">

            <p className="font-semibold">
              Order Error
            </p>

            <p className="mt-1">
              {error}
            </p>

          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* =================================================
              CHECKOUT FORM
          ================================================= */}

          <div className="lg:col-span-2">

            <form
              onSubmit={placeOrder}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
            >

              {/* =================================================
                  DELIVERY ADDRESS
              ================================================= */}

              <div className="mb-8">

                <h2 className="text-xl font-bold">
                  Delivery Address
                </h2>

                <p className="text-gray-500 text-sm mt-1 mb-4">
                  Select a map location, then edit
                  the address if needed.
                </p>

                {/* CURRENT LOCATION */}

                <button
                  type="button"
                  onClick={useCurrentLocation}
                  disabled={
                    gettingLocation ||
                    reverseGeocoding
                  }
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold px-5 py-3 rounded-xl"
                >
                  {gettingLocation
                    ? "Getting location..."
                    : "📍 Use Current Location"}
                </button>

                {/* COORDINATES */}

                {deliveryLocation && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-sm text-gray-600">

                    <div className="bg-gray-50 rounded-lg p-3">

                      <p className="text-xs text-gray-400">
                        Latitude
                      </p>

                      <p className="font-semibold">
                        {deliveryLocation.latitude.toFixed(
                          6
                        )}
                      </p>

                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">

                      <p className="text-xs text-gray-400">
                        Longitude
                      </p>

                      <p className="font-semibold">
                        {deliveryLocation.longitude.toFixed(
                          6
                        )}
                      </p>

                    </div>

                  </div>
                )}

                {/* MAP */}

                <div className="mt-5 overflow-hidden rounded-xl border border-gray-200">

                  <MapContainer
                    center={mapPosition}
                    zoom={
                      deliveryLocation
                        ? 15
                        : 4
                    }
                    scrollWheelZoom
                    className="h-80 w-full"
                  >

                    <TileLayer
                      attribution="&copy; OpenStreetMap contributors"
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <MapCenter
                      position={
                        deliveryLocation
                          ? mapPosition
                          : null
                      }
                    />

                    {deliveryLocation && (
                      <Marker
                        position={mapPosition}
                        draggable
                        eventHandlers={{
                          dragend: async (
                            event
                          ) => {

                            const position =
                              event.target.getLatLng();

                            await selectLocation(
                              position.lat,
                              position.lng
                            );
                          },
                        }}
                      >

                        <Popup>
                          Drag this marker to
                          adjust delivery location.
                        </Popup>

                      </Marker>
                    )}

                  </MapContainer>

                </div>

                {/* ADDRESS */}

                <textarea
                  value={deliveryAddress}
                  onChange={(e) =>
                    setDeliveryAddress(
                      e.target.value
                    )
                  }
                  placeholder="Enter complete delivery address"
                  rows={4}
                  required
                  className="w-full mt-5 px-4 py-3 rounded-xl border border-gray-300 outline-none resize-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />

              </div>

              {/* =================================================
                  PAYMENT
              ================================================= */}

              <div>

                <h2 className="text-xl font-bold">
                  Payment Method
                </h2>

                <p className="text-gray-500 text-sm mt-1 mb-4">
                  Select your preferred payment method.
                </p>

                <div className="space-y-3">

                  {/* COD */}

                  <label
                    className={`flex items-center gap-4 border rounded-xl p-4 cursor-pointer transition ${
                      paymentMethod === "COD"
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >

                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={
                        paymentMethod ===
                        "COD"
                      }
                      onChange={(e) =>
                        setPaymentMethod(
                          e.target.value
                        )
                      }
                      className="w-5 h-5 accent-orange-500"
                    />

                    <div className="flex-1">

                      <div className="flex items-center justify-between">

                        <p className="font-semibold">
                          💵 Cash on Delivery
                        </p>

                        <span className="text-xs font-semibold text-gray-500">
                          COD
                        </span>

                      </div>

                      <p className="text-sm text-gray-500 mt-1">
                        Pay when your order arrives.
                      </p>

                    </div>

                  </label>

                  {/* ONLINE */}

                  <label
                    className={`flex items-center gap-4 border rounded-xl p-4 cursor-pointer transition ${
                      paymentMethod === "ONLINE"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >

                    <input
                      type="radio"
                      name="paymentMethod"
                      value="ONLINE"
                      checked={
                        paymentMethod ===
                        "ONLINE"
                      }
                      onChange={(e) =>
                        setPaymentMethod(
                          e.target.value
                        )
                      }
                      className="w-5 h-5 accent-blue-500"
                    />

                    <div className="flex-1">

                      <div className="flex items-center justify-between">

                        <p className="font-semibold">
                          💳 Pay Online
                        </p>

                        <span className="text-xs font-semibold text-blue-600">
                          RAZORPAY
                        </span>

                      </div>

                      <p className="text-sm text-gray-500 mt-1">
                        Pay securely using UPI, Card,
                        Net Banking or Wallet.
                      </p>

                    </div>

                  </label>

                </div>

              </div>

              {/* =================================================
                  PLACE ORDER BUTTON
              ================================================= */}

              <button
                type="submit"
                disabled={
                  placingOrder ||
                  reverseGeocoding ||
                  gettingLocation
                }
                className={`w-full mt-8 text-white font-semibold py-4 rounded-xl transition ${
                  paymentMethod === "ONLINE"
                    ? "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
                    : "bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300"
                }`}
              >

                {placingOrder
                  ? paymentMethod === "ONLINE"
                    ? "Opening Payment..."
                    : "Placing Order..."
                  : paymentMethod === "ONLINE"
                  ? `💳 Pay Online • ${money(
                      bill.finalAmount
                    )}`
                  : `Place Order • ${money(
                      bill.finalAmount
                    )}`}

              </button>

            </form>

          </div>

          {/* =================================================
              ORDER SUMMARY
          ================================================= */}

          <div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-6">

              <h2 className="text-xl font-bold mb-5">
                Order Summary
              </h2>

              {/* RESTAURANT */}

              <div className="bg-orange-50 rounded-xl p-4 mb-5">

                <p className="text-sm text-gray-500">
                  Restaurant
                </p>

                <p className="font-bold mt-1">
                  {cart.restaurant
                    ?.restaurantName ||
                    "Restaurant"}
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  📍{" "}
                  {cart.restaurant?.city ||
                    "-"}
                </p>

              </div>

              {/* ITEMS */}

              <div className="space-y-4">

                {cart.items.map(
                  (item) => (

                    <div
                      key={item.food?._id}
                      className="flex justify-between gap-4"
                    >

                      <div>

                        <p className="font-medium">
                          {item.food?.name ||
                            "Food"}
                        </p>

                        <p className="text-sm text-gray-500">
                          {item.quantity} ×{" "}
                          {money(item.price)}
                        </p>

                      </div>

                      <p className="font-semibold">

                        {money(
                          Number(
                            item.price || 0
                          ) *
                            Number(
                              item.quantity || 0
                            )
                        )}

                      </p>

                    </div>

                  )
                )}

              </div>

              {/* =================================================
                  BILL BREAKDOWN
              ================================================= */}

              <div className="border-t border-gray-200 mt-6 pt-5">

                <h3 className="font-bold text-gray-900 mb-4">
                  Bill Details
                </h3>

                {/* FOOD TOTAL */}

                <div className="flex justify-between items-center py-2">

                  <span className="text-gray-600">
                    Food Total
                  </span>

                  <span className="font-semibold text-gray-900">
                    {money(
                      bill.foodTotal
                    )}
                  </span>

                </div>

                {/* DISTANCE */}

                <div className="flex justify-between items-center py-2">

                  <span className="text-gray-600">
                    Delivery Distance
                  </span>

                  <span className="font-semibold text-gray-900">

                    {deliveryLocation
                      ? `${bill.distanceKm.toFixed(
                          1
                        )} km`
                      : "Select location"}

                  </span>

                </div>

                {/* DELIVERY FEE */}

                <div className="flex justify-between items-center py-2">

                  <span className="text-gray-600">
                    Delivery Fee
                  </span>

                  <span className="font-semibold text-gray-900">
                    {money(
                      bill.deliveryFee
                    )}
                  </span>

                </div>

                {/* PLATFORM FEE */}

                <div className="flex justify-between items-center py-2">

                  <span className="text-gray-600">
                    Platform Fee
                  </span>

                  <span className="font-semibold text-gray-900">
                    {money(
                      bill.platformFee
                    )}
                  </span>

                </div>

                {/* TAX */}

                <div className="flex justify-between items-center py-2">

                  <div>

                    <span className="text-gray-600">
                      Tax
                    </span>

                    <span className="text-xs text-gray-400 ml-1">
                      (5%)
                    </span>

                  </div>

                  <span className="font-semibold text-gray-900">
                    {money(
                      bill.taxAmount
                    )}
                  </span>

                </div>

                {/* DIVIDER */}

                <div className="border-t border-gray-200 mt-3 pt-4">

                  <div className="flex justify-between items-center">

                    <span className="text-lg font-bold text-gray-900">
                      Total Payable
                    </span>

                    <span className="text-2xl font-bold text-orange-500">
                      {money(
                        bill.finalAmount
                      )}
                    </span>

                  </div>

                </div>

                {/* PAYMENT INFO */}

                <div
                  className={`mt-4 rounded-xl p-3 ${
                    paymentMethod === "ONLINE"
                      ? "bg-blue-50"
                      : "bg-gray-50"
                  }`}
                >

                  <p
                    className={`text-xs leading-5 ${
                      paymentMethod === "ONLINE"
                        ? "text-blue-600"
                        : "text-gray-500"
                    }`}
                  >

                    {paymentMethod ===
                    "ONLINE"
                      ? "💳 Online payment selected. You will pay the total amount securely through Razorpay."
                      : "💵 Cash on Delivery selected. Pay the total amount when your order arrives."}

                  </p>

                </div>

                {/* BILL INFO */}

                <div className="mt-3 bg-gray-50 rounded-xl p-3">

                  <p className="text-xs text-gray-500 leading-5">
                    Delivery fee is calculated based
                    on the distance between the
                    restaurant and your delivery
                    location.
                  </p>

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
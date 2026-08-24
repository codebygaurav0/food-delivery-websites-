import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
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
// DEFAULT CENTER - INDIA
// =====================================================

const defaultCenter = [20.5937, 78.9629];

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
// MAP CLICK LOCATION
// =====================================================

function MapClickHandler({ onSelect }) {
  useMapEvents({
    click(event) {
      onSelect(
        event.latlng.lat,
        event.latlng.lng
      );
    },
  });

  return null;
}

// =====================================================
// INITIAL FORM
// =====================================================

const initialForm = {
  restaurantName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  latitude: "",
  longitude: "",
};

// =====================================================
// REGISTER RESTAURANT
// =====================================================

function RegisterRestaurant() {
  const navigate = useNavigate();

  const [formData, setFormData] =
    useState(initialForm);

  const [error, setError] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [gettingLocation, setGettingLocation] =
    useState(false);

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]:
        event.target.value,
    }));
  };

  // =====================================================
  // SET RESTAURANT LOCATION
  // =====================================================

  const selectLocation = (
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
        "Invalid restaurant location."
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

    setFormData((current) => ({
      ...current,
      latitude: lat.toString(),
      longitude: lon.toString(),
    }));

    setError("");
  };

  // =====================================================
  // CURRENT LOCATION
  // =====================================================

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError(
        "Location is not supported by this browser."
      );

      return;
    }

    setGettingLocation(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        selectLocation(
          coords.latitude,
          coords.longitude
        );

        setGettingLocation(false);
      },

      (locationError) => {
        setGettingLocation(false);

        const messages = {
          1:
            "Location permission was denied. Please allow location access.",

          2:
            "Unable to detect your location.",

          3:
            "Location request timed out. Please try again.",
        };

        setError(
          messages[locationError.code] ||
            "Unable to get current location."
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
  // SUBMIT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    // ===================================================
    // BASIC VALIDATION
    // ===================================================

    if (
      !formData.restaurantName.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.address.trim() ||
      !formData.city.trim() ||
      !formData.state.trim()
    ) {
      setError(
        "Please fill all restaurant details."
      );

      return;
    }

    // ===================================================
    // COORDINATE VALIDATION
    // ===================================================

    if (
      formData.latitude === "" ||
      formData.longitude === ""
    ) {
      setError(
        "Please select your restaurant pickup location on the map or use Current Location."
      );

      return;
    }

    const latitude = Number(
      formData.latitude
    );

    const longitude = Number(
      formData.longitude
    );

    if (
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90
    ) {
      setError(
        "Invalid restaurant latitude."
      );

      return;
    }

    if (
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      setError(
        "Invalid restaurant longitude."
      );

      return;
    }

    // ===================================================
    // SUBMIT
    // ===================================================

    setSaving(true);

    try {
      const requestData = {
        restaurantName:
          formData.restaurantName.trim(),

        email:
          formData.email.trim(),

        phone:
          formData.phone.trim(),

        address:
          formData.address.trim(),

        city:
          formData.city.trim(),

        state:
          formData.state.trim(),

        // IMPORTANT
        // Restaurant pickup coordinates
        latitude,
        longitude,
      };

      console.log(
        "========== RESTAURANT REGISTRATION =========="
      );

      console.log(
        "Request Data:",
        requestData
      );

      const response = await api.post(
        "/restaurant/register",
        requestData
      );

      console.log(
        "Restaurant Registration Response:",
        response.data
      );

      if (response.data?.success) {
        alert(
          "Restaurant registration submitted successfully!"
        );

        navigate(
          "/restaurant/dashboard"
        );

        return;
      }

      setError(
        response.data?.message ||
          "Unable to submit restaurant registration"
      );
    } catch (requestError) {
      console.error(
        "Restaurant Registration Error:",
        requestError.response?.data ||
          requestError
      );

      setError(
        requestError.response?.data?.message ||
          "Unable to submit restaurant registration"
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // MAP POSITION
  // =====================================================

  const hasLocation =
    formData.latitude !== "" &&
    formData.longitude !== "";

  const mapPosition = hasLocation
    ? [
        Number(formData.latitude),
        Number(formData.longitude),
      ]
    : defaultCenter;

  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">

        {/* =================================================
            BACK
        ================================================= */}

        <button
          type="button"
          onClick={() =>
            navigate(
              "/restaurant/dashboard"
            )
          }
          className="mb-6 font-semibold text-orange-500 hover:text-orange-600"
        >
          ← Dashboard
        </button>

        {/* =================================================
            CARD
        ================================================= */}

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">

          <h1 className="text-3xl font-bold text-gray-900">
            Register Your Restaurant
          </h1>

          <p className="mt-2 text-gray-500">
            Submit your restaurant details
            for admin review. Food management
            opens after approval.
          </p>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
              <p className="font-semibold">
                Registration Error
              </p>

              <p className="mt-1">
                {error}
              </p>
            </div>
          )}

          {/* =================================================
              FORM
          ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="mt-8 grid gap-5 sm:grid-cols-2"
          >

            {/* =================================================
                RESTAURANT NAME
            ================================================= */}

            <label className="block text-sm font-medium text-gray-700">
              Restaurant Name

              <input
                type="text"
                name="restaurantName"
                value={
                  formData.restaurantName
                }
                onChange={handleChange}
                placeholder="Enter restaurant name"
                required
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </label>

            {/* =================================================
                EMAIL
            ================================================= */}

            <label className="block text-sm font-medium text-gray-700">
              Restaurant Email

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="restaurant@example.com"
                required
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </label>

            {/* =================================================
                PHONE
            ================================================= */}

            <label className="block text-sm font-medium text-gray-700">
              Phone

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                required
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </label>

            {/* =================================================
                CITY
            ================================================= */}

            <label className="block text-sm font-medium text-gray-700">
              City

              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter city"
                required
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </label>

            {/* =================================================
                STATE
            ================================================= */}

            <label className="block text-sm font-medium text-gray-700">
              State

              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Enter state"
                required
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </label>

            {/* =================================================
                ADDRESS
            ================================================= */}

            <label className="block text-sm font-medium text-gray-700 sm:col-span-2">
              Restaurant Address

              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows="3"
                placeholder="Enter complete restaurant address"
                className="mt-2 w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </label>

            {/* =================================================
                LOCATION SECTION
            ================================================= */}

            <div className="sm:col-span-2 rounded-2xl border border-orange-100 bg-orange-50 p-5">

              <h2 className="text-xl font-bold text-gray-900">
                📍 Restaurant Pickup Location
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                This location will be used as
                the restaurant pickup point.
                It is required to calculate
                delivery distance and delivery
                charges.
              </p>

              {/* =================================================
                  CURRENT LOCATION
              ================================================= */}

              <button
                type="button"
                onClick={
                  useCurrentLocation
                }
                disabled={
                  gettingLocation
                }
                className="mt-5 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
              >
                {gettingLocation
                  ? "Getting Location..."
                  : "📍 Use Current Location"}
              </button>

              {/* =================================================
                  MAP
              ================================================= */}

              <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200">

                <MapContainer
                  center={mapPosition}
                  zoom={
                    hasLocation
                      ? 16
                      : 5
                  }
                  scrollWheelZoom
                  className="h-96 w-full"
                >

                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <MapCenter
                    position={
                      hasLocation
                        ? mapPosition
                        : null
                    }
                  />

                  <MapClickHandler
                    onSelect={
                      selectLocation
                    }
                  />

                  {hasLocation && (
                    <Marker
                      position={
                        mapPosition
                      }
                      draggable
                      eventHandlers={{
                        dragend: (
                          event
                        ) => {
                          const position =
                            event.target.getLatLng();

                          selectLocation(
                            position.lat,
                            position.lng
                          );
                        },
                      }}
                    >
                      <Popup>
                        🛵 Restaurant
                        Pickup Location
                        <br />
                        Drag marker to
                        adjust location.
                      </Popup>
                    </Marker>
                  )}

                </MapContainer>

              </div>

              <p className="mt-3 text-xs text-gray-500">
                💡 Map par click karke location
                select karo ya marker ko drag
                karke exact restaurant location
                set karo.
              </p>

              {/* =================================================
                  COORDINATES
              ================================================= */}

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div className="rounded-xl border border-gray-200 bg-white p-4">

                  <p className="text-xs font-medium text-gray-500">
                    Latitude
                  </p>

                  <p className="mt-1 break-all font-semibold text-gray-900">
                    {formData.latitude ||
                      "Not selected"}
                  </p>

                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4">

                  <p className="text-xs font-medium text-gray-500">
                    Longitude
                  </p>

                  <p className="mt-1 break-all font-semibold text-gray-900">
                    {formData.longitude ||
                      "Not selected"}
                  </p>

                </div>

              </div>

              {/* =================================================
                  MANUAL COORDINATES
              ================================================= */}

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

                <label className="text-sm font-medium text-gray-700">
                  Latitude

                  <input
                    type="number"
                    name="latitude"
                    value={
                      formData.latitude
                    }
                    onChange={
                      handleChange
                    }
                    step="any"
                    min="-90"
                    max="90"
                    placeholder="26.9124"
                    required
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                </label>

                <label className="text-sm font-medium text-gray-700">
                  Longitude

                  <input
                    type="number"
                    name="longitude"
                    value={
                      formData.longitude
                    }
                    onChange={
                      handleChange
                    }
                    step="any"
                    min="-180"
                    max="180"
                    placeholder="75.7873"
                    required
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                </label>

              </div>

              {/* =================================================
                  LOCATION SUCCESS
              ================================================= */}

              {hasLocation && (
                <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">

                  <p className="font-semibold text-green-700">
                    ✅ Pickup location selected
                  </p>

                  <p className="mt-1 text-sm text-green-600">
                    Restaurant:
                    {" "}
                    {formData.latitude},
                    {" "}
                    {formData.longitude}
                  </p>

                </div>
              )}

            </div>

            {/* =================================================
                SUBMIT
            ================================================= */}

            <button
              type="submit"
              disabled={
                saving ||
                gettingLocation
              }
              className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300 sm:col-span-2"
            >
              {saving
                ? "Submitting..."
                : "Submit Registration"}
            </button>

          </form>
        </div>
      </div>
    </main>
  );
}

export default RegisterRestaurant;
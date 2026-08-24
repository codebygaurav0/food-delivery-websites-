const isValidCoordinate = (latitude, longitude) => (
  Number.isFinite(latitude) &&
  Number.isFinite(longitude) &&
  latitude >= -90 &&
  latitude <= 90 &&
  longitude >= -180 &&
  longitude <= 180
);

const reverseGeocode = async (req, res) => {
  const latitude = Number(req.query.lat);
  const longitude = Number(req.query.lon);

  if (!isValidCoordinate(latitude, longitude)) {
    return res.status(400).json({
      success: false,
      message: "Valid latitude and longitude are required",
    });
  }

  try {
    const query = new URLSearchParams({
      lat: String(latitude),
      lon: String(longitude),
      format: "jsonv2",
      addressdetails: "1",
    });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?${query}`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "FoodDeliverySystem/1.0",
        },
      }
    );

    if (!response.ok) {
      return res.status(502).json({
        success: false,
        message: "Reverse geocoding service is unavailable",
      });
    }

    const result = await response.json();

    if (!result.display_name) {
      return res.status(404).json({
        success: false,
        message: "No readable address found for this location",
      });
    }

    return res.status(200).json({
      success: true,
      address: result.display_name,
    });
  } catch (error) {
    console.error("Reverse Geocode Error:", error);

    return res.status(502).json({
      success: false,
      message: "Unable to reverse geocode this location",
    });
  }
};

module.exports = { reverseGeocode, isValidCoordinate };
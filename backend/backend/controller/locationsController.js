import HeritageModel from "../models/heritageModel.js";

const DEFAULT_RADIUS_M = 500;

export const getNearestLocation = async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return res.status(400).json({
      success: false,
      message: "Valid 'lat' and 'lng' query parameters are required.",
    });
  }

  try {
    const radius = Number.isFinite(parseFloat(req.query.radius))
      ? parseFloat(req.query.radius)
      : DEFAULT_RADIUS_M;

    const location = await HeritageModel.getNearest(lat, lng, radius);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: `No location found within ${radius}m of the clicked point.`,
      });
    }

    res.json({ success: true, location });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to find a location near the clicked coordinates.",
    });
  }
};

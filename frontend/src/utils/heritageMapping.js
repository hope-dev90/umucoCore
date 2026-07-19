const isRemoteImage = (value) => /^https?:\/\//i.test(value) || /^data:/i.test(value);
const isBackendImagePath = (value) => /^(\/uploads\/|\/images\/|\/api\/)/i.test(value);
const isLikelyLocalAssetPath = (value) => /^(\/assets\/|assets\/|\.\/|\.\.\/)/i.test(value) || /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(value);

export const mapHeritageApiItem = (item, index, fallbackImages = [], withSafeCoordinates = (entry) => entry) => {
  const candidate = item.image_url || item.image || '';
  let normalizedImage = fallbackImages[index % fallbackImages.length];

  if (typeof candidate === 'string' && candidate.trim()) {
    const trimmed = candidate.trim();
    if (isRemoteImage(trimmed)) {
      normalizedImage = trimmed;
    } else if (isBackendImagePath(trimmed)) {
      normalizedImage = `http://localhost:5000${trimmed}`;
    } else if (!isLikelyLocalAssetPath(trimmed)) {
      normalizedImage = trimmed;
    }
  }

  return withSafeCoordinates({
    ...item,
    catKey: item.category?.toLowerCase().replace(/\s+/g, '') || '',
    locationKey: item.location,
    image: normalizedImage,
    desc: item.description,
  });
};

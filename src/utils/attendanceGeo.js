export const isGeoPunchEnabled = (source) =>
  Boolean(
    source?.geoFenceEnabled ??
      source?.geoFence?.geoFenceEnabled ??
      source?.attendance?.geoFenceEnabled,
  );

export const pickGeoFence = (...sources) => {
  for (const source of sources) {
    if (!source) continue;
    if (source.geoFenceEnabled) return source;
    if (source.geoFence?.geoFenceEnabled) return source.geoFence;
    if (source.attendance?.geoFenceEnabled) return source.attendance;
  }
  const fallback = sources.find(Boolean);
  return (
    fallback?.geoFence ||
    fallback?.attendance ||
    fallback || { geoFenceEnabled: false }
  );
};

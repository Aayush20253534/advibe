/** Published catalogue coordinates only; this does not establish inventory or delivery. */
export function mapsEmbedUrl(key, lat, lng) {
  if (typeof key !== "string" || !key.trim() || key.length > 256 ||
      !Number.isFinite(lat) || !Number.isFinite(lng) ||
      Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  const url = new URL("https://www.google.com/maps/embed/v1/view");
  url.search = new URLSearchParams({ key: key.trim(), center: `${lat},${lng}`, zoom: "14", maptype: "roadmap" }).toString();
  return url.toString();
}

/** Validate at build/start time. Disabled maps ignore even leftover browser keys. */
export function validateMapsConfig(env) {
  const enabled = env.NEXT_PUBLIC_GOOGLE_MAPS_ENABLED ?? "false";
  if (enabled !== "true" && enabled !== "false")
    throw new Error("NEXT_PUBLIC_GOOGLE_MAPS_ENABLED must be true or false");
  if (enabled === "true" && (typeof env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY !== "string" ||
      !env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY.trim() || env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY.length > 256))
    throw new Error("NEXT_PUBLIC_GOOGLE_MAPS_ENABLED=true requires NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY");
}

/** Published catalogue coordinates only; this does not establish inventory or delivery. */
export function mapsEmbedUrl(key, lat, lng, enabled = "false") {
  if (enabled !== "true" || typeof key !== "string" || !key.trim() || key.length > 256 ||
      !Number.isFinite(lat) || !Number.isFinite(lng) ||
      Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  const url = new URL("https://www.google.com/maps/embed/v1/view");
  url.search = new URLSearchParams({ key: key.trim(), center: `${lat},${lng}`, zoom: "14", maptype: "roadmap" }).toString();
  return url.toString();
}

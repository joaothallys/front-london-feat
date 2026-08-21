import { api, unwrap } from "../../api/client.js";

export function genderForApi(value) {
  if (value === "female" || value === "mulher") return "mulher";
  if (value === "male" || value === "homem") return "homem";
  return "";
}

export function isV2MediaDown(err) {
  const code = err && err.body && err.body.error;
  return err && (err.status === 503 || code === "exercisedb_v2_unsubscribed" || code === "exercisedb_v2_unavailable");
}

export function pickThumbUrl(media, fallback) {
  if (!media) return fallback || "";
  const sizes = media.imageUrls || {};
  return media.imageUrl
    || sizes["480p"]
    || sizes["360p"]
    || sizes["720p"]
    || media.gifUrl
    || fallback
    || "";
}

export function pickDetailUrl(media, fallback) {
  if (!media) return fallback || "";
  const sizes = media.imageUrls || {};
  return media.imageUrl
    || sizes["720p"]
    || sizes["1080p"]
    || sizes["480p"]
    || media.gifUrl
    || fallback
    || "";
}

export async function fetchExerciseMedia(query, gender) {
  const q = String(query || "").trim();
  if (!q) return null;
  const g = genderForApi(gender);
  try {
    return unwrap(await api.media.exercise({ q, gender: g })) || null;
  } catch (err) {
    if (!isV2MediaDown(err)) return null;
    try {
      return unwrap(await api.media.fallback(q)) || null;
    } catch (fallbackErr) {
      return null;
    }
  }
}

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

function stillOf(media) {
  if (!media) return "";
  const sizes = media.imageUrls || {};
  return media.imageUrl || sizes["480p"] || sizes["360p"] || sizes["720p"] || sizes["1080p"] || "";
}

function gifOf(media) {
  if (!media) return "";
  return media.gifUrl || media.gif || (media.type === "gif" ? media.url : "") || "";
}

export function pickThumbUrl(media, fallback) {
  return stillOf(media) || gifOf(media) || fallback || "";
}

export function pickDetailUrl(media, fallback) {
  return gifOf(media) || fallback || stillOf(media) || "";
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

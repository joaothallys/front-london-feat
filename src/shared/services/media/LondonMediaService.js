import { api, unwrap } from "../../api/client.js";
import { ExerciseMediaService } from "./ExerciseMediaService.js";

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

export async function resolveListThumb(exercise, gender, fallback) {
  const id = exercise && (exercise.id || exercise.sourceId);
  const cached = id ? ExerciseMediaService.getCached(id) : null;
  if (cached && (cached.thumbnailUrl || cached.mediaUrl)) {
    return cached.thumbnailUrl || cached.mediaUrl;
  }
  const q = (exercise && (exercise.sourceName || exercise.originalName || exercise.displayName || exercise.name)) || "";
  const media = await fetchExerciseMedia(q, gender);
  const url = pickThumbUrl(media, fallback);
  if (id && url) {
    ExerciseMediaService.saveManual(id, {
      url,
      thumbnailUrl: stillOf(media) || url,
      source: "exercisedb",
      searchTerm: q
    });
  }
  return url || fallback || "";
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

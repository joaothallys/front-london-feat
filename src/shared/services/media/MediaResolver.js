import { ExerciseDBService } from "../exercisedb/ExerciseDBService.js";
import { ExerciseMediaService } from "./ExerciseMediaService.js";
import { TenorMediaService } from "./TenorMediaService.js";

export const PLACEHOLDER_MEDIA = {
  source: "placeholder",
  type: "image",
  url: ""
};

export function resolveExerciseMedia(exercise) {
  if (!exercise) return PLACEHOLDER_MEDIA;

  const cached = ExerciseMediaService.getCached(exercise.id);
  if (cached && cached.mediaUrl) {
    return {
      source: cached.mediaSource || "manual",
      type: "gif",
      url: cached.mediaUrl,
      thumbnailUrl: cached.thumbnailUrl || cached.mediaUrl
    };
  }

  const current = exercise.media;
  if (current && current.url && current.source === "exercisedb") {
    return { source: "exercisedb", type: current.type || "gif", url: current.url };
  }
  if (exercise.sourceId) {
    return {
      source: "exercisedb",
      type: "gif",
      url: ExerciseDBService.gifUrl(exercise.sourceId)
    };
  }
  if (current && current.url && current.source === "manual") {
    return { source: "manual", type: current.type || "gif", url: current.url };
  }

  const manual = ExerciseMediaService.getCached(exercise.id);
  if (manual && manual.mediaUrl) {
    return { source: "manual", type: "gif", url: manual.mediaUrl };
  }

  const tenor = TenorMediaService.get(exercise.id);
  if (tenor && tenor.url) {
    return { source: "tenor", type: "gif", url: tenor.url, tenorId: tenor.tenorId };
  }
  if (current && current.url && current.source === "tenor") {
    return { source: "tenor", type: current.type || "gif", url: current.url };
  }

  return PLACEHOLDER_MEDIA;
}

import { ExerciseMediaService } from "./ExerciseMediaService.js";

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
  if (current && current.url) {
    return { source: current.source || "catalog", type: current.type || "gif", url: current.url };
  }
  if (exercise.gifUrl || exercise.gif) {
    return { source: "catalog", type: "gif", url: exercise.gifUrl || exercise.gif };
  }

  const manual = ExerciseMediaService.getCached(exercise.id);
  if (manual && manual.mediaUrl) {
    return { source: "manual", type: "gif", url: manual.mediaUrl };
  }

  return PLACEHOLDER_MEDIA;
}

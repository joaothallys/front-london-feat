import { ExerciseCache } from "../cache/ExerciseCache.js";

export const ExerciseMediaService = {
  saveManual(exerciseId, media) {
    if (!exerciseId || !media || !media.url) return null;
    const entry = {
      exerciseId,
      mediaSource: media.source || "manual",
      mediaUrl: media.url,
      thumbnailUrl: media.thumbnailUrl || media.url,
      tenorId: media.tenorId || "",
      searchTerm: media.searchTerm || "",
      updatedAt: Date.now()
    };
    ExerciseCache.saveMedia(entry);
    return entry;
  },

  getCached(exerciseId) {
    return ExerciseCache.getMedia(exerciseId);
  }
};

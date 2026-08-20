export const EXERCISEDB_OSS_BASE = "https://oss.exercisedb.dev/api/v1";

export function normalizeRemoteExercise(row) {
  if (!row) return null;
  return {
    sourceId: row.exerciseId || row.externalId || row.id || "",
    sourceName: row.name || row.originalName || "",
    gifUrl: row.gifUrl || "",
    videoUrl: row.videoUrl || "",
    bodyParts: row.bodyParts || [],
    equipments: row.equipments || [],
    targetMuscles: row.targetMuscles || [],
    secondaryMuscles: row.secondaryMuscles || [],
    instructions: row.instructions || []
  };
}

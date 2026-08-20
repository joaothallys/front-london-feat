import { translateInstructions, translateMuscle } from "../../i18n/pt.js";
import { normalizeRemoteExercise } from "./ExerciseDBTypes.js";

function slug(text) {
  return String(text || "").toLowerCase().trim();
}

function namesOf(exercise) {
  return [
    exercise.displayName,
    exercise.sourceName,
    exercise.sourceId,
    ...(exercise.aliases || [])
  ].map(slug).filter(Boolean);
}

function scoreMatch(exercise, remote) {
  const remoteName = slug(remote.sourceName);
  const remoteId = slug(remote.sourceId);
  const local = namesOf(exercise);
  if (exercise.sourceId && slug(exercise.sourceId) === remoteId) return 100;
  if (local.includes(remoteName)) return 90;
  if (remoteName && local.some((name) => name.includes(remoteName) || remoteName.includes(name))) return 70;
  return 0;
}

export const ExerciseDBMapper = {
  fromRemote(row) {
    return normalizeRemoteExercise(row);
  },

  match(exercise, remotes) {
    let best = null;
    let bestScore = 0;
    (remotes || []).forEach((row) => {
      const remote = normalizeRemoteExercise(row);
      const score = scoreMatch(exercise, remote);
      if (score > bestScore) {
        bestScore = score;
        best = remote;
      }
    });
    return bestScore >= 70 ? best : null;
  },

  merge(exercise, remote) {
    if (!exercise || !remote) return exercise;
    const next = Object.assign({}, exercise);
    next.sourceId = next.sourceId || remote.sourceId;
    next.sourceName = next.sourceName || remote.sourceName;
    if (!next.secondaryMuscles.length) {
      next.secondaryMuscles = (remote.secondaryMuscles || []).map(translateMuscle).filter(Boolean);
    }
    if (!next.instructions.length && remote.instructions && remote.instructions.length) {
      next.instructions = translateInstructions(remote.instructions).map((text, i) => ({
        step: i + 1,
        text
      }));
    }
    if ((!next.media || !next.media.url) && remote.gifUrl) {
      next.media = { type: "gif", source: "exercisedb", url: remote.gifUrl };
    }
    next.updatedAt = Date.now();
    return next;
  }
};

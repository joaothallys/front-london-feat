import { workoutName } from "../shared/domain/history.js";

function exerciseRows(local, remote) {
  if (remote && Array.isArray(remote.exercises)) return remote.exercises;
  if (local && Array.isArray(local.exercises)) return local.exercises;
  return [];
}

function setsOf(exercise) {
  return (Array.isArray(exercise.sets) ? exercise.sets : []).map((set) => ({
    type: set.type || "N",
    kg: Number(set.kg) || 0,
    reps: Number(set.reps) || 0,
    done: typeof set.done === "boolean" ? set.done : false
  }));
}

function usedExercises(rows) {
  const items = rows.map((exercise) => ({
    id: exercise.exerciseId || exercise.id,
    name: exercise.name || exercise.exerciseName || "",
    rest: Number(exercise.restSec || exercise.rest) || 90,
    sets: setsOf(exercise)
  })).filter((exercise) => exercise.id);
  const anyDone = items.some((exercise) => exercise.sets.some((set) => set.done));
  return items.map((exercise) => {
    const used = anyDone
      ? exercise.sets.filter((set) => set.done)
      : exercise.sets.filter((set) => set.type !== "W");
    return Object.assign({}, exercise, { used });
  }).filter((exercise) => exercise.used.length);
}

function linesFrom(items) {
  return items.map((exercise) => {
    const work = exercise.used.filter((set) => set.type !== "W");
    const basis = work.length ? work : exercise.used;
    const last = basis[basis.length - 1] || {};
    const reps = basis.reduce((sum, set) => sum + (Number(set.reps) || 0), 0);
    return {
      id: exercise.id,
      name: exercise.name || exercise.id,
      sets: basis.length,
      reps,
      kg: Number(last.kg) || 0,
      typicalReps: Number(last.reps) || 0,
      detail: basis.length + " × " + (Number(last.reps) || 0) + "  ·  " + (Number(last.kg) || 0) + " kg"
    };
  });
}

function shareItemsFrom(items) {
  return items.map((exercise) => ({
    id: exercise.id,
    sourceId: "",
    name: exercise.name || exercise.id,
    muscle: "",
    equipment: "",
    gifUrl: "",
    rest: exercise.rest,
    sets: exercise.used.map((set) => ({
      type: set.type || "N",
      kg: Number(set.kg) || 0,
      reps: Number(set.reps) || 0
    }))
  }));
}

function positive(value) {
  const n = typeof value === "number" ? value : (typeof value === "string" ? Number(value) : NaN);
  return n > 0 ? n : 0;
}

export function summaryFromWorkout(local, remote) {
  if (!local && !remote) return null;
  const localRow = local || {};
  const remoteRow = remote || {};
  const built = usedExercises(exerciseRows(localRow, remoteRow));
  const builtLines = linesFrom(built);
  const builtVolume = built.reduce((sum, exercise) => {
    return sum + exercise.used.filter((set) => set.type !== "W").reduce((total, set) => {
      return total + (Number(set.kg) || 0) * (Number(set.reps) || 0);
    }, 0);
  }, 0);
  const lines = Array.isArray(localRow.lines) && localRow.lines.length ? localRow.lines : builtLines;
  const shareItems = Array.isArray(localRow.shareItems) && localRow.shareItems.length
    ? localRow.shareItems
    : shareItemsFrom(built);
  return {
    id: localRow.id || remoteRow.id || null,
    date: localRow.date || remoteRow.finishedAt || remoteRow.startedAt || remoteRow.date || new Date().toISOString(),
    name: workoutName(localRow.name || remoteRow.name || "Treino"),
    duration: positive(localRow.duration) || positive(localRow.durationMin) || positive(remoteRow.durationMin) || positive(remoteRow.duration),
    volume: positive(localRow.volume) || positive(localRow.volumeKg) || positive(remoteRow.volumeKg) || positive(remoteRow.volume) || builtVolume,
    calories: positive(localRow.calories) || positive(remoteRow.calories),
    exercises: positive(typeof localRow.exercises === "number" ? localRow.exercises : 0) || positive(remoteRow.exercisesCount) || lines.length,
    sets: positive(typeof localRow.sets === "number" ? localRow.sets : 0) || positive(remoteRow.setsCount) || built.reduce((sum, exercise) => sum + exercise.used.length, 0),
    totalReps: positive(localRow.totalReps) || lines.reduce((sum, line) => sum + (Number(line.reps) || 0), 0),
    muscles: Array.isArray(localRow.muscles) ? localRow.muscles : [],
    lines,
    photo: localRow.photo || null,
    shareItems,
    shareId: localRow.shareId || null,
    pendingSync: !!localRow.pendingSync
  };
}

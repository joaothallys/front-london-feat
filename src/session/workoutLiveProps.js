import { exerciseOf } from "../catalog.js";
import { restStillRunning } from "./restClock.js";

function compactNum(value) {
  const n = Number(value) || 0;
  return String(Number(n.toFixed(1)));
}

export function workoutLiveProps(live, extras) {
  if (!live || !live.items || !live.items.length) return null;
  const item = live.items[live.index] || live.items[0];
  const next = live.items[live.index + 1];
  const current = exerciseOf(item && item.id);
  const upcoming = next ? exerciseOf(next.id) : null;
  const resting = restStillRunning(live.rest);
  const sets = (item && item.sets) || [];
  const pendingIndex = sets.findIndex((s) => !s.done);
  const pending = (pendingIndex >= 0 ? sets[pendingIndex] : sets[sets.length - 1]) || { kg: 0, reps: 0 };
  return {
    phase: resting ? "rest" : "work",
    exerciseName: (current && current.name) || (item && item.id) || "Treino",
    nextExerciseName: (upcoming && upcoming.name) || "",
    exerciseIndex: (live.index || 0) + 1,
    exerciseCount: live.items.length,
    setIndex: pendingIndex >= 0 ? pendingIndex + 1 : Math.max(sets.length, 1),
    setCount: sets.length,
    kg: compactNum(pending.kg),
    reps: String(Math.max(0, Math.round(Number(pending.reps) || 0))),
    restSeconds: Number(item && item.rest) || 60,
    startedAt: (live.rest && live.rest.startedAt) || live.startedAt || Date.now(),
    endsAt: resting ? live.rest.endsAt : 0,
    totalRest: resting ? live.rest.total : Number(item && item.rest) || 60,
    thumbPath: (extras && extras.thumbPath) || "",
    pendingAction: ""
  };
}

import { exerciseOf } from "../catalog.js";
import { restStillRunning } from "./restClock.js";

export function workoutLiveProps(live) {
  if (!live || !live.items || !live.items.length) return null;
  const item = live.items[live.index] || live.items[0];
  const next = live.items[live.index + 1];
  const current = exerciseOf(item && item.id);
  const upcoming = next ? exerciseOf(next.id) : null;
  const resting = restStillRunning(live.rest);
  const sets = (item && item.sets) || [];
  return {
    phase: resting ? "rest" : "work",
    exerciseName: (current && current.name) || (item && item.id) || "Treino",
    nextExerciseName: (upcoming && upcoming.name) || "",
    exerciseIndex: (live.index || 0) + 1,
    exerciseCount: live.items.length,
    setIndex: sets.filter((s) => s.done).length,
    setCount: sets.length,
    startedAt: (live.rest && live.rest.startedAt) || live.startedAt || Date.now(),
    endsAt: resting ? live.rest.endsAt : 0,
    totalRest: resting ? live.rest.total : 0,
    pendingAction: ""
  };
}

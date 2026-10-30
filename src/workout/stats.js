import { muscleArt } from "@shared/domain/muscle-art.js";
import { exerciseOf } from "../catalog.js";
import { anySetDone, countedSets } from "../session/finishPayload.js";
import { autoDuration, estimateCalories } from "./duration.js";

export { fmtDuration, MAX_AUTO_MIN, estimateCalories } from "./duration.js";

export function fmtInt(n) {
  return Math.round(Number(n) || 0).toLocaleString("pt-BR");
}

export function fmtClock(min) {
  const total = Math.max(0, Math.round((Number(min) || 0) * 60));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (v) => String(v).padStart(2, "0");
  return h ? pad(h) + ":" + pad(m) + ":" + pad(s) : pad(m) + ":" + pad(s);
}


export function computeWorkoutStats(live, durationMin) {
  const typed = Number(durationMin);
  let volume = 0;
  let reps = 0;
  let doneSets = 0;
  let totalSets = 0;
  const muscles = {};
  const lines = [];
  const anyDone = anySetDone(live);

  ((live && live.items) || []).forEach((it) => {
    const e = exerciseOf(it.id);
    const sets = it.sets || [];
    const used = countedSets(it, anyDone);
    const work = used.filter((s) => s.type !== "W");
    totalSets += sets.length;
    doneSets += used.length;
    const exReps = work.reduce((a, s) => a + (Number(s.reps) || 0), 0);
    const exVol = work.reduce((a, s) => a + (Number(s.kg) || 0) * (Number(s.reps) || 0), 0);
    reps += exReps;
    volume += exVol;
    if (!used.length) return;
    const last = work[work.length - 1] || used[used.length - 1];
    const kg = last ? last.kg : 0;
    const typicalReps = last ? last.reps : 0;
    lines.push({
      id: it.id,
      name: (e && e.name) || it.id,
      sets: work.length || used.length,
      reps: exReps,
      kg: Number(kg) || 0,
      typicalReps: Number(typicalReps) || 0,
      detail: (work.length || used.length) + " × " + typicalReps + "  ·  " + (Number(kg) || 0) + " kg"
    });
    if (e && e.muscle) muscles[e.muscle] = true;
    ((e && e.secondary) || []).forEach((m) => { if (m) muscles[m] = true; });
  });

  const duration = typed > 0 ? Math.min(600, Math.round(typed)) : autoDuration(live, doneSets);
  const muscleIds = Object.keys(muscles);
  const muscleLabels = muscleIds.map((id) => (muscleArt(id) && muscleArt(id).label) || id);

  return {
    name: (live && live.name) || "Treino",
    duration,
    calories: estimateCalories(duration, volume),
    volume,
    reps,
    doneSets,
    totalSets,
    exerciseCount: ((live && live.items) || []).length,
    completedCount: lines.length,
    muscles: muscleIds,
    muscleLabels,
    lines
  };
}


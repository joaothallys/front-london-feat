import { muscleArt } from "@shared/domain/muscle-art.js";
import { exerciseOf } from "../catalog.js";

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

function setPool(sets) {
  const all = sets || [];
  const done = all.filter((s) => s.done);
  return done.length ? done : all;
}

export function computeWorkoutStats(live, durationMin) {
  const duration = Math.max(1, Number(durationMin) || Math.max(1, Math.round((Date.now() - (live && live.startedAt || Date.now())) / 60000)));
  let volume = 0;
  let reps = 0;
  let doneSets = 0;
  let totalSets = 0;
  const muscles = {};
  const lines = [];

  ((live && live.items) || []).forEach((it) => {
    const e = exerciseOf(it.id);
    const sets = it.sets || [];
    const used = setPool(sets);
    totalSets += sets.length;
    doneSets += sets.filter((s) => s.done).length;
    const exReps = used.reduce((a, s) => a + (Number(s.reps) || 0), 0);
    const exVol = used.reduce((a, s) => a + (Number(s.kg) || 0) * (Number(s.reps) || 0), 0);
    reps += exReps;
    volume += exVol;
    const kg = used.length ? used[used.length - 1].kg : 0;
    const typicalReps = used.length ? used[used.length - 1].reps : 0;
    lines.push({
      id: it.id,
      name: (e && e.name) || it.id,
      sets: used.length,
      reps: exReps,
      kg: Number(kg) || 0,
      typicalReps: Number(typicalReps) || 0,
      detail: used.length + " × " + typicalReps + "  ·  " + (Number(kg) || 0) + " kg"
    });
    if (e && e.muscle) muscles[e.muscle] = true;
    ((e && e.secondary) || []).forEach((m) => { if (m) muscles[m] = true; });
  });

  const muscleIds = Object.keys(muscles);
  const muscleLabels = muscleIds.map((id) => (muscleArt(id) && muscleArt(id).label) || id);

  return {
    name: (live && live.name) || "Treino",
    duration,
    calories: Math.round(duration * 8.2),
    volume,
    reps,
    doneSets,
    totalSets,
    exerciseCount: ((live && live.items) || []).length,
    completedCount: lines.filter((row) => row.sets > 0).length,
    muscles: muscleIds,
    muscleLabels,
    lines
  };
}

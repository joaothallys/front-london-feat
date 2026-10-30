import { workoutName } from "../shared/domain/history.js";

// Uma regra só para o resumo local e para o servidor: se o aluno marcou alguma
// série, contam só as marcadas; se não marcou nenhuma, contam todas as séries
// de trabalho (o aquecimento "W" fica de fora).
export function anySetDone(live) {
  return ((live && live.items) || []).some((it) => (it.sets || []).some((s) => s && s.done));
}

export function countedSets(item, anyDone) {
  const sets = (item && item.sets) || [];
  if (anyDone) return sets.filter((s) => s && s.done);
  return sets.filter((s) => s && s.type !== "W");
}

export function finishExercises(live, resolveId) {
  const anyDone = anySetDone(live);
  return ((live && live.items) || []).map((it) => ({
    exerciseId: (resolveId && resolveId(it.id)) || it.id,
    restSec: Number(it.rest) || 90,
    replacedFromExerciseId: it.replacedFrom || null,
    sets: (it.sets || []).map((s) => ({
      type: s.type || "N",
      kg: Number(s.kg) || 0,
      reps: Number(s.reps) || 0,
      done: anyDone ? !!s.done : s.type !== "W"
    }))
  }));
}

export function finishBody(live, extras) {
  const opts = extras || {};
  const body = {
    name: workoutName(live.name),
    sourceType: (live.meta && live.meta.sourceType) || "custom",
    sourceId: (live.meta && live.meta.sourceId) || null,
    startedAt: new Date(live.startedAt || Date.now()).toISOString(),
    durationMin: opts.durationMin,
    muscles: opts.muscles || [],
    saveAsWorkout: false,
    exercises: finishExercises(live, opts.resolveId)
  };
  if (live.apiId) body.sessionId = live.apiId;
  return body;
}

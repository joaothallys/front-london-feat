import { SessionService } from "@shared/services/account/SessionService.js";
import { api } from "@shared/api/client.js";
import { muscleArt } from "@shared/domain/muscle-art.js";
import { exerciseOf } from "./catalog.js";

export function ensureDay(state) {
  if (!state.plan || !state.plan.split || !state.plan.split.length) {
    state.plan = {
      name: "Meu Plano",
      source: "custom",
      split: [{ name: "Dia 1", focus: [], items: [] }]
    };
    state.planDay = 0;
  }
  const i = Math.max(0, Math.min(state.planDay || 0, state.plan.split.length - 1));
  state.planDay = i;
  return state.plan.split[i];
}

export function dayMuscles(day) {
  const set = new Set((day && day.focus) || []);
  ((day && day.items) || []).forEach((it) => {
    const e = exerciseOf(it.id);
    if (e && e.muscle && muscleArt(e.muscle)) set.add(e.muscle);
  });
  return Array.from(set);
}

export function addExercisesToDay(state, exercises, replaceIndex) {
  const day = ensureDay(state);
  const items = exercises.map((ex) => ({
    id: ex.id,
    sets: ex.sets || 3,
    reps: ex.reps || 12,
    kg: ex.kg || 0,
    rest: ex.rest || state.profile.restDefault || 60
  }));
  if (replaceIndex != null && replaceIndex >= 0 && day.items[replaceIndex]) {
    day.items.splice(replaceIndex, 1, items[0]);
    if (items.length > 1) day.items.splice(replaceIndex + 1, 0, ...items.slice(1));
  } else {
    day.items = (day.items || []).concat(items);
  }
  day.focus = dayMuscles(day);
  persistPlan(state);
}

export function removeExerciseFromDay(state, index) {
  const day = ensureDay(state);
  day.items.splice(index, 1);
  day.focus = dayMuscles(day);
  persistPlan(state);
}

export function updateDayItem(state, index, patch) {
  const day = ensureDay(state);
  day.items[index] = Object.assign({}, day.items[index], patch);
  persistPlan(state);
}

export function reorderDayItems(state, from, to) {
  const day = ensureDay(state);
  const items = day.items || [];
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return;
  const next = items.slice();
  const [row] = next.splice(from, 1);
  next.splice(to, 0, row);
  day.items = next;
  persistPlan(state);
}

export function applyLoadToDay(state, patch) {
  const day = ensureDay(state);
  day.items = (day.items || []).map((it) => Object.assign({}, it, patch));
  persistPlan(state);
}

export function persistPlan(state) {
  if (SessionService.hasToken() && state.plan && state.plan.id) {
    api.plans.update(state.plan.id, {
      days: state.plan.split.map((day) => ({
        name: day.name,
        focus: day.focus || [],
        exercises: SessionService.payloadItems(day.items)
      }))
    }).catch(() => {});
  }
}

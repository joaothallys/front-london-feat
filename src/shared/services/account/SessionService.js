import { api, unwrap, readTokens, clearTokens } from "../../api/client.js";
import { BiometricService } from "./BiometricService.js";
import { catalog as D } from "../../catalog/index.js";
import { ChestLibraryService } from "../exercises/ChestLibraryService.js";
import { defaultLocations } from "../../domain/locations.js";

const EQUIPMENT_TO_API = { cabo: "polia", nenhum: "peso-corporal" };
const EQUIPMENT_OK = { halteres: 1, barra: 1, polia: 1, maquina: 1, banco: 1, elastico: 1, kettlebell: 1, "peso-corporal": 1 };
const FOCUS_TO_API = { bracos: "biceps" };
const FOCUS_OK = { peito: 1, costas: 1, ombros: 1, biceps: 1, triceps: 1, pernas: 1, gluteos: 1, abdomen: 1, "corpo-inteiro": 1 };

function genderForApp(value) {
  if (value === "male" || value === "homem") return "homem";
  if (value === "female" || value === "mulher") return "mulher";
  return value || "";
}

function genderForProfile(value) {
  const g = genderForApp(value);
  if (g === "homem") return "male";
  if (g === "mulher") return "female";
  return value || null;
}

function genderForGenerate(value) {
  return genderForApp(value) || null;
}

function mapEnumList(list, aliases, allowed, fallback) {
  const out = [];
  (list || []).forEach((id) => {
    const mapped = aliases[id] || id;
    if (allowed[mapped] && out.indexOf(mapped) < 0) out.push(mapped);
  });
  return out.length ? out : fallback.slice();
}

function equipmentForApi(list) {
  return mapEnumList(list, EQUIPMENT_TO_API, EQUIPMENT_OK, ["halteres", "barra", "polia", "maquina"]);
}

function focusForApi(list) {
  return mapEnumList(list, FOCUS_TO_API, FOCUS_OK, ["corpo-inteiro"]);
}

function knownExercise(id) {
  if (!id) return false;
  if (ChestLibraryService.get(id) || (D.byId && D.byId[id])) return true;
  if (/^exr_/.test(id) || /^[A-Za-z0-9]{6,10}$/.test(id)) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)+$/.test(id);
}

function isIaUnavailable(err) {
  if (!err) return false;
  if (err.code === "timeout" || err.status === 502) return true;
  const code = err.body && err.body.error;
  return code === "ia_unavailable";
}

function first(obj, keys, fallback) {
  for (let i = 0; i < keys.length; i += 1) {
    const value = obj && obj[keys[i]];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return fallback;
}

function asList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (Array.isArray(value.items)) return value.items;
  if (Array.isArray(value.rows)) return value.rows;
  if (Array.isArray(value.exercises)) return value.exercises;
  if (Array.isArray(value.locations)) return value.locations;
  if (Array.isArray(value.workouts)) return value.workouts;
  if (Array.isArray(value.sessions)) return value.sessions;
  if (Array.isArray(value.favorites)) return value.favorites;
  if (Array.isArray(value.payments)) return value.payments;
  if (Array.isArray(value.plans)) return value.plans;
  if (Array.isArray(value.history)) return value.history;
  return [];
}

function byPosition(a, b) {
  return (Number(a && a.position) || 0) - (Number(b && b.position) || 0);
}

function mapItems(list) {
  return asList(list).slice().sort(byPosition).map((item) => {
    const exerciseId = item.exerciseId || item.exercise_id || "";
    return {
      id: exerciseId,
      rowId: item.id && item.id !== exerciseId ? item.id : null,
      sets: Number(first(item, ["sets"], 3)) || 3,
      reps: Number(first(item, ["reps"], 10)) || 10,
      kg: Number(first(item, ["kg"], 0)) || 0,
      rest: Number(first(item, ["restSec", "rest", "rest_sec"], 90)) || 90
    };
  }).filter((item) => knownExercise(item.id));
}

function payloadItems(items) {
  return (items || []).map((item) => ({
    exerciseId: item.exerciseId || item.id,
    sets: Number(item.sets) || 3,
    reps: Number(item.reps) || 10,
    kg: Number(item.kg) || 0,
    restSec: Number(item.rest || item.restSec) || 90
  }));
}

function mapPlan(raw) {
  if (!raw) return null;
  const days = asList(raw.days || raw.split).slice().sort(byPosition);
  return {
    id: raw.id || null,
    name: raw.name || "Meu plano",
    source: raw.source || "ia",
    goal: raw.goal || "",
    level: raw.level || "",
    days: Number(raw.daysPerWeek) || days.length,
    split: days.map((day) => ({
      id: day.id || null,
      name: day.name || "Treino",
      focus: asList(day.focus || day.muscles),
      items: mapItems(day.exercises || day.items)
    }))
  };
}

function mapMembership(raw, profile, email) {
  const root = unwrap(raw) || {};
  const membership = root.membership || root;
  const plan = root.plan || membership.plan || {};
  const unit = root.unit || membership.unit || {};
  const payments = asList(root.payments || membership.payments).map((row) => ({
    date: first(row, ["paidAt", "dueDate", "date", "paid_at", "due_date"], ""),
    value: Number(first(row, ["amount", "value"], 0)) || 0,
    status: first(row, ["status"], "")
  }));
  return {
    name: first(profile, ["name"], first(membership, ["name"], "")),
    email: email || first(membership, ["email"], ""),
    phone: first(profile, ["phone"], first(membership, ["phone"], "")),
    code: first(membership, ["memberCode", "member_code", "code"], ""),
    plan: first(plan, ["name"], first(membership, ["planName", "plan"], "")),
    status: first(membership, ["status"], "ativa"),
    startedAt: first(membership, ["startedAt", "started_at"], ""),
    expiresAt: first(membership, ["expiresAt", "expires_at"], ""),
    nextPayment: first(membership, ["nextPaymentAt", "next_payment_at", "nextPayment"], ""),
    amount: Number(first(plan, ["amount"], first(membership, ["amount"], 0))) || 0,
    unit: first(unit, ["name"], first(membership, ["unitName", "unit"], "")),
    payments
  };
}

function mapLocation(row) {
  return {
    id: first(row, ["id"], ""),
    name: first(row, ["name"], "Local"),
    type: first(row, ["type"], "gym"),
    equipment: asList(first(row, ["equipment"], []))
  };
}

function mapHistory(row) {
  return {
    id: first(row, ["id"], ""),
    date: first(row, ["finishedAt", "startedAt", "date", "createdAt"], new Date().toISOString()),
    name: first(row, ["name"], "Treino"),
    duration: Number(first(row, ["durationMin", "duration"], 0)) || 0,
    volume: Number(first(row, ["volumeKg", "volume"], 0)) || 0,
    calories: Number(first(row, ["calories"], 0)) || 0,
    exercises: Number(first(row, ["exercisesCount", "exercises"], 0)) || 0,
    sets: Number(first(row, ["setsCount", "sets"], 0)) || 0
  };
}

function applyProfile(state, user, profile) {
  const p = profile || {};
  state.profile.name = first(p, ["name"], state.profile.name);
  state.profile.email = first(user, ["email"], state.profile.email);
  state.profile.gender = genderForApp(first(p, ["gender"], state.profile.gender));
  state.profile.goal = first(p, ["goal"], state.profile.goal);
  state.profile.level = first(p, ["level"], state.profile.level);
  state.profile.environment = first(p, ["environment"], state.profile.environment);
  state.profile.days = Number(first(p, ["trainingDays", "days"], state.profile.days)) || state.profile.days;
  state.profile.sessionDuration = Number(first(p, ["sessionDurationMin", "sessionDuration"], state.profile.sessionDuration)) || 60;
  state.profile.restDefault = Number(first(p, ["restDefaultSec", "restDefault"], state.profile.restDefault)) || 90;
  state.profile.sound = first(p, ["soundEnabled", "sound"], state.profile.sound) !== false;
  state.profile.unitKg = first(p, ["unitKg"], state.profile.unitKg) !== false;
  state.profile.equipment = asList(first(p, ["equipment"], state.profile.equipment));
  state.profile.focusMuscles = asList(first(p, ["focus", "focusMuscles"], state.profile.focusMuscles));
  state.settings.restDefault = state.profile.restDefault;
  state.settings.sound = state.profile.sound;
  state.settings.language = first(p, ["language"], state.settings.language || "pt-BR");
  state.settings.reminders = !!first(p, ["reminders"], state.settings.reminders);
  state.onboardingDone = !!(first(user, ["onboardingDone", "onboarding_done"], false) || first(p, ["onboardingDone"], false));
}

async function settled(label, fn, onOk) {
  try {
    const json = await fn();
    if (onOk) onOk(unwrap(json), json);
  } catch (err) {
    if (err && err.status === 401) throw err;
  }
}

export const SessionService = {
  hasToken() {
    const tokens = readTokens();
    return !!(tokens.accessToken || tokens.refreshToken);
  },

  async hydrate(state) {
    const meJson = await api.auth.me();
    const me = unwrap(meJson) || {};
    const user = me.user || me;
    const profile = me.profile || user.profile || me;
    applyProfile(state, user, profile);
    state.session = { at: Date.now(), userId: first(user, ["id"], null) };

    await Promise.all([
      settled("membership", () => api.membership.get(), (data) => {
        state.member = mapMembership(data, profile, user.email);
      }),
      settled("locations", () => api.locations.list(), (data) => {
        const list = asList(data).map(mapLocation).filter((row) => row.id);
        state.locations = list.length ? list : defaultLocations();
        const active = asList(data).find((row) => row.isActive || row.is_active);
        state.activeLocationId = (active && active.id) || (state.locations[0] && state.locations[0].id);
      }),
      settled("workouts", () => api.workouts.list(), (data) => {
        state.custom = asList(data).map((row) => ({
          id: first(row, ["id"], ""),
          name: first(row, ["name"], "Treino"),
          items: mapItems(first(row, ["exercises", "items"], []))
        }));
      }),
      settled("plan", () => api.plans.active(), (data) => {
        state.plan = mapPlan(data);
      }),
      settled("history", async () => {
        try {
          return await api.history.list();
        } catch (err) {
          return api.sessions.list("completed");
        }
      }, (data) => {
        state.history = asList(data).map(mapHistory);
      }),
      settled("favorites", () => api.favorites.list(), (data) => {
        state.favorites = asList(data).map((row) => typeof row === "string" ? row : first(row, ["exerciseId", "id"], "")).filter(Boolean);
      }),
      settled("feedback", () => api.feedback.list(), (data) => {
        const map = {};
        asList(data).forEach((row) => {
          const id = first(row, ["exerciseId", "id"], "");
          const value = first(row, ["feedback"], row);
          if (id && (value === "positive" || value === "negative")) map[id] = { exerciseId: id, feedback: value };
        });
        if (!Array.isArray(data) && data && typeof data === "object") {
          Object.keys(data).forEach((id) => {
            const value = data[id] && data[id].feedback ? data[id].feedback : data[id];
            if (value === "positive" || value === "negative") map[id] = { exerciseId: id, feedback: value };
          });
        }
        state.feedback = map;
      }),
      settled("body", () => api.body.get(), (data) => {
        const current = (data && data.current) || data || {};
        state.bodyMeasures = {
          height: first(current, ["heightCm", "height"], null),
          weight: first(current, ["weightKg", "weight"], null),
          weightGoal: first(current, ["weightGoalKg", "weightGoal"], null)
        };
        state.profile.height = state.bodyMeasures.height;
        state.profile.weight = state.bodyMeasures.weight;
        state.profile.weightGoal = state.bodyMeasures.weightGoal;
      }),
      settled("recovery", () => api.recovery.get(), (data) => {
        const map = {};
        asList(data).forEach((row) => {
          const id = first(row, ["muscleId", "id"], "");
          const at = first(row, ["lastTrainedAt", "last_trained_at"], null);
          if (id && at) map[id] = new Date(at).getTime();
        });
        if (!asList(data).length && data && typeof data === "object") {
          Object.keys(data).forEach((id) => {
            const at = data[id] && data[id].lastTrainedAt ? data[id].lastTrainedAt : data[id];
            if (at) map[id] = new Date(at).getTime();
          });
        }
        if (Object.keys(map).length) state.recovery = Object.assign({}, state.recovery, map);
      }),
      settled("apps", () => api.apps.list(), (data) => {
        const list = asList(data);
        const map = {};
        list.forEach((row) => {
          const app = first(row, ["app", "id"], "");
          map[app] = first(row, ["status"], "disconnected");
        });
        if (!list.length && data && typeof data === "object") {
          Object.keys(data).forEach((app) => { map[app] = data[app]; });
        }
        state.connectedApps = {
          appleHealth: map.apple_health || map.appleHealth || state.connectedApps.appleHealth || "disconnected",
          strava: map.strava || state.connectedApps.strava || "disconnected"
        };
      })
    ]);
    return state;
  },

  async login(email, password) {
    return api.auth.login({ email, password });
  },

  async register(payload) {
    return api.auth.register(payload);
  },

  async logout() {
    const { refreshToken } = readTokens();
    try {
      if (refreshToken) await api.auth.logout(refreshToken);
    } catch (err) {}
    clearTokens();
  },

  async deleteAccount() {
    try {
      await api.auth.deleteAccount();
    } catch (err) {
      if (!(err && err.status === 404)) throw err;
    }
    try { await BiometricService.disable(); } catch (err) {}
    clearTokens();
  },

  async pushProfile(state) {
    return api.profile.update({
      name: state.profile.name,
      goal: state.profile.goal,
      level: state.profile.level,
      environment: state.profile.environment,
      trainingDays: state.profile.days,
      sessionDurationMin: state.profile.sessionDuration,
      restDefaultSec: state.profile.restDefault,
      soundEnabled: state.profile.sound,
      reminders: state.settings.reminders,
      language: state.settings.language || "pt-BR",
      unitKg: state.profile.unitKg,
      gender: genderForProfile(state.profile.gender),
      equipment: equipmentForApi(state.profile.equipment),
      focus: focusForApi(state.profile.focusMuscles)
    });
  },

  applyLocalPlan(state, onboard) {
    const goal = (onboard && onboard.goal) || state.profile.goal || "hipertrofia";
    const level = (onboard && onboard.level) || state.profile.level || "intermediario";
    const days = Number((onboard && onboard.days) || state.profile.days) || 4;
    try {
      state.plan = D.generatePlan({ goal, level, days });
    } catch (err) {
      const fallback = (D.programs || []).find((p) => p.id === "hipertrofia") || (D.programs || [])[0];
      state.plan = fallback ? JSON.parse(JSON.stringify(fallback)) : { name: "Meu plano", source: "local", split: [] };
    }
    if (state.plan) {
      state.plan.source = "local";
      state.plan.iaFailed = true;
    }
    state.onboardingDone = true;
    return state.plan;
  },

  generatePayload(state, onboard) {
    const days = Number((onboard && onboard.days) || state.profile.days) || 4;
    const goal = (onboard && onboard.goal) || state.profile.goal || "hipertrofia";
    return {
      source: "ia",
      name: "Plano " + goal,
      gender: genderForGenerate((onboard && onboard.gender) || state.profile.gender),
      goal,
      level: (onboard && onboard.level) || state.profile.level || "intermediario",
      environment: state.profile.environment || "academia",
      daysPerWeek: days,
      sessionDurationMin: state.profile.sessionDuration || 60,
      equipment: equipmentForApi(state.profile.equipment),
      focus: focusForApi(state.profile.focusMuscles)
    };
  },

  async generateIaPlan(state, onboard) {
    if (!this.hasToken()) {
      const err = new Error("no_token");
      err.status = 401;
      throw err;
    }
    const generated = await api.plans.generate(this.generatePayload(state, onboard));
    const plan = mapPlan(unwrap(generated));
    if (!plan || !plan.split || !plan.split.length) {
      const empty = new Error("ia_unavailable");
      empty.status = 502;
      empty.body = { error: "ia_unavailable" };
      throw empty;
    }
    state.plan = plan;
    state.plan.iaFailed = false;
    state.onboardingDone = true;
    return state.plan;
  },

  async finishOnboarding(state, onboard) {
    if (!this.hasToken()) {
      const err = new Error("no_token");
      err.status = 401;
      throw err;
    }
    const days = Number(onboard.days) || 4;
    const equipment = equipmentForApi(state.profile.equipment);
    const focus = focusForApi(state.profile.focusMuscles);
    await api.profile.onboarding({
      name: onboard.name,
      gender: genderForProfile(onboard.gender || state.profile.gender),
      goal: onboard.goal,
      level: onboard.level,
      environment: state.profile.environment || "academia",
      trainingDays: days,
      sessionDurationMin: state.profile.sessionDuration || 60,
      equipment,
      focus
    });
    try {
      return await this.generateIaPlan(state, onboard);
    } catch (err) {
      const requestId = (err && (err.requestId || (err.body && err.body.requestId))) || "";
      if (requestId) console.warn("[plans/generate]", (err.body && err.body.error) || err.message, requestId);
      throw err;
    }
  },

  async syncActivePlan(state) {
    if (!this.hasToken()) return state.plan;
    const data = unwrap(await api.plans.active());
    const plan = mapPlan(data);
    if (plan && plan.split && plan.split.length) {
      state.plan = plan;
      return state.plan;
    }
    if (!state.plan || !state.plan.split || !state.plan.split.length) {
      return this.applyLocalPlan(state);
    }
    return state.plan;
  },

  isIaUnavailable,

  payloadItems,

  mapPlan,
  mapHistory
};

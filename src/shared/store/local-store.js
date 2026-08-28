import { catalog } from "../catalog/index.js";
import { blankProfile } from "../domain/profile.js";
import { defaultLocations } from "../domain/locations.js";
import { clearTokens } from "../api/client.js";
import { storageGet, storageSet, storageRemove } from "../platform/storage.js";

const KEY = "london-fitness-v2";

function blank() {
  return {
    session: null,
    onboardingDone: false,
    profile: Object.assign(blankProfile(), {
      name: catalog.demoMember.name,
      email: catalog.demoMember.email
    }),
    member: JSON.parse(JSON.stringify(catalog.demoMember)),
    plan: null,
    custom: [],
    history: [],
    recovery: {},
    settings: { restDefault: 90, sound: true, language: "pt-BR", reminders: false, theme: "system" },
    locations: defaultLocations(),
    activeLocationId: "loc-academia",
    favorites: [],
    favoriteWorkouts: [],
    feedback: {},
    analytics: [],
    bodyMeasures: { height: null, weight: null, weightGoal: null },
    connectedApps: { appleHealth: "disconnected", strava: "disconnected" },
    planDay: 0,
    liveSession: null
  };
}

function seed(state) {
  const today = new Date();
  const names = ["A · Peito e tríceps", "B · Costas e bíceps", "C · Pernas"];
  for (let i = 18; i >= 1; i -= 1) {
    if (i % 7 === 0 || i % 7 === 6) continue;
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const vol = 8000 + Math.round(Math.random() * 6000);
    state.history.push({
      id: "h" + i,
      date: d.toISOString(),
      name: names[i % 3],
      duration: 42 + (i % 18),
      volume: vol,
      calories: 280 + (i % 90),
      exercises: 6,
      sets: 18
    });
  }
  state.recovery = {
    peito: Date.now() - 36 * 3600 * 1000,
    costas: Date.now() - 12 * 3600 * 1000,
    ombros: Date.now() - 20 * 3600 * 1000,
    biceps: Date.now() - 12 * 3600 * 1000,
    triceps: Date.now() - 36 * 3600 * 1000,
    quadriceps: Date.now() - 8 * 3600 * 1000,
    posterior: Date.now() - 8 * 3600 * 1000,
    gluteos: Date.now() - 8 * 3600 * 1000,
    panturrilha: Date.now() - 24 * 3600 * 1000,
    abdomen: Date.now() - 6 * 3600 * 1000
  };
  return state;
}

function load() {
  try {
    const raw = storageGet(KEY);
    if (!raw) return blank();
    const next = Object.assign(blank(), JSON.parse(raw));
    next.settings = Object.assign({}, blank().settings, next.settings || {});
    return next;
  } catch (e) {
    return blank();
  }
}

function save(state) {
  storageSet(KEY, JSON.stringify(state));
}

const state = load();

export const store = {
  get: () => state,
  persist() { save(state); },
  rehydrate() {
    const next = load();
    Object.keys(state).forEach((key) => { delete state[key]; });
    Object.assign(state, next);
    return state;
  },
  login(session) {
    state.session = Object.assign({ at: Date.now() }, session || {});
    save(state);
  },
  logout() {
    state.session = null;
    save(state);
  },
  reset() {
    clearTokens();
    storageRemove(KEY);
    if (typeof location !== "undefined" && location.reload) {
      location.hash = "#/splash";
      location.reload();
    }
  }
};

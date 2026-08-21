import { storageGet, storageSet, storageRemove } from "../platform/storage.js";
import { apiBaseUrl, clientDevice } from "../platform/env.js";

const TOKEN_KEY = "london-fitness-tokens";
const DEVICE = clientDevice();

function baseUrl() {
  return apiBaseUrl();
}

function apiUrl(path) {
  return baseUrl() + path;
}

export function readTokens() {
  try {
    return JSON.parse(storageGet(TOKEN_KEY) || "null") || {};
  } catch (err) {
    return {};
  }
}

export function writeTokens(tokens) {
  if (!tokens || (!tokens.accessToken && !tokens.refreshToken)) {
    storageRemove(TOKEN_KEY);
    return;
  }
  storageSet(TOKEN_KEY, JSON.stringify({
    accessToken: tokens.accessToken || "",
    refreshToken: tokens.refreshToken || ""
  }));
}

export function clearTokens() {
  storageRemove(TOKEN_KEY);
}

export function unwrap(json) {
  if (!json || typeof json !== "object") return json;
  if (Object.prototype.hasOwnProperty.call(json, "data")) return json.data;
  return json;
}

function errorFrom(json, status, headers) {
  const err = new Error((json && (json.error || json.message)) || ("HTTP " + status));
  err.status = status;
  err.body = json;
  err.requestId = (json && json.requestId)
    || (headers && headers.get && (headers.get("X-Request-Id") || headers.get("x-request-id")))
    || "";
  return err;
}

function authHeaders(extra) {
  const headers = Object.assign({ Accept: "application/json" }, extra || {});
  const { accessToken } = readTokens();
  if (accessToken) headers.Authorization = "Bearer " + accessToken;
  return headers;
}

let refreshWait = null;

async function refreshAccess() {
  const { refreshToken } = readTokens();
  if (!refreshToken) return false;
  if (refreshWait) return refreshWait;
  refreshWait = (async () => {
    const res = await fetch(apiUrl("/api/auth/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refreshToken, device: DEVICE })
    });
    let json = null;
    try { json = await res.json(); } catch (e) { json = null; }
    if (!res.ok) {
      clearTokens();
      return false;
    }
    writeTokens({
      accessToken: json.accessToken || (json.data && json.data.accessToken),
      refreshToken: json.refreshToken || (json.data && json.data.refreshToken) || refreshToken
    });
    return true;
  })().finally(() => { refreshWait = null; });
  return refreshWait;
}

async function request(path, opts, retry) {
  const init = Object.assign({ method: "GET" }, opts || {});
  const timeoutMs = init.timeoutMs;
  delete init.timeoutMs;
  const headers = authHeaders(init.headers);
  if (init.body && typeof init.body === "object" && !(init.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(init.body);
  }
  init.headers = headers;
  let timer = null;
  if (timeoutMs) {
    const controller = new AbortController();
    init.signal = controller.signal;
    timer = setTimeout(() => controller.abort(), timeoutMs);
  }
  let res;
  try {
    res = await fetch(apiUrl(path), init);
  } catch (err) {
    if (timer) clearTimeout(timer);
    if (err && (err.name === "AbortError" || err.message === "Aborted")) {
      const timeout = new Error("timeout");
      timeout.status = 0;
      timeout.code = "timeout";
      throw timeout;
    }
    throw err;
  }
  if (timer) clearTimeout(timer);
  if (res.status === 204) return {};
  let json = null;
  try { json = await res.json(); } catch (e) { json = null; }
  if (res.status === 401 && !retry && path.indexOf("/api/auth/") !== 0) {
    const ok = await refreshAccess();
    if (ok) return request(path, Object.assign({}, opts, { timeoutMs }), true);
  }
  if (!res.ok) throw errorFrom(json, res.status, res.headers);
  return json;
}

function saveAuth(json) {
  writeTokens({
    accessToken: json.accessToken || (json.data && json.data.accessToken),
    refreshToken: json.refreshToken || (json.data && json.data.refreshToken)
  });
  return json;
}

function catalogPayload(json) {
  if (!json || typeof json !== "object") return { data: [], pagination: {} };
  const inner = json.data && typeof json.data === "object" && !Array.isArray(json.data) ? json.data : json;
  const rows = Array.isArray(inner) ? inner
    : Array.isArray(inner.data) ? inner.data
    : Array.isArray(inner.items) ? inner.items
    : Array.isArray(inner.rows) ? inner.rows
    : [];
  return {
    data: rows,
    pagination: inner.pagination || json.pagination || {
      page: 1,
      limit: rows.length,
      total: rows.length,
      totalPages: 1
    }
  };
}

function qstr(params) {
  const q = new URLSearchParams();
  Object.keys(params || {}).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
      q.set(key, String(params[key]));
    }
  });
  const s = q.toString();
  return s ? "?" + s : "";
}

export const api = {
  device: DEVICE,

  list(params) {
    const src = params || {};
    return request("/api/exercises" + qstr({
      page: src.page,
      limit: src.limit,
      search: src.search,
      bodyPart: src.bodyPart,
      equipment: src.equipment,
      targetMuscle: src.targetMuscle
    })).then(catalogPayload);
  },
  search(term, page, limit) {
    return request("/api/exercises/search" + qstr({ q: term || "", page, limit })).then(catalogPayload);
  },
  getById(id, opts) {
    return request("/api/exercises/" + encodeURIComponent(id) + qstr({
      gender: opts && opts.gender
    }));
  },
  filters() {
    return request("/api/exercises/filters").then((json) => {
      const data = unwrap(json) || {};
      return {
        bodyParts: data.bodyParts || data.body_parts || [],
        equipments: data.equipments || [],
        targetMuscles: data.targetMuscles || data.target_muscles || []
      };
    });
  },
  syncStatus() {
    return request("/api/admin/exercises/sync/status").then((json) => unwrap(json) || json);
  },
  sync() {
    return request("/api/admin/exercises/sync", { method: "POST" });
  },
  mediaFallback(name) {
    return request("/api/media/fallback" + qstr({ q: name || "" }));
  },
  media: {
    exercise(params) {
      const src = params || {};
      return request("/api/media/exercise" + qstr({ q: src.q || "", gender: src.gender || "" }));
    },
    fallback(q) {
      return request("/api/media/fallback" + qstr({ q: q || "" }));
    },
    muscles() {
      return request("/api/media/muscles");
    }
  },

  auth: {
    register(body) {
      return request("/api/auth/register", { method: "POST", body: Object.assign({ device: DEVICE }, body) }).then(saveAuth);
    },
    login(body) {
      return request("/api/auth/login", { method: "POST", body: Object.assign({ device: DEVICE }, body) }).then(saveAuth);
    },
    refresh(refreshToken) {
      return request("/api/auth/refresh", { method: "POST", body: { refreshToken, device: DEVICE } }).then(saveAuth);
    },
    logout(refreshToken) {
      return request("/api/auth/logout", { method: "POST", body: { refreshToken } });
    },
    me() {
      return request("/api/auth/me");
    }
  },

  profile: {
    get() { return request("/api/profile"); },
    update(body) { return request("/api/profile", { method: "PUT", body }); },
    onboarding(body) { return request("/api/profile/onboarding", { method: "POST", body }); },
    equipment(equipment) { return request("/api/profile/equipment", { method: "PUT", body: { equipment } }); },
    focus(focus) { return request("/api/profile/focus", { method: "PUT", body: { focus } }); }
  },

  membership: {
    get() { return request("/api/membership"); },
    create(body) { return request("/api/membership", { method: "POST", body }); },
    payments() { return request("/api/membership/payments"); },
    addPayment(body) { return request("/api/membership/payments", { method: "POST", body }); },
    updatePayment(id, body) { return request("/api/membership/payments/" + id, { method: "PUT", body }); }
  },
  gymUnits() { return request("/api/gym-units"); },
  membershipPlans() { return request("/api/membership-plans"); },

  locations: {
    list() { return request("/api/locations"); },
    create(body) { return request("/api/locations", { method: "POST", body }); },
    update(id, body) { return request("/api/locations/" + id, { method: "PUT", body }); },
    equipment(id, equipment) { return request("/api/locations/" + id + "/equipment", { method: "PUT", body: { equipment } }); },
    activate(id) { return request("/api/locations/" + id + "/activate", { method: "PUT" }); },
    remove(id) { return request("/api/locations/" + id, { method: "DELETE" }); }
  },

  workouts: {
    list() { return request("/api/workouts"); },
    create(body) { return request("/api/workouts", { method: "POST", body }); },
    get(id) { return request("/api/workouts/" + id); },
    update(id, body) { return request("/api/workouts/" + id, { method: "PUT", body }); },
    remove(id) { return request("/api/workouts/" + id, { method: "DELETE" }); }
  },

  plans: {
    list() { return request("/api/plans"); },
    active() { return request("/api/plans/active"); },
    generate(body) { return request("/api/plans/generate", { method: "POST", body, timeoutMs: 50000 }); },
    setActive(planId) { return request("/api/plans/active", { method: "PUT", body: { planId } }); },
    get(id) { return request("/api/plans/" + id); },
    update(id, body) { return request("/api/plans/" + id, { method: "PUT", body }); },
    remove(id) { return request("/api/plans/" + id, { method: "DELETE" }); }
  },

  sessions: {
    current() { return request("/api/sessions/current"); },
    list(status) { return request("/api/sessions" + qstr({ status: status || "completed" })); },
    start(body) { return request("/api/sessions", { method: "POST", body }); },
    get(id) { return request("/api/sessions/" + id); },
    update(id, body) { return request("/api/sessions/" + id, { method: "PUT", body }); },
    complete(id, body) { return request("/api/sessions/" + id + "/complete", { method: "POST", body }); },
    finish(body) { return request("/api/sessions/complete", { method: "POST", body }); },
    abandon(id) { return request("/api/sessions/" + id + "/abandon", { method: "POST" }); }
  },
  history: {
    list() { return request("/api/history"); },
    get(id) { return request("/api/history/" + id); }
  },
  progress: {
    get(range) { return request("/api/progress" + qstr({ range: range || "week" })); },
    exercises(range) { return request("/api/progress/exercises" + qstr({ range: range || "all" })); },
    muscles(range) { return request("/api/progress/muscles" + qstr({ range: range || "month" })); },
    calendar(year, month) { return request("/api/progress/calendar" + qstr({ year, month })); }
  },

  body: {
    get() { return request("/api/body"); },
    create(body) { return request("/api/body", { method: "POST", body }); }
  },
  recovery: {
    get() { return request("/api/recovery"); },
    update(body) { return request("/api/recovery", { method: "PUT", body }); }
  },
  favorites: {
    list() { return request("/api/favorites"); },
    add(exerciseId) { return request("/api/favorites/" + encodeURIComponent(exerciseId), { method: "POST" }); },
    remove(exerciseId) { return request("/api/favorites/" + encodeURIComponent(exerciseId), { method: "DELETE" }); }
  },
  feedback: {
    list() { return request("/api/feedback"); },
    set(exerciseId, feedback) { return request("/api/feedback/" + encodeURIComponent(exerciseId), { method: "PUT", body: { feedback } }); }
  },
  analytics: {
    track(body) { return request("/api/analytics", { method: "POST", body }); }
  },
  apps: {
    list() { return request("/api/apps"); },
    update(app, status) { return request("/api/apps/" + encodeURIComponent(app), { method: "PUT", body: { status } }); }
  }
};

export { DEVICE as AUTH_DEVICE };
export default api;

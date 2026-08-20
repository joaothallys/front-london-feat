function baseUrl() {
  const raw = typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env.VITE_API_URL
    : "";
  const value = String(raw || "").trim().replace(/\/$/, "");
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return "https://" + value;
}

function apiUrl(path) {
  return baseUrl() + path;
}

async function request(path, opts) {
  const res = await fetch(apiUrl(path), opts);
  let json = null;
  try { json = await res.json(); } catch (e) { json = null; }
  if (!res.ok) {
    const err = new Error((json && (json.error || json.message)) || ("HTTP " + res.status));
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}

export const api = {
  list(params) {
    const q = new URLSearchParams();
    const src = params || {};
    if (src.page) q.set("page", src.page);
    if (src.limit) q.set("limit", src.limit);
    if (src.search) q.set("search", src.search);
    if (src.bodyPart) q.set("bodyPart", src.bodyPart);
    if (src.equipment) q.set("equipment", src.equipment);
    if (src.targetMuscle) q.set("targetMuscle", src.targetMuscle);
    return request("/api/exercises?" + q.toString());
  },
  search(term, page, limit) {
    const q = new URLSearchParams();
    q.set("q", term || "");
    if (page) q.set("page", page);
    if (limit) q.set("limit", limit);
    return request("/api/exercises/search?" + q.toString());
  },
  getById(id) {
    return request("/api/exercises/" + encodeURIComponent(id));
  },
  filters() {
    return request("/api/exercises/filters");
  },
  syncStatus() {
    return request("/api/admin/exercises/sync/status");
  },
  sync() {
    return request("/api/admin/exercises/sync", { method: "POST" });
  },
  mediaFallback(name) {
    return request("/api/media/fallback?q=" + encodeURIComponent(name || ""));
  }
};

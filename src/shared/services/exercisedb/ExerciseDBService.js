import { api } from "../../api/client.js";
import { EXERCISEDB_OSS_BASE, normalizeRemoteExercise } from "./ExerciseDBTypes.js";

const memory = new Map();
const TTL = 10 * 60 * 1000;

function cached(key, value) {
  memory.set(key, { value, at: Date.now() });
  return value;
}

function readCache(key) {
  const hit = memory.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > TTL) {
    memory.delete(key);
    return null;
  }
  return hit.value;
}

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}

async function fromOss(params) {
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.bodyPart) q.set("bodyPart", params.bodyPart);
  if (params.equipment) q.set("equipment", params.equipment);
  q.set("limit", String(params.limit || 100));
  q.set("offset", String(params.offset || 0));
  const json = await getJson(EXERCISEDB_OSS_BASE + "/exercises?" + q.toString());
  return (json.data || []).map(normalizeRemoteExercise);
}

async function fromBackend(params) {
  if (params.id) {
    const res = await api.getById(params.id);
    const row = res && (res.data || res);
    return row ? [normalizeRemoteExercise(row)] : [];
  }
  if (params.search && !params.bodyPart) {
    const res = await api.search(params.search, params.page || 1, params.limit || 50);
    return (res.data || []).map(normalizeRemoteExercise);
  }
  const res = await api.list({
    page: params.page || 1,
    limit: params.limit || 100,
    search: params.search || "",
    bodyPart: params.bodyPart || "",
    equipment: params.equipment || "",
    targetMuscle: params.targetMuscle || ""
  });
  return (res.data || []).map(normalizeRemoteExercise);
}

export const ExerciseDBService = {
  async list(params) {
    const key = "list:" + JSON.stringify(params || {});
    const hit = readCache(key);
    if (hit) return hit;
    try {
      return cached(key, await fromBackend(params || {}));
    } catch (err) {
      try {
        return cached(key, await fromOss(params || {}));
      } catch (fallbackErr) {
        return [];
      }
    }
  },

  async searchByName(name) {
    if (!name) return [];
    return this.list({ search: name, limit: 25 });
  },

  async byMuscle(bodyPart) {
    return this.list({ bodyPart: bodyPart || "chest", limit: 100 });
  },

  async byEquipment(equipment) {
    return this.list({ equipment, limit: 100 });
  },

  async getById(id) {
    const key = "id:" + id;
    const hit = readCache(key);
    if (hit) return hit;
    try {
      const rows = await fromBackend({ id });
      return cached(key, rows[0] || null);
    } catch (err) {
      const rows = await fromOss({ search: id, limit: 10 });
      const found = rows.find((row) => row.sourceId === id) || rows[0] || null;
      return cached(key, found);
    }
  },

  gifUrl(sourceId) {
    return sourceId ? "https://static.exercisedb.dev/media/" + sourceId + ".gif" : "";
  }
};

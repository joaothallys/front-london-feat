import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { chestCatalog } from "../src/shared/data/exercises/exerciseCatalog.js";
import { ExerciseDBMapper } from "../src/shared/services/exercisedb/ExerciseDBMapper.js";

const root = path.dirname(fileURLToPath(import.meta.url));
const API = process.env.VITE_API_URL || process.env.API_URL || "https://oss.exercisedb.dev/api/v1";

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(url + " → HTTP " + res.status);
  return res.json();
}

async function loadChest() {
  const railway = (process.env.VITE_API_URL || "").replace(/\/$/, "");
  if (railway && !railway.includes("oss.exercisedb.dev")) {
    const rows = [];
    for (let page = 1; page <= 3; page += 1) {
      const json = await getJson(railway + "/api/exercises?bodyPart=chest&page=" + page + "&limit=100");
      rows.push(...(json.data || []));
      if (!json.pagination || page >= json.pagination.totalPages) break;
    }
    return rows;
  }
  const json = await getJson("https://oss.exercisedb.dev/api/v1/exercises?bodyPart=chest&limit=200");
  return json.data || [];
}

const remotes = await loadChest();
const report = chestCatalog.map((exercise) => {
  const remote = exercise.sourceId
    ? remotes.find((row) => (row.exerciseId || row.externalId) === exercise.sourceId)
    : ExerciseDBMapper.match(exercise, remotes);
  return {
    id: exercise.id,
    displayName: exercise.displayName,
    sourceId: (remote && (remote.sourceId || remote.exerciseId || remote.externalId)) || exercise.sourceId || "",
    sourceName: (remote && (remote.sourceName || remote.name)) || exercise.sourceName || "",
    gifUrl: (remote && remote.gifUrl) || (exercise.sourceId ? "https://static.exercisedb.dev/media/" + exercise.sourceId + ".gif" : ""),
    matched: !!remote
  };
});

const out = {
  updatedAt: new Date().toISOString(),
  total: report.length,
  matched: report.filter((row) => row.matched).length,
  unmatched: report.filter((row) => !row.matched).map((row) => row.id),
  exercises: report
};

const file = path.resolve(root, "../src/shared/data/exercises/chestSync.generated.json");
writeFileSync(file, JSON.stringify(out, null, 2));
console.log("Peito: " + out.matched + "/" + out.total + " mapeados");
if (out.unmatched.length) console.log("Sem match na API:", out.unmatched.join(", "));
console.log("Arquivo:", file);

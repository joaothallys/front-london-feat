import { ACADEMIA_EQUIPMENT } from "../../types/exercise.js";
import { getChestCatalog, getCatalogExercise, catalogToAppView } from "../../data/exercises/exerciseCatalog.js";
import { ExerciseDBService } from "../exercisedb/ExerciseDBService.js";
import { ExerciseDBMapper } from "../exercisedb/ExerciseDBMapper.js";
import { ExerciseCache } from "../cache/ExerciseCache.js";
import { resolveExerciseMedia } from "../media/MediaResolver.js";
import { findSimilarExercises } from "./SimilarExercises.js";

let hydrated = [];
let ready = false;

function fold(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function applyMedia(exercise) {
  const next = Object.assign({}, exercise);
  next.media = resolveExerciseMedia(next);
  return next;
}

function fromCache() {
  const cached = ExerciseCache.allExercises();
  if (!cached.length) return getChestCatalog().map(applyMedia);
  const local = getChestCatalog();
  return local.map((exercise) => {
    const hit = cached.find((row) => row.id === exercise.id);
    if (!hit) return applyMedia(exercise);
    return applyMedia(Object.assign({}, exercise, {
      sourceId: exercise.sourceId || hit.sourceId,
      sourceName: exercise.sourceName || hit.sourceName,
      media: exercise.media && exercise.media.url ? exercise.media : {
        type: "gif",
        source: hit.mediaSource || "exercisedb",
        url: hit.mediaUrl
      }
    }));
  });
}

export const ChestLibraryService = {
  all() {
    return (hydrated.length ? hydrated : fromCache()).map(applyMedia);
  },

  get(id) {
    const list = this.all();
    return list.find((ex) => ex.id === id || ex.sourceId === id)
      || getCatalogExercise(id)
      || null;
  },

  view(id) {
    const exercise = this.get(id);
    if (!exercise) return null;
    const withMedia = applyMedia(exercise);
    return catalogToAppView(withMedia);
  },

  async hydrate() {
    if (ready && hydrated.length) return hydrated;
    const base = fromCache();
    try {
      const remotes = await ExerciseDBService.byMuscle("chest");
      hydrated = base.map((exercise) => {
        const remote = exercise.sourceId
          ? remotes.find((row) => row.sourceId === exercise.sourceId)
          : ExerciseDBMapper.match(exercise, remotes);
        return applyMedia(ExerciseDBMapper.merge(exercise, remote));
      });
      ExerciseCache.saveMany(hydrated);
      ready = true;
      return hydrated;
    } catch (err) {
      hydrated = base;
      return hydrated;
    }
  },

  filter(list, opts) {
    const q = fold(opts && opts.q);
    const level = (opts && opts.level) || "todos";
    const equipment = (opts && opts.equipment) || "todos";
    return (list || this.all()).filter((ex) => {
      if (!ex.isActive) return false;
      if (level !== "todos" && ex.level !== level) return false;
      if (equipment === "academia" && ACADEMIA_EQUIPMENT.indexOf(ex.equipmentId) < 0) return false;
      else if (equipment !== "todos" && equipment !== "academia" && ex.equipmentId !== equipment && !(equipment === "maquina" && ex.equipmentId === "smith")) return false;
      if (!q) return true;
      const hay = fold([
        ex.displayName,
        ex.sourceName,
        ex.equipment,
        ex.primaryMuscle,
        (ex.aliases || []).join(" ")
      ].join(" "));
      return hay.indexOf(q) >= 0;
    });
  },

  sort(list, sort) {
    const copy = (list || []).slice();
    if (sort === "az") copy.sort((a, b) => a.displayName.localeCompare(b.displayName, "pt-BR"));
    else if (sort === "za") copy.sort((a, b) => b.displayName.localeCompare(a.displayName, "pt-BR"));
    else if (sort === "recentes") copy.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0) || (b.popularity - a.popularity));
    else copy.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    return copy;
  },

  query(opts) {
    return this.sort(this.filter(this.all(), opts), (opts && opts.sort) || "popularidade");
  },

  similar(id, limit) {
    return findSimilarExercises(this.get(id), this.all(), limit || 3);
  }
};

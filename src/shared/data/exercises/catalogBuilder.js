import { exerciseAliases } from "./exerciseAliases.js";

const META = {
  peito: { primaryMuscle: "Peito", bodyPartRaw: "chest", targetRaw: "pectorals" },
  costas: { primaryMuscle: "Costas", bodyPartRaw: "back", targetRaw: "lats" },
  ombros: { primaryMuscle: "Ombros", bodyPartRaw: "shoulders", targetRaw: "delts" },
  biceps: { primaryMuscle: "Bíceps", bodyPartRaw: "upper arms", targetRaw: "biceps" },
  triceps: { primaryMuscle: "Tríceps", bodyPartRaw: "upper arms", targetRaw: "triceps" },
  quadriceps: { primaryMuscle: "Quadríceps", bodyPartRaw: "upper legs", targetRaw: "quadriceps" },
  gluteos: { primaryMuscle: "Glúteos", bodyPartRaw: "upper legs", targetRaw: "glutes" },
  posterior: { primaryMuscle: "Posteriores", bodyPartRaw: "upper legs", targetRaw: "hamstrings" },
  abdomen: { primaryMuscle: "Abdômen", bodyPartRaw: "waist", targetRaw: "abs" },
  adutores: { primaryMuscle: "Adutores", bodyPartRaw: "upper legs", targetRaw: "adductors" },
  abdutores: { primaryMuscle: "Abdutores", bodyPartRaw: "upper legs", targetRaw: "abductors" },
  panturrilha: { primaryMuscle: "Panturrilhas", bodyPartRaw: "lower legs", targetRaw: "calves" },
  trapezio: { primaryMuscle: "Trapézio", bodyPartRaw: "back", targetRaw: "traps" },
  antebracos: { primaryMuscle: "Antebraços", bodyPartRaw: "lower arms", targetRaw: "forearms" },
  obliquos: { primaryMuscle: "Oblíquos", bodyPartRaw: "waist", targetRaw: "abs" },
  lombar: { primaryMuscle: "Lombar", bodyPartRaw: "back", targetRaw: "spine" }
};

export function gif(id) {
  return id ? { type: "gif", source: "exercisedb", url: "https://static.exercisedb.dev/media/" + id + ".gif" } : null;
}

export function buildRow(order, spec) {
  const meta = META[spec.category] || META.peito;
  const popularity = order.length - order.indexOf(spec.id);
  return {
    id: spec.id,
    displayName: spec.displayName,
    sourceName: spec.sourceName || "",
    sourceId: spec.sourceId || "",
    source: "exercisedb",
    category: spec.category,
    primaryMuscle: spec.primaryMuscle || meta.primaryMuscle,
    secondaryMuscles: spec.secondaryMuscles || [],
    equipment: spec.equipment,
    equipmentId: spec.equipmentId,
    exerciseType: spec.exerciseType || "isolamento",
    level: spec.level,
    description: spec.description || "",
    instructions: spec.instructions || [],
    startingPosition: spec.startingPosition || "",
    commonErrors: spec.commonErrors || [],
    importantTips: spec.importantTips || [],
    aliases: exerciseAliases[spec.id] || [],
    popularity: popularity > 0 ? popularity : 0,
    media: spec.media !== undefined ? spec.media : gif(spec.sourceId),
    isActive: true,
    createdAt: 0,
    updatedAt: 0,
    bodyPartRaw: meta.bodyPartRaw,
    targetRaw: meta.targetRaw
  };
}

export function catalogToAppView(ex) {
  if (!ex) return null;
  const meta = META[ex.category] || META.peito;
  return {
    id: ex.id,
    externalId: ex.sourceId || ex.id,
    name: ex.displayName,
    originalName: ex.sourceName,
    localizedName: ex.displayName,
    muscle: ex.category,
    secondary: ex.secondaryMuscles || [],
    eq: ex.equipmentId,
    equipment: ex.equipment,
    exerciseType: ex.exerciseType || "isolamento",
    bodyPart: ex.primaryMuscle,
    bodyPartRaw: ex.bodyPartRaw || meta.bodyPartRaw,
    target: ex.primaryMuscle,
    targetRaw: ex.targetRaw || meta.targetRaw,
    gifUrl: ex.media && ex.media.url,
    gif: ex.media && ex.media.url,
    videoUrl: ex.media && ex.media.type === "video" ? ex.media.url : null,
    steps: (ex.instructions || []).map((step) => step.text),
    source: ex.source,
    level: ex.level,
    description: ex.description,
    startingPosition: ex.startingPosition || "",
    commonErrors: ex.commonErrors || [],
    importantTips: ex.importantTips || [],
    aliases: ex.aliases || [],
    popularity: ex.popularity,
    category: ex.category,
    sets: 3,
    reps: 12,
    kg: 12,
    rest: 60
  };
}

export const CATEGORY_META = {
  peito: { id: "peito", title: "Peito", bodyPart: "chest" },
  costas: { id: "costas", title: "Costas", bodyPart: "back", targetMuscle: "lats" },
  ombros: { id: "ombros", title: "Ombros", bodyPart: "shoulders" },
  biceps: { id: "biceps", title: "Bíceps", bodyPart: "upper arms", targetMuscle: "biceps" },
  triceps: { id: "triceps", title: "Tríceps", bodyPart: "upper arms", targetMuscle: "triceps" },
  quadriceps: { id: "quadriceps", title: "Quadríceps", bodyPart: "upper legs", targetMuscle: "quadriceps" },
  gluteos: { id: "gluteos", title: "Glúteos", bodyPart: "upper legs", targetMuscle: "glutes" },
  posterior: { id: "posterior", title: "Posteriores", bodyPart: "upper legs", targetMuscle: "hamstrings" },
  abdomen: { id: "abdomen", title: "Abdômen", bodyPart: "waist" },
  adutores: { id: "adutores", title: "Adutores", bodyPart: "upper legs", targetMuscle: "adductors" },
  abdutores: { id: "abdutores", title: "Abdutores", bodyPart: "upper legs", targetMuscle: "abductors" },
  panturrilha: { id: "panturrilha", title: "Panturrilhas", bodyPart: "lower legs", targetMuscle: "calves" },
  trapezio: { id: "trapezio", title: "Trapézio", bodyPart: "back", targetMuscle: "traps" },
  antebracos: { id: "antebracos", title: "Antebraços", bodyPart: "lower arms" },
  obliquos: { id: "obliquos", title: "Oblíquos", bodyPart: "waist", targetMuscle: "abs" },
  lombar: { id: "lombar", title: "Lombar", bodyPart: "back", targetMuscle: "spine" }
};

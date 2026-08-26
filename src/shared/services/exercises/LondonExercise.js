import { api, unwrap } from "../../api/client.js";
import { ChestLibraryService } from "./ChestLibraryService.js";
import { catalogToAppView } from "../../data/exercises/exerciseCatalog.js";
import { genderForApi } from "../media/LondonMediaService.js";

const remote = {};

export function isExerciseDbId(id) {
  const s = String(id || "");
  if (!s) return true;
  if (s.indexOf("exr_") === 0) return true;
  return /^[A-Za-z0-9]{6,10}$/.test(s);
}

export function isLondonId(id) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)+$/.test(String(id || ""));
}

function guessMuscle(id) {
  const s = String(id || "");
  if (/glute|hip-thrust|abduc|aduc/.test(s)) return "gluteos";
  if (/triceps|pulley|testa|frances/.test(s)) return "triceps";
  if (/leg|agacha|extensor|flexor|hack|avanco|passada|panturr/.test(s)) return "pernas";
  if (/rosca|biceps/.test(s)) return "biceps";
  if (/trapez|encolh/.test(s)) return "trapezio";
  if (/supino|crucifixo|flexao|crossover|peito/.test(s)) return "peito";
  if (/puxad|remada|barra-fixa|pullover/.test(s)) return "costas";
  if (/desenvolv|elevacao|ombro|face-pull/.test(s)) return "ombros";
  return "";
}

function titleFromId(id) {
  return String(id || "")
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function stubView(id) {
  const name = titleFromId(id);
  return {
    id,
    name,
    originalName: "",
    muscle: guessMuscle(id),
    category: guessMuscle(id),
    bodyPart: "",
    equipment: "",
    gifUrl: "",
    gif: "",
    imageUrl: "",
    videoUrl: "",
    sets: 3,
    reps: 10,
    kg: 0,
    rest: 75,
    _stub: true
  };
}

function viewFromApi(id, raw) {
  if (!raw) return null;
  const muscle = raw.category || raw.muscle || raw.primaryMuscle || guessMuscle(id);
  return {
    id: raw.id || raw.exerciseId || id,
    name: raw.displayName || raw.name || titleFromId(id),
    originalName: raw.sourceName || raw.originalName || "",
    muscle,
    category: muscle,
    bodyPart: raw.primaryMuscle || raw.bodyPart || "",
    equipment: raw.equipment || "",
    gifUrl: raw.gifUrl || raw.gif || "",
    gif: raw.gifUrl || raw.gif || "",
    imageUrl: raw.imageUrl || "",
    videoUrl: raw.videoUrl || "",
    sets: 3,
    reps: 10,
    kg: 0,
    rest: 75
  };
}

export function getCached(id) {
  if (!id) return null;
  if (remote[id]) return remote[id];
  const local = ChestLibraryService.get(id);
  return local ? catalogToAppView(local) : null;
}

export function remember(id, view) {
  if (id && view) remote[id] = view;
  return view;
}

export async function ensure(id, gender) {
  const hit = getCached(id);
  if (hit && !hit._stub) return hit;
  if (!isLondonId(id) && !hit) return null;
  try {
    const raw = unwrap(await api.getById(id, { gender: genderForApi(gender) || undefined }));
    const view = viewFromApi(id, raw);
    return view ? remember(id, view) : hit || stubView(id);
  } catch (err) {
    return hit || (isLondonId(id) ? stubView(id) : null);
  }
}

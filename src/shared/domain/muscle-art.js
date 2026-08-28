export const MUSCLE_ART = [
  { id: "peito", label: "Peito", bodyPart: "chest", targetMuscle: "" },
  { id: "costas", label: "Costas", bodyPart: "back", targetMuscle: "" },
  { id: "ombros", label: "Ombros", bodyPart: "shoulders", targetMuscle: "" },
  { id: "trapezio", label: "Trapézio", bodyPart: "", targetMuscle: "traps" },
  { id: "biceps", label: "Bíceps", bodyPart: "", targetMuscle: "biceps" },
  { id: "triceps", label: "Tríceps", bodyPart: "", targetMuscle: "triceps" },
  { id: "antebracos", label: "Antebraços", bodyPart: "lower arms", targetMuscle: "" },
  { id: "abdomen", label: "Abdômen", bodyPart: "waist", targetMuscle: "" },
  { id: "obliquos", label: "Oblíquos", bodyPart: "", targetMuscle: "abs" },
  { id: "pernas", label: "Pernas", bodyPart: "upper legs", targetMuscle: "" },
  { id: "quadriceps", label: "Quadríceps", bodyPart: "", targetMuscle: "quadriceps" },
  { id: "posterior", label: "Posteriores", bodyPart: "", targetMuscle: "hamstrings" },
  { id: "gluteos", label: "Glúteos", bodyPart: "", targetMuscle: "glutes" },
  { id: "abdutores", label: "Abdutores", bodyPart: "", targetMuscle: "abductors" },
  { id: "adutores", label: "Adutores", bodyPart: "", targetMuscle: "adductors" },
  { id: "panturrilha", label: "Panturrilhas", bodyPart: "", targetMuscle: "calves" }
];

const ALIASES = {
  chest: "peito",
  peitoral: "peito",
  pectorals: "peito",
  back: "costas",
  costas: "costas",
  dorsal: "costas",
  lats: "costas",
  lombar: "costas",
  "lower back": "costas",
  shoulders: "ombros",
  ombro: "ombros",
  delts: "ombros",
  deltoides: "ombros",
  deltoide: "ombros",
  "deltoide anterior": "ombros",
  "deltóide": "ombros",
  "deltóide anterior": "ombros",
  "deltoide posterior": "ombros",
  "deltóide posterior": "ombros",
  "rear delts": "ombros",
  trapezio: "trapezio",
  "trapézio": "trapezio",
  traps: "trapezio",
  "upper arms": "biceps",
  "lower arms": "antebracos",
  waist: "abdomen",
  "upper legs": "quadriceps",
  "lower legs": "panturrilha",
  posteriores: "posterior",
  panturrilhas: "panturrilha",
  bracos: "biceps",
  pernas: "pernas",
  legs: "pernas",
  glutes: "gluteos",
  "glúteos": "gluteos",
  "gluteus maximus": "gluteos",
  tricep: "triceps",
  "tríceps": "triceps",
  bicep: "biceps",
  "bíceps": "biceps"
};

export function muscleArt(id) {
  const key = ALIASES[String(id || "").toLowerCase()] || String(id || "").toLowerCase();
  const item = MUSCLE_ART.find((m) => m.id === key);
  if (!item) return null;
  return { ...item };
}

export function resolveMuscleArt(name) {
  const raw = String(name || "").trim();
  const art = muscleArt(raw) || muscleArt(raw.toLowerCase());
  if (art) return art;
  const folded = raw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const byLabel = MUSCLE_ART.find((item) => {
    const label = item.label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return label === folded || folded.indexOf(label) >= 0 || label.indexOf(folded) >= 0;
  });
  return byLabel ? muscleArt(byLabel.id) : muscleArt("peito");
}

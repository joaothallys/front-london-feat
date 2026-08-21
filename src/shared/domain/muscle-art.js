export const MUSCLE_ART = [
  { id: "peito", file: "peito.svg", label: "Peito", bodyPart: "chest", targetMuscle: "" },
  { id: "costas", file: "costas.svg", label: "Costas", bodyPart: "back", targetMuscle: "" },
  { id: "ombros", file: "ombros.svg", label: "Ombros", bodyPart: "shoulders", targetMuscle: "" },
  { id: "trapezio", file: "trapezio.svg", label: "Trapézio", bodyPart: "", targetMuscle: "traps" },
  { id: "biceps", file: "biceps.svg", label: "Bíceps", bodyPart: "", targetMuscle: "biceps" },
  { id: "triceps", file: "triceps.svg", label: "Tríceps", bodyPart: "", targetMuscle: "triceps" },
  { id: "antebracos", file: "antebracos.svg", label: "Antebraços", bodyPart: "lower arms", targetMuscle: "" },
  { id: "abdomen", file: "abdomen.svg", label: "Abdômen", bodyPart: "waist", targetMuscle: "" },
  { id: "obliquos", file: "obliquos.svg", label: "Oblíquos", bodyPart: "", targetMuscle: "abs" },
  { id: "pernas", file: "pernas.png", label: "Pernas", bodyPart: "upper legs", targetMuscle: "" },
  { id: "quadriceps", file: "quadriceps.svg", label: "Quadríceps", bodyPart: "", targetMuscle: "quadriceps" },
  { id: "posterior", file: "posterior.svg", label: "Posteriores", bodyPart: "", targetMuscle: "hamstrings" },
  { id: "gluteos", file: "gluteos.svg", label: "Glúteos", bodyPart: "", targetMuscle: "glutes" },
  { id: "abdutores", file: "abdutores.svg", label: "Abdutores", bodyPart: "", targetMuscle: "abductors" },
  { id: "adutores", file: "adutores.svg", label: "Adutores", bodyPart: "", targetMuscle: "adductors" },
  { id: "panturrilha", file: "panturrilha.svg", label: "Panturrilhas", bodyPart: "", targetMuscle: "calves" }
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
  return {
    ...item,
    url: "/assets/muscles/homem/" + item.file
  };
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

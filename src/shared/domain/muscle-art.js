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
  { id: "quadriceps", file: "quadriceps.svg", label: "Quadríceps", bodyPart: "", targetMuscle: "quadriceps" },
  { id: "posterior", file: "posteriores.svg", label: "Posteriores", bodyPart: "", targetMuscle: "hamstrings" },
  { id: "gluteos", file: "gluteos.svg", label: "Glúteos", bodyPart: "", targetMuscle: "glutes" },
  { id: "abdutores", file: "abdutores.svg", label: "Abdutores", bodyPart: "", targetMuscle: "abductors" },
  { id: "adutores", file: "adutores.svg", label: "Adutores", bodyPart: "", targetMuscle: "adductors" },
  { id: "panturrilha", file: "panturrilhas.svg", label: "Panturrilhas", bodyPart: "", targetMuscle: "calves" }
];

const ALIASES = {
  chest: "peito",
  back: "costas",
  shoulders: "ombros",
  "upper arms": "biceps",
  "lower arms": "antebracos",
  waist: "abdomen",
  "upper legs": "quadriceps",
  "lower legs": "panturrilha",
  posteriores: "posterior",
  panturrilhas: "panturrilha",
  bracos: "biceps",
  pernas: "quadriceps",
};

export function muscleArt(id) {
  const key = ALIASES[String(id || "").toLowerCase()] || String(id || "").toLowerCase();
  const item = MUSCLE_ART.find((m) => m.id === key);
  if (!item) return null;
  return {
    ...item,
    url: "/assets/muscles/" + item.file
  };
}

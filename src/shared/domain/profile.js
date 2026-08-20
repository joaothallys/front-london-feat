export const GOALS = [
  { id: "hipertrofia", label: "Ganhar massa muscular" },
  { id: "forca", label: "Ganhar força" },
  { id: "emagrecimento", label: "Perder peso" },
  { id: "definicao", label: "Definição" },
  { id: "condicionamento", label: "Condicionamento" },
  { id: "manutencao", label: "Manutenção" }
];

export const LEVELS = [
  { id: "iniciante", label: "Iniciante" },
  { id: "intermediario", label: "Intermediário" },
  { id: "avancado", label: "Avançado" }
];

export const ENVIRONMENTS = [
  { id: "academia", label: "Academia" },
  { id: "casa", label: "Casa" },
  { id: "peso-corporal", label: "Peso corporal" }
];

export const SESSION_DURATIONS = [15, 20, 30, 45, 60, 90];

export const EQUIPMENT_OPTIONS = [
  { id: "halteres", label: "Halteres", raw: "dumbbell" },
  { id: "barra", label: "Barra", raw: "barbell" },
  { id: "banco", label: "Banco", raw: "bench" },
  { id: "cabo", label: "Cabo", raw: "cable" },
  { id: "maquina", label: "Máquina", raw: "leverage machine" },
  { id: "elastico", label: "Elástico", raw: "band" },
  { id: "kettlebell", label: "Kettlebell", raw: "kettlebell" },
  { id: "nenhum", label: "Nenhum", raw: "body weight" }
];

export const FOCUS_MUSCLES = [
  { id: "peito", label: "Peito", body: "chest" },
  { id: "costas", label: "Costas", body: "back" },
  { id: "ombros", label: "Ombros", body: "shoulders" },
  { id: "bracos", label: "Braços", body: "upper arms" },
  { id: "pernas", label: "Pernas", body: "upper legs" },
  { id: "gluteos", label: "Glúteos", body: "upper legs" },
  { id: "abdomen", label: "Abdômen", body: "waist" },
  { id: "corpo-inteiro", label: "Corpo inteiro", body: "" }
];

export function blankProfile() {
  return {
    name: "",
    gender: null,
    goal: "hipertrofia",
    level: "intermediario",
    environment: "academia",
    days: 4,
    sessionDuration: 60,
    equipment: ["halteres", "barra", "cabo", "maquina"],
    focusMuscles: ["corpo-inteiro"],
    height: null,
    weight: null,
    weightGoal: null,
    restDefault: 90,
    sound: true,
    unitKg: true
  };
}

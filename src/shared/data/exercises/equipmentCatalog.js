export const equipmentCatalog = [
  {
    id: "peck-deck",
    displayName: "Peck Deck (Voador)",
    equipmentId: "maquina",
    aliases: ["pec deck", "peck deck", "chest fly machine", "machine fly", "lever seated fly", "voador", "crucifixo máquina"]
  },
  {
    id: "chest-press-machine",
    displayName: "Supino Máquina",
    equipmentId: "maquina",
    aliases: ["lever chest press", "chest press", "machine press"]
  },
  {
    id: "smith",
    displayName: "Smith",
    equipmentId: "smith",
    aliases: ["smith machine", "smith"]
  },
  {
    id: "cable",
    displayName: "Polia",
    equipmentId: "polia",
    aliases: ["cable", "polia", "crossover"]
  },
  {
    id: "dumbbell",
    displayName: "Halteres",
    equipmentId: "halteres",
    aliases: ["dumbbell", "halteres", "halter"]
  },
  {
    id: "barbell",
    displayName: "Barra",
    equipmentId: "barra",
    aliases: ["barbell", "barra"]
  },
  {
    id: "kettlebell",
    displayName: "Kettlebell",
    equipmentId: "kettlebell",
    aliases: ["kettlebell"]
  },
  {
    id: "band",
    displayName: "Elástico",
    equipmentId: "elastico",
    aliases: ["band", "resistance band", "elástico", "elastico"]
  },
  {
    id: "bodyweight",
    displayName: "Peso corporal",
    equipmentId: "peso-corporal",
    aliases: ["body weight", "peso corporal"]
  },
  {
    id: "bosu",
    displayName: "Bosu",
    equipmentId: "bosu",
    aliases: ["bosu", "bosu ball"]
  }
];

function fold(text) {
  return String(text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function resolveEquipment(exercise) {
  const hay = fold([
    exercise && exercise.displayName,
    exercise && exercise.sourceName,
    exercise && exercise.equipment,
    exercise && exercise.equipmentId
  ].join(" "));
  const pec = equipmentCatalog.find((item) => item.id === "peck-deck");
  if (pec && (hay.indexOf("crucifixo") >= 0 || hay.indexOf("voador") >= 0 || hay.indexOf("fly") >= 0 || hay.indexOf("pec deck") >= 0) && (hay.indexOf("maquina") >= 0 || hay.indexOf("machine") >= 0 || hay.indexOf("lever") >= 0)) {
    return pec;
  }
  const byId = equipmentCatalog.find((item) => item.equipmentId === (exercise && exercise.equipmentId));
  if (byId) return byId;
  const byAlias = equipmentCatalog.find((item) => item.aliases.some((alias) => hay.indexOf(fold(alias)) >= 0));
  return byAlias || {
    id: "generic",
    displayName: (exercise && exercise.equipment) || "Academia",
    equipmentId: (exercise && exercise.equipmentId) || ""
  };
}

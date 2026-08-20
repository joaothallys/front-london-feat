import { chestExerciseIds } from "./chestExercises.js";
import { exerciseAliases } from "./exerciseAliases.js";

function gif(id) {
  return id ? { type: "gif", source: "exercisedb", url: "https://static.exercisedb.dev/media/" + id + ".gif" } : null;
}

function row(spec) {
  const popularity = chestExerciseIds.length - chestExerciseIds.indexOf(spec.id);
  return {
    id: spec.id,
    displayName: spec.displayName,
    sourceName: spec.sourceName || "",
    sourceId: spec.sourceId || "",
    source: "exercisedb",
    category: "peito",
    primaryMuscle: "Peito",
    secondaryMuscles: spec.secondaryMuscles || [],
    equipment: spec.equipment,
    equipmentId: spec.equipmentId,
    level: spec.level,
    description: spec.description || "",
    instructions: spec.instructions || [],
    importantTips: spec.importantTips || [],
    aliases: exerciseAliases[spec.id] || [],
    popularity: popularity > 0 ? popularity : 0,
    media: spec.media || gif(spec.sourceId),
    isActive: true,
    createdAt: 0,
    updatedAt: 0
  };
}

/**
 * Catálogo oficial da categoria Peito.
 * displayName é o nome da interface; sourceName/sourceId são a identidade na ExerciseDB.
 * O 47º (crossover-na-polia) foi validado na API (bodyPart=chest), não no trecho cortado do vídeo.
 */
export const chestCatalog = [
  row({
    id: "crucifixo-peitoral-maquina",
    displayName: "Crucifixo Peitoral Máquina",
    sourceName: "lever seated fly",
    sourceId: "v3xmPAR",
    equipment: "Máquina",
    equipmentId: "maquina",
    level: "iniciante",
    secondaryMuscles: ["Ombros"],
    instructions: [
      { step: 1, text: "Sente-se no banco com os pés no chão." },
      { step: 2, text: "Segure os apoios e posicione seus braços." },
      { step: 3, text: "Inicie com os cotovelos posicionados." },
      { step: 4, text: "Realize o movimento de aproximação." },
      { step: 5, text: "Retorne lentamente à posição inicial." }
    ],
    importantTips: [
      "Evite projetar seus ombros excessivamente para frente.",
      "Mantenha seu abdômen contraído e seu tronco estabilizado.",
      "Evite impulsos e movimentos bruscos."
    ]
  }),
  row({ id: "supino-inclinado-halteres", displayName: "Supino Inclinado com Halteres", sourceName: "dumbbell incline bench press", sourceId: "ns0SIbU", equipment: "Halteres", equipmentId: "halteres", level: "intermediario" }),
  row({ id: "supino-reto-maquina", displayName: "Supino Reto Máquina", sourceName: "lever chest press", sourceId: "DOoWcnA", equipment: "Máquina", equipmentId: "maquina", level: "iniciante" }),
  row({ id: "crucifixo-polia-alta", displayName: "Crucifixo na Polia Alta", sourceName: "cable upper chest crossovers", sourceId: "j7XMAyn", equipment: "Polia", equipmentId: "polia", level: "intermediario" }),
  row({ id: "supino-inclinado-maquina", displayName: "Supino Inclinado Máquina", sourceName: "lever incline chest press", sourceId: "jHAnWmT", equipment: "Máquina", equipmentId: "maquina", level: "iniciante" }),
  row({ id: "supino-reto-barra", displayName: "Supino Reto com Barra", sourceName: "barbell bench press", sourceId: "EIeI8Vf", equipment: "Barra", equipmentId: "barra", level: "intermediario" }),
  row({ id: "crucifixo-peitoral-halteres", displayName: "Crucifixo Peitoral com Halteres", sourceName: "dumbbell fly", sourceId: "yz9nUhF", equipment: "Halteres", equipmentId: "halteres", level: "intermediario" }),
  row({ id: "crucifixo-polia-baixa", displayName: "Crucifixo Polia Baixa", sourceName: "cable low fly", sourceId: "FVmZVhk", equipment: "Polia", equipmentId: "polia", level: "intermediario" }),
  row({ id: "crucifixo-supino-declinado-polia-media", displayName: "Crucifixo Supino Declinado Polia Média", sourceName: "cable decline fly", sourceId: "7saC5zz", equipment: "Polia", equipmentId: "polia", level: "intermediario" }),
  row({ id: "supino-declinado-maquina", displayName: "Supino Declinado Máquina", sourceName: "lever decline chest press", sourceId: "vsVoPHt", equipment: "Máquina", equipmentId: "maquina", level: "iniciante" }),
  row({ id: "supino-declinado-barra", displayName: "Supino Declinado com Barra", sourceName: "barbell decline bench press", sourceId: "GrO65fd", equipment: "Barra", equipmentId: "barra", level: "intermediario" }),
  row({ id: "supino-declinado-halteres", displayName: "Supino Declinado com Halteres", sourceName: "dumbbell decline bench press", sourceId: "DwhEmmE", equipment: "Halteres", equipmentId: "halteres", level: "intermediario" }),
  row({ id: "supino-inclinado-barra", displayName: "Supino Inclinado com Barra", sourceName: "barbell incline bench press", sourceId: "3TZduzM", equipment: "Barra", equipmentId: "barra", level: "intermediario" }),
  row({ id: "supino-reto-halteres-banco", displayName: "Supino Reto com Halteres no Banco", sourceName: "dumbbell bench press", sourceId: "SpYC0Kp", equipment: "Halteres", equipmentId: "halteres", level: "intermediario" }),
  row({ id: "pullover-halteres", displayName: "Pullover com Halteres", sourceName: "dumbbell pullover", sourceId: "9XjtHvS", equipment: "Halteres", equipmentId: "halteres", level: "intermediario" }),
  row({ id: "flexao-braco", displayName: "Flexão de Braço", sourceName: "push-up", sourceId: "I4hDWkc", equipment: "Peso corporal", equipmentId: "peso-corporal", level: "iniciante" }),
  row({ id: "supino-fechado-halteres", displayName: "Supino Fechado com Halteres", sourceName: "dumbbell lying hammer press", sourceId: "7gdLIXa", equipment: "Halteres", equipmentId: "halteres", level: "intermediario" }),
  row({ id: "supino-reto-deitado-maquina", displayName: "Supino Reto Deitado na Máquina", sourceName: "machine inner chest press", sourceId: "wDN97Ca", equipment: "Máquina", equipmentId: "maquina", level: "iniciante" }),
  row({ id: "supino-reto-pausa-barra", displayName: "Supino Reto com Pausa na Barra", sourceName: "", sourceId: "", equipment: "Barra", equipmentId: "barra", level: "avancado", media: null }),
  row({ id: "paralelas", displayName: "Paralelas", sourceName: "chest dip", sourceId: "9WTm7dq", equipment: "Peso corporal", equipmentId: "peso-corporal", level: "avancado" }),
  row({ id: "supino-inclinado-smith", displayName: "Supino Inclinado Smith", sourceName: "smith incline bench press", sourceId: "5v7KYld", equipment: "Máquina", equipmentId: "smith", level: "intermediario" }),
  row({ id: "supino-reto-halteres-pegada-neutra", displayName: "Supino Reto com Halteres (Pegada Neutra)", sourceName: "dumbbell lying hammer press", sourceId: "7gdLIXa", equipment: "Halteres", equipmentId: "halteres", level: "intermediario" }),
  row({ id: "crucifixo-peitoral-inclinado-halteres", displayName: "Crucifixo Peitoral Inclinado com Halteres", sourceName: "dumbbell incline fly", sourceId: "ESOd5Pl", equipment: "Halteres", equipmentId: "halteres", level: "intermediario" }),
  row({ id: "flexao-braco-declinada", displayName: "Flexão de Braço Declinada", sourceName: "decline push-up", sourceId: "i5cEhka", equipment: "Peso corporal", equipmentId: "peso-corporal", level: "intermediario" }),
  row({ id: "flexao-braco-fechada", displayName: "Flexão de Braço Fechada", sourceName: "", sourceId: "", equipment: "Peso corporal", equipmentId: "peso-corporal", level: "intermediario", media: null }),
  row({ id: "flexao-braco-inclinada-caixa", displayName: "Flexão de Braço Inclinada na Caixa", sourceName: "incline push-up (on box)", sourceId: "F7vjXqT", equipment: "Peso corporal", equipmentId: "peso-corporal", level: "iniciante" }),
  row({ id: "flexao-ombro-bosu", displayName: "Flexão de Ombro no Bosu", sourceName: "push up on bosu ball", sourceId: "wVompEp", equipment: "Bosu", equipmentId: "bosu", level: "intermediario" }),
  row({ id: "flexao-braco-ajoelhado", displayName: "Flexão de Braço Ajoelhado", sourceName: "kneeling push-up (male)", sourceId: "ZOuKWir", equipment: "Peso corporal", equipmentId: "peso-corporal", level: "iniciante" }),
  row({ id: "supino-alternado-chao-kettlebell", displayName: "Supino Alternado no Chão com Kettlebell", sourceName: "kettlebell alternating press on floor", sourceId: "7w6i0vE", equipment: "Kettlebell", equipmentId: "kettlebell", level: "intermediario" }),
  row({ id: "supino-reto-halteres-solo", displayName: "Supino Reto com Halteres no Solo", sourceName: "", sourceId: "", equipment: "Halteres", equipmentId: "halteres", level: "intermediario", media: null }),
  row({ id: "voador-inclinado-maquina", displayName: "Voador Inclinado na Máquina", sourceName: "", sourceId: "", equipment: "Máquina", equipmentId: "maquina", level: "intermediario", media: null }),
  row({
    id: "voador-em-pe",
    displayName: "Voador em Pé",
    sourceName: "lever standing chest press",
    sourceId: "WbNq5Xu",
    equipment: "Máquina",
    equipmentId: "maquina",
    level: "intermediario",
    description: "Como você gostaria que recomendássemos esse exercício?",
    importantTips: [
      "Evite retirar seu quadril do apoio do banco e deslocar seus ombros para frente.",
      "Mantenha seu abdômen contraído.",
      "Evite impulsos e movimentos bruscos."
    ]
  }),
  row({ id: "crucifixo-deitado-polia", displayName: "Crucifixo Deitado na Polia", sourceName: "cable lying fly", sourceId: "lJJ7Yq8", equipment: "Polia", equipmentId: "polia", level: "intermediario" }),
  row({ id: "flexao-braco-elastico", displayName: "Flexão de Braço com Elástico", sourceName: "", sourceId: "", equipment: "Elástico", equipmentId: "elastico", level: "iniciante", media: null }),
  row({ id: "flexao-braco-palmas", displayName: "Flexão de Braço com Palmas", sourceName: "clap push up", sourceId: "wigSg76", equipment: "Peso corporal", equipmentId: "peso-corporal", level: "avancado" }),
  row({ id: "flexao-braco-rotacao-tronco", displayName: "Flexão de Braço com Rotação de Tronco", sourceName: "", sourceId: "", equipment: "Peso corporal", equipmentId: "peso-corporal", level: "avancado", media: null }),
  row({ id: "supino-declinado-smith", displayName: "Supino Declinado Smith", sourceName: "smith decline bench press", sourceId: "ETZfAbZ", equipment: "Máquina", equipmentId: "smith", level: "intermediario" }),
  row({ id: "supino-reto-polia", displayName: "Supino Reto na Polia", sourceName: "cable bench press", sourceId: "7xI5MXA", equipment: "Polia", equipmentId: "polia", level: "intermediario" }),
  row({ id: "flexao-braco-unilateral", displayName: "Flexão de Braço Unilateral", sourceName: "single arm push-up", sourceId: "MUic5zN", equipment: "Peso corporal", equipmentId: "peso-corporal", level: "avancado" }),
  row({ id: "supino-reto-unilateral-halteres", displayName: "Supino Reto Unilateral com Halteres", sourceName: "dumbbell lying one arm press", sourceId: "zGSIWQi", equipment: "Halteres", equipmentId: "halteres", level: "avancado" }),
  row({ id: "supino-reto-smith", displayName: "Supino Reto Smith", sourceName: "smith bench press", sourceId: "trqKQv2", equipment: "Máquina", equipmentId: "smith", level: "intermediario" }),
  row({ id: "supino-em-pe-elastico", displayName: "Supino em Pé com Elástico", sourceName: "band one arm twisting chest press", sourceId: "c16nYGA", equipment: "Elástico", equipmentId: "elastico", level: "iniciante" }),
  row({ id: "voador-inclinado-polia", displayName: "Voador Inclinado na Polia", sourceName: "cable incline fly", sourceId: "tBWXbIT", equipment: "Polia", equipmentId: "polia", level: "intermediario" }),
  row({ id: "burpee-com-salto", displayName: "Burpee com Salto", sourceName: "burpee", sourceId: "dK9394r", equipment: "Peso corporal", equipmentId: "peso-corporal", level: "avancado" }),
  row({ id: "alongamento-horizontal-flexao-sentado-inclinando", displayName: "Alongamento Horizontal e Flexão Sentado Inclinando", sourceName: "assisted seated pectoralis major stretch with stability ball", sourceId: "RoV1Rfa", equipment: "Peso corporal", equipmentId: "peso-corporal", level: "iniciante" }),
  row({ id: "alongamento-peitoral-acima-cabeca", displayName: "Alongamento de Peitoral Acima da Cabeça", sourceName: "behind head chest stretch", sourceId: "QoHIhPl", equipment: "Peso corporal", equipmentId: "peso-corporal", level: "iniciante" }),
  row({ id: "crossover-na-polia", displayName: "Crossover na Polia", sourceName: "cable cross-over variation", sourceId: "0CXGHya", equipment: "Polia", equipmentId: "polia", level: "intermediario" })
];

const byId = {};
chestCatalog.forEach((ex) => { byId[ex.id] = ex; });

export function getChestCatalog() {
  return chestCatalog.slice();
}

export function getCatalogExercise(id) {
  if (byId[id]) return byId[id];
  const key = String(id || "").toLowerCase();
  return chestCatalog.find((ex) => {
    if (ex.sourceId === id) return true;
    return (ex.aliases || []).some((alias) => String(alias).toLowerCase() === key);
  }) || null;
}

export function catalogToAppView(ex) {
  if (!ex) return null;
  return {
    id: ex.id,
    externalId: ex.sourceId || ex.id,
    name: ex.displayName,
    originalName: ex.sourceName,
    localizedName: ex.displayName,
    muscle: "peito",
    secondary: ex.secondaryMuscles || [],
    eq: ex.equipmentId,
    equipment: ex.equipment,
    bodyPart: "Peito",
    bodyPartRaw: "chest",
    target: ex.primaryMuscle,
    targetRaw: "pectorals",
    gifUrl: ex.media && ex.media.url,
    gif: ex.media && ex.media.url,
    videoUrl: ex.media && ex.media.type === "video" ? ex.media.url : null,
    steps: (ex.instructions || []).map((step) => step.text),
    source: ex.source,
    level: ex.level,
    description: ex.description,
    importantTips: ex.importantTips || [],
    aliases: ex.aliases || [],
    popularity: ex.popularity,
    sets: 3,
    reps: 12,
    kg: 12,
    rest: 60
  };
}

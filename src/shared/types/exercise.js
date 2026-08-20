/** @typedef {"exercisedb" | "manual" | "tenor" | "placeholder"} MediaSource */
/** @typedef {"gif" | "image" | "video"} MediaType */
/** @typedef {"iniciante" | "intermediario" | "avancado"} ExerciseLevel */
/** @typedef {"maquina" | "halteres" | "barra" | "polia" | "kettlebell" | "elastico" | "peso-corporal" | "bosu" | "smith"} EquipmentId */

/**
 * @typedef {Object} ExerciseMedia
 * @property {MediaType} type
 * @property {MediaSource} source
 * @property {string} url
 * @property {string} [thumbnailUrl]
 * @property {string} [tenorId]
 * @property {string} [searchTerm]
 */

/**
 * @typedef {Object} ExerciseInstruction
 * @property {number} step
 * @property {string} text
 */

/**
 * @typedef {Object} CatalogExercise
 * @property {string} id
 * @property {string} displayName
 * @property {string} sourceName
 * @property {string} sourceId
 * @property {string} source
 * @property {string} category
 * @property {string} primaryMuscle
 * @property {string[]} secondaryMuscles
 * @property {string} equipment
 * @property {EquipmentId} equipmentId
 * @property {ExerciseLevel} level
 * @property {string} description
 * @property {ExerciseInstruction[]} instructions
 * @property {string[]} importantTips
 * @property {string[]} aliases
 * @property {number} popularity
 * @property {ExerciseMedia|null} media
 * @property {boolean} isActive
 * @property {number} [createdAt]
 * @property {number} [updatedAt]
 */

/**
 * @typedef {Object} AnalyticsEvent
 * @property {string} event
 * @property {string} exerciseId
 * @property {string} [userId]
 * @property {string} timestamp
 */

export const MEDIA_SOURCES = ["exercisedb", "manual", "tenor", "placeholder"];
export const LEVELS = [
  { id: "todos", label: "Todos os níveis" },
  { id: "iniciante", label: "Iniciante" },
  { id: "intermediario", label: "Intermediário" },
  { id: "avancado", label: "Avançado" }
];

export const EQUIPMENT_FILTERS = [
  { id: "todos", label: "Todos" },
  { id: "academia", label: "Academia" },
  { id: "halteres", label: "Halteres" },
  { id: "barra", label: "Barra" },
  { id: "maquina", label: "Máquina" },
  { id: "polia", label: "Polia" },
  { id: "kettlebell", label: "Kettlebell" },
  { id: "elastico", label: "Elástico" },
  { id: "peso-corporal", label: "Peso corporal" },
  { id: "bosu", label: "Bosu" }
];

export const ACADEMIA_EQUIPMENT = ["maquina", "halteres", "barra", "polia", "smith"];

export const SORT_OPTIONS = [
  { id: "popularidade", label: "Popularidade" },
  { id: "az", label: "Nome A-Z" },
  { id: "za", label: "Nome Z-A" },
  { id: "recentes", label: "Mais recentes" }
];

export const ANALYTICS_EVENTS = [
  "exercise_view",
  "exercise_favorite",
  "exercise_completed",
  "exercise_added_to_workout",
  "exercise_media_play"
];

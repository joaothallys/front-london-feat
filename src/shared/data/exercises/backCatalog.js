import { backExerciseIds } from "./backExercises.js";
import { buildRow } from "./catalogBuilder.js";

function row(spec) {
  return buildRow(backExerciseIds, Object.assign({ category: "costas" }, spec));
}

export const backCatalog = [
  row({ id: "puxador-por-tras", displayName: "Puxador por Trás", sourceName: "cable wide grip rear pulldown behind neck", sourceId: "CmEr4pM", equipment: "Polia", equipmentId: "polia", level: "intermediario" }),
  row({ id: "remada-curvada-smith", displayName: "Remada Curvada no Smith", sourceName: "smith bent over row", sourceId: "ZX9UZmj", equipment: "Máquina", equipmentId: "smith", level: "intermediario" }),
  row({ id: "barra-fixa-graviton", displayName: "Barra Fixa no Graviton", sourceName: "lever assisted chin-up", sourceId: "MaMuGH6", equipment: "Máquina", equipmentId: "maquina", level: "iniciante" }),
  row({ id: "muscle-up", displayName: "Muscle-up", sourceName: "muscle up", sourceId: "yJUHKTn", equipment: "Peso corporal", equipmentId: "peso-corporal", level: "avancado" }),
  row({ id: "remada-unilateral-sentado-cabo", displayName: "Remada Unilateral Sentado no Cabo", sourceName: "cable seated one arm alternate row", sourceId: "vpp9Ku2", equipment: "Polia", equipmentId: "polia", level: "intermediario" }),
  row({ id: "pullover-maquina-apoio", displayName: "Pullover na Máquina com Apoio", sourceName: "lever pullover", sourceId: "4U7iLb5", equipment: "Máquina", equipmentId: "maquina", level: "intermediario" }),
  row({ id: "remada-deitada", displayName: "Remada Deitada", sourceName: "cambered bar lying row", sourceId: "R5swFnc", equipment: "Barra", equipmentId: "barra", level: "intermediario" }),
  row({ id: "remada-invertida", displayName: "Remada Invertida", sourceName: "inverted row", sourceId: "bZGHsAZ", equipment: "Peso corporal", equipmentId: "peso-corporal", level: "intermediario" }),
  row({ id: "puxada-alta-polia", displayName: "Puxada Alta na Polia", sourceName: "cable lat pulldown full range of motion", sourceId: "LEprlgG", equipment: "Polia", equipmentId: "polia", level: "iniciante" }),
  row({ id: "puxada-frontal-barra", displayName: "Puxada Frontal com Barra", sourceName: "cable bar lateral pulldown", sourceId: "eYnzaCm", equipment: "Polia", equipmentId: "polia", level: "iniciante" }),
  row({ id: "remada-baixa-cabo", displayName: "Remada Baixa no Cabo", sourceName: "cable low seated row", sourceId: "hvV79Si", equipment: "Polia", equipmentId: "polia", level: "iniciante" }),
  row({ id: "remada-curvada-barra", displayName: "Remada Curvada com Barra", sourceName: "barbell bent over row", sourceId: "eZyBC3j", equipment: "Barra", equipmentId: "barra", level: "intermediario" }),
  row({ id: "remada-unilateral-halteres", displayName: "Remada Unilateral com Halteres", sourceName: "dumbbell one arm bent-over row", sourceId: "C0MA9bC", equipment: "Halteres", equipmentId: "halteres", level: "intermediario" }),
  row({ id: "pullover-halteres-costas", displayName: "Pullover com Halteres", sourceName: "dumbbell pullover", sourceId: "9XjtHvS", equipment: "Halteres", equipmentId: "halteres", level: "intermediario" }),
  row({ id: "barra-fixa", displayName: "Barra Fixa", sourceName: "wide grip pull-up", sourceId: "Qqi7bko", equipment: "Peso corporal", equipmentId: "peso-corporal", level: "intermediario" }),
  row({ id: "barra-fixa-pegada-neutra", displayName: "Barra Fixa Pegada Neutra", sourceName: "pull up (neutral grip)", sourceId: "0V2YQjW", equipment: "Peso corporal", equipmentId: "peso-corporal", level: "intermediario" }),
  row({ id: "puxada-neutra-maquina", displayName: "Puxada Neutra na Máquina", sourceName: "cable lateral pulldown with v-bar", sourceId: "4c9BhzB", equipment: "Polia", equipmentId: "polia", level: "iniciante" }),
  row({ id: "remada-maquina", displayName: "Remada Máquina", sourceName: "lever high row", sourceId: "nZZZy9m", equipment: "Máquina", equipmentId: "maquina", level: "iniciante" }),
  row({ id: "remada-cavalinho", displayName: "Remada Cavalinho", sourceName: "lever t bar row", sourceId: "aaXr7ld", equipment: "Máquina", equipmentId: "maquina", level: "intermediario" }),
  row({ id: "remada-t-bar", displayName: "Remada T-Bar", sourceName: "lever reverse t-bar row", sourceId: "BgljGjd", equipment: "Máquina", equipmentId: "maquina", level: "intermediario" }),
  row({ id: "remada-serrote", displayName: "Remada Serrote", sourceName: "dumbbell bent over row", sourceId: "BJ0Hz5L", equipment: "Halteres", equipmentId: "halteres", level: "intermediario" }),
  row({ id: "remada-alta", displayName: "Remada Alta", sourceName: "cable upper row", sourceId: "PQStVXH", equipment: "Polia", equipmentId: "polia", level: "intermediario" }),
  row({ id: "puxada-corda", displayName: "Puxada com Corda", sourceName: "cable lateral pulldown (with rope attachment)", sourceId: "CuaWCmC", equipment: "Polia", equipmentId: "polia", level: "intermediario" }),
  row({ id: "puxada-unilateral-polia", displayName: "Puxada Unilateral na Polia", sourceName: "cable one arm pulldown", sourceId: "U5INZY6", equipment: "Polia", equipmentId: "polia", level: "intermediario" }),
  row({ id: "pulldown-polia", displayName: "Pulldown na Polia", sourceName: "cable pulldown", sourceId: "RVwzP10", equipment: "Polia", equipmentId: "polia", level: "iniciante" }),
  row({ id: "puxada-pegada-aberta", displayName: "Puxada com Pegada Aberta", sourceName: "cable rear pulldown", sourceId: "SpsOSXk", equipment: "Polia", equipmentId: "polia", level: "intermediario" }),
  row({ id: "puxada-pegada-fechada", displayName: "Puxada com Pegada Fechada", sourceName: "cable underhand pulldown", sourceId: "xBYcQHj", equipment: "Polia", equipmentId: "polia", level: "iniciante" }),
  row({ id: "remada-maquina-pegada-neutra", displayName: "Remada Máquina Pegada Neutra", sourceName: "lever alternating narrow grip seated row", sourceId: "w2oRpuH", equipment: "Máquina", equipmentId: "maquina", level: "iniciante" }),
  row({ id: "remada-sentada-maquina", displayName: "Remada Sentada Máquina", sourceName: "cable seated row", sourceId: "fUBheHs", equipment: "Polia", equipmentId: "polia", level: "iniciante" }),
  row({ id: "remada-inclinada", displayName: "Remada Inclinada", sourceName: "dumbbell incline row", sourceId: "7vG5o25", equipment: "Halteres", equipmentId: "halteres", level: "intermediario" }),
  row({ id: "encolhimento-trapezio", displayName: "Encolhimento para Trapézio", sourceName: "barbell shrug", sourceId: "dG7tG5y", equipment: "Barra", equipmentId: "barra", level: "iniciante" }),
  row({ id: "remada-alta-halteres", displayName: "Remada Alta com Halteres", sourceName: "dumbbell upright row", sourceId: "ainizkb", equipment: "Halteres", equipmentId: "halteres", level: "intermediario" }),
  row({ id: "puxada-assistida", displayName: "Puxada Assistida", sourceName: "assisted pull-up", sourceId: "kiJ4Z2K", equipment: "Máquina", equipmentId: "maquina", level: "iniciante" }),
  row({ id: "remada-livre", displayName: "Remada Livre", sourceName: "bodyweight standing row", sourceId: "wd4ds3s", equipment: "Peso corporal", equipmentId: "peso-corporal", level: "iniciante" }),
  row({ id: "remada-pendlay", displayName: "Remada Pendlay", sourceName: "barbell pendlay row", sourceId: "r0z6xzQ", equipment: "Barra", equipmentId: "barra", level: "avancado" })
];

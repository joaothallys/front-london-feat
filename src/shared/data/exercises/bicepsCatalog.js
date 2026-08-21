import { bicepsExerciseIds } from "./bicepsExercises.js";
import { buildRow } from "./catalogBuilder.js";

function row(spec) {
  return buildRow(bicepsExerciseIds, Object.assign({ category: "biceps" }, spec));
}

export const bicepsCatalog = [
  row({ id: "rosca-direta-barra-reta", displayName: "Rosca Direta com Barra Reta", sourceName: "barbell curl", sourceId: "25GPyDY", equipment: "Barra", equipmentId: "barra", level: "iniciante" }),
  row({ id: "rosca-biceps-halteres-alternada", displayName: "Rosca Bíceps com Halteres (Alternada)", sourceName: "dumbbell alternate biceps curl", sourceId: "BU15nH4", equipment: "Halteres", equipmentId: "halteres", level: "iniciante" }),
  row({ id: "rosca-direta-barra-w", displayName: "Rosca Direta com Barra W", sourceName: "ez barbell curl", sourceId: "6TG6x2w", equipment: "Barra", equipmentId: "barra", level: "iniciante" }),
  row({ id: "rosca-scott-barra-w", displayName: "Rosca Scott com Barra W", sourceName: "ez barbell close grip preacher curl", sourceId: "hacCyUv", equipment: "Barra", equipmentId: "barra", level: "intermediario" }),
  row({ id: "rosca-unilateral-biceps-polia", displayName: "Rosca Unilateral de Bíceps na Polia", sourceName: "cable one arm curl", sourceId: "YTur5nR", equipment: "Polia", equipmentId: "polia", level: "iniciante" }),
  row({ id: "rosca-biceps-alongada-unilateral-polia", displayName: "Rosca Bíceps Alongada Unilateral na Polia", sourceName: "cable one arm preacher curl", sourceId: "eHBlPsa", equipment: "Polia", equipmentId: "polia", level: "intermediario" }),
  row({ id: "rosca-biceps-halteres", displayName: "Rosca Bíceps com Halteres", sourceName: "dumbbell biceps curl", sourceId: "NbVPDMW", equipment: "Halteres", equipmentId: "halteres", level: "iniciante" }),
  row({ id: "rosca-martelo-cruzada-halteres", displayName: "Rosca Martelo Cruzada com Halteres", sourceName: "dumbbell cross body hammer curl", sourceId: "Qyk5J3p", equipment: "Halteres", equipmentId: "halteres", level: "intermediario" }),
  row({ id: "rosca-martelo-halteres", displayName: "Rosca Martelo com Halteres", sourceName: "dumbbell hammer curl", sourceId: "slDvUAU", equipment: "Halteres", equipmentId: "halteres", level: "iniciante" }),
  row({ id: "rosca-martelo-polia-corda", displayName: "Rosca Martelo na Polia com Corda", sourceName: "cable hammer curl (with rope)", sourceId: "HPlPoQA", equipment: "Polia", equipmentId: "polia", level: "iniciante" }),
  row({ id: "rosca-scott-maquina", displayName: "Rosca Scott na Máquina", sourceName: "lever preacher curl", sourceId: "b6hQYMb", equipment: "Máquina", equipmentId: "maquina", level: "iniciante" }),
  row({ id: "rosca-biceps-polia-baixa-barra-reta", displayName: "Rosca bíceps na Polia Baixa (Barra Reta)", sourceName: "cable curl", sourceId: "G08RZcQ", equipment: "Polia", equipmentId: "polia", level: "iniciante" }),
  row({ id: "rosca-biceps-sentado-halteres", displayName: "Rosca Bíceps Sentado com Halteres", sourceName: "dumbbell seated bicep curl", sourceId: "xiA6lRr", equipment: "Halteres", equipmentId: "halteres", level: "iniciante" }),
  row({ id: "rosca-biceps-sobre-cabeca-polia", displayName: "Rosca Bíceps Sobre a Cabeça na Polia", sourceName: "cable overhead curl", sourceId: "wDUqY2u", equipment: "Polia", equipmentId: "polia", level: "intermediario" }),
  row({ id: "rosca-concentrada", displayName: "Rosca Concentrada", sourceName: "dumbbell concentration curl", sourceId: "gvsWLQw", equipment: "Halteres", equipmentId: "halteres", level: "iniciante" }),
  row({ id: "rosca-biceps-banco-inclinado", displayName: "Rosca bíceps no Banco Inclinado", sourceName: "dumbbell incline biceps curl", sourceId: "F3xgbjF", equipment: "Halteres", equipmentId: "halteres", level: "intermediario" }),
  row({ id: "rosca-biceps-inversa-polia-baixa", displayName: "Rosca bíceps inversa na Polia Baixa", sourceName: "cable reverse curl", sourceId: "eOG0r6v", equipment: "Polia", equipmentId: "polia", level: "intermediario" }),
  row({ id: "rosca-direta-um-braco-polia", displayName: "Rosca Direta com Um Braço na Polia", sourceName: "cable seated one arm concentration curl", sourceId: "rZ80Gbp", equipment: "Polia", equipmentId: "polia", level: "intermediario" }),
  row({ id: "rosca-martelo-cruzada-polia", displayName: "Rosca Martelo Cruzada na Polia", sourceName: "cable rope one arm hammer preacher curl", sourceId: "4hATdoB", equipment: "Polia", equipmentId: "polia", level: "intermediario" }),
  row({ id: "rosca-biceps-spider-halteres", displayName: "Rosca bíceps Spider com Halteres", sourceName: "dumbbell prone incline curl", sourceId: "mwpPcr1", equipment: "Halteres", equipmentId: "halteres", level: "avancado" }),
  row({ id: "rosca-biceps-barra-reta-invertida", displayName: "Rosca bíceps com Barra Reta", sourceName: "inverted row", sourceId: "bZGHsAZ", equipment: "Peso corporal", equipmentId: "peso-corporal", level: "intermediario" }),
  row({ id: "rosca-biceps-polia-baixa-barra-w", displayName: "Rosca bíceps na Polia Baixa (Barra W)", sourceName: "cable close grip curl", sourceId: "BCGQ6J5", equipment: "Polia", equipmentId: "polia", level: "iniciante" }),
  row({ id: "rosca-martelo-sentado-halteres", displayName: "Rosca martelo sentado com Halteres", sourceName: "dumbbell seated hammer curl", sourceId: "IGtBdNT", equipment: "Halteres", equipmentId: "halteres", level: "iniciante" }),
  row({ id: "rosca-scott-barra-reta", displayName: "Rosca Scott com Barra Reta", sourceName: "barbell preacher curl", sourceId: "qOgPVf6", equipment: "Barra", equipmentId: "barra", level: "intermediario" }),
  row({ id: "rosca-scott-halteres", displayName: "Rosca Scott com Halteres", sourceName: "dumbbell preacher curl", sourceId: "jivWf8n", equipment: "Halteres", equipmentId: "halteres", level: "intermediario" }),
  row({ id: "rosca-biceps-sentado-alternado-halteres", displayName: "Rosca bíceps sentado alternado com Halteres", sourceName: "dumbbell alternating seated bicep curl on exercise ball", sourceId: "J74XlNf", equipment: "Halteres", equipmentId: "halteres", level: "iniciante" }),
  row({ id: "biceps-unilateral-polia-alta", displayName: "Bíceps unilateral na Polia Alta", sourceName: "cable pulldown bicep curl", sourceId: "QTXKWPh", equipment: "Polia", equipmentId: "polia", level: "intermediario" }),
  row({ id: "rosca-biceps-drag-barra", displayName: "Rosca Bíceps Drag com Barra", sourceName: "barbell drag curl", sourceId: "IENzBdA", equipment: "Barra", equipmentId: "barra", level: "intermediario" }),
  row({ id: "rosca-biceps-alternada-elastico", displayName: "Rosca Bíceps alternada com Elástico", sourceName: "band alternating biceps curl", sourceId: "3omWx6P", equipment: "Elástico", equipmentId: "elastico", level: "iniciante" }),
  row({ id: "rosca-inclinada-polia", displayName: "Rosca Inclinada na Polia", sourceName: "cable two arm curl on incline bench", sourceId: "H9y3Dkr", equipment: "Polia", equipmentId: "polia", level: "intermediario" }),
  row({ id: "rosca-biceps-inversa-barra-reta", displayName: "Rosca bíceps inversa com Barra Reta", sourceName: "barbell reverse curl", sourceId: "xNrS20v", equipment: "Barra", equipmentId: "barra", level: "intermediario" })
];

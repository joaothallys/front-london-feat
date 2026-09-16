import { lombarExerciseIds } from "./lombarExercises.js";
import { buildRow } from "./catalogBuilder.js";

function row(spec) {
  return buildRow(lombarExerciseIds, Object.assign({ category: "lombar" }, spec));
}

export const lombarCatalog = [
  row({ id: "extensao-lombar", displayName: "Extensão Lombar", sourceName: "hyperextension", sourceId: "zhMwOwE", equipment: "Peso corporal", equipmentId: "peso-corporal", level: "iniciante" }),
  row({ id: "superman", displayName: "Superman", sourceName: "", sourceId: "", equipment: "Peso corporal", equipmentId: "peso-corporal", level: "iniciante", media: null }),
  row({ id: "bom-dia-barra", displayName: "Bom Dia com Barra", sourceName: "barbell good morning", sourceId: "XlZ4lAC", equipment: "Barra", equipmentId: "barra", level: "intermediario" })
];

import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPlanDays, dayChipLabel, normalizeWeekdays } from "../src/shared/domain/weekdays.js";

test("normaliza dias da semana e ignora valor inválido", () => {
  assert.deepEqual(normalizeWeekdays([5, 1, 1, 9, "3"]), [1, 3, 5]);
  assert.deepEqual(normalizeWeekdays("{0,6}"), [6, 0]);
  assert.deepEqual(normalizeWeekdays(null), []);
});

test("o chip mostra o dia da semana quando ele foi marcado", () => {
  assert.equal(dayChipLabel({ weekdays: [] }, 0), "DIA 1");
  assert.equal(dayChipLabel({ weekdays: [1, 4] }, 2), "SEG · QUI");
  assert.equal(dayChipLabel({ weekdays: [1, 2, 3, 5] }, 0), "SEG · TER +2");
});

test("montar os dias limita a sete, guarda o nome e os exercícios", () => {
  const days = buildPlanDays([
    { id: "a", name: "  Peito  ", weekdays: [1], items: [{ id: "supino" }], focus: ["peito"] },
    { name: "   ", weekdays: [8] }
  ].concat(Array.from({ length: 8 }, () => ({ name: "Extra" }))));
  assert.equal(days.length, 7);
  assert.equal(days[0].name, "Peito");
  assert.deepEqual(days[0].weekdays, [1]);
  assert.deepEqual(days[0].items, [{ id: "supino" }]);
  assert.equal(days[1].name, "Dia 2");
  assert.deepEqual(days[1].weekdays, []);
});

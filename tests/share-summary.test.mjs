import { test } from "node:test";
import assert from "node:assert/strict";
import { summaryFromWorkout } from "../src/session/shareSummary.js";

test("reabre o card com a foto e os exercícios já salvos no aparelho", () => {
  const summary = summaryFromWorkout({
    id: "local-1",
    name: "A · Peito",
    date: "2026-11-01T12:00:00.000Z",
    duration: 42,
    volume: 3200,
    photo: "file://foto.jpg",
    shareId: "abc",
    lines: [{ id: "supino", name: "Supino", sets: 3, reps: 24, kg: 40, typicalReps: 8 }],
    shareItems: [{ id: "supino", name: "Supino", sets: [{ type: "N", kg: 40, reps: 8 }] }],
    muscles: ["Peito"]
  }, {
    exercises: [{ exerciseId: "outro", sets: [{ type: "N", kg: 10, reps: 10, done: true }] }]
  });
  assert.equal(summary.name, "Peito");
  assert.equal(summary.photo, "file://foto.jpg");
  assert.equal(summary.shareId, "abc");
  assert.equal(summary.lines[0].name, "Supino");
  assert.equal(summary.shareItems[0].id, "supino");
});

test("monta séries e volume a partir do treino concluído no servidor", () => {
  const summary = summaryFromWorkout({ id: "s1", exercises: 0, sets: 0 }, {
    id: "s1",
    name: "Costas",
    finishedAt: "2026-11-02T15:00:00.000Z",
    durationMin: 50,
    exercises: [
      {
        exerciseId: "puxada",
        name: "Puxada",
        restSec: 90,
        sets: [
          { type: "W", kg: 20, reps: 12, done: false },
          { type: "N", kg: 40, reps: 10, done: true },
          { type: "N", kg: 40, reps: 8, done: false }
        ]
      }
    ]
  });
  assert.equal(summary.duration, 50);
  assert.equal(summary.volume, 400);
  assert.equal(summary.lines.length, 1);
  assert.equal(summary.lines[0].name, "Puxada");
  assert.equal(summary.lines[0].sets, 1);
  assert.deepEqual(summary.shareItems[0].sets, [{ type: "N", kg: 40, reps: 10 }]);
});

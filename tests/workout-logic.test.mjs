import { test } from "node:test";
import assert from "node:assert/strict";
import { anySetDone, countedSets, finishBody, finishExercises } from "../src/session/finishPayload.js";
import { mergeHistory, replaceHistoryRow } from "../src/shared/domain/history.js";
import { beginRest, formatRest, restLeft, restStillRunning } from "../src/session/restClock.js";

function live(items, extra) {
  return Object.assign({ name: "Treino A", startedAt: Date.parse("2026-10-29T10:00:00Z"), meta: { sourceType: "plan_day", sourceId: null }, items }, extra);
}

const W = (done) => ({ type: "W", kg: 20, reps: 12, done: !!done });
const N = (done, kg = 40, reps = 10) => ({ type: "N", kg, reps, done: !!done });

test("envia a marcação de série feita para o servidor", () => {
  const ex = finishExercises(live([{ id: "supino", rest: 90, sets: [W(), N(true), N(false)] }]));
  assert.deepEqual(ex[0].sets.map((s) => s.done), [false, true, false]);
});

test("sem nenhuma série marcada, conta as séries de trabalho e ignora o aquecimento", () => {
  const ex = finishExercises(live([{ id: "supino", rest: 90, sets: [W(), N(), N()] }]));
  assert.deepEqual(ex[0].sets.map((s) => s.done), [false, true, true]);
});

test("countedSets segue a mesma regra do envio", () => {
  const item = { sets: [W(), N(true), N(false)] };
  assert.equal(countedSets(item, true).length, 1);
  assert.equal(countedSets({ sets: [W(), N(), N()] }, false).length, 2);
  assert.equal(anySetDone(live([item])), true);
  assert.equal(anySetDone(live([{ sets: [N()] }])), false);
});

test("finishBody inclui sessionId só quando existe e normaliza números", () => {
  const base = live([{ id: "x", rest: "60", sets: [{ type: "N", kg: "12.5", reps: "8", done: true }] }]);
  const body = finishBody(base, { durationMin: 45, muscles: ["peito"], resolveId: (id) => "lf-" + id });
  assert.equal(body.sessionId, undefined);
  assert.equal(body.exercises[0].exerciseId, "lf-x");
  assert.equal(body.exercises[0].restSec, 60);
  assert.deepEqual(body.exercises[0].sets[0], { type: "N", kg: 12.5, reps: 8, done: true });
  assert.equal(body.startedAt, "2026-10-29T10:00:00.000Z");
  assert.equal(finishBody(Object.assign({}, base, { apiId: "abc" })).sessionId, "abc");
});

test("mergeHistory mantém foto e linhas locais e não perde treino pendente", () => {
  const local = [
    { id: "s1", date: "2026-10-20T10:00:00Z", photo: "file://a.jpg", lines: [{ name: "Supino" }] },
    { id: "local-9", date: "2026-10-28T10:00:00Z", pendingSync: true, name: "Offline" },
    { id: "local-old", date: "2026-10-01T10:00:00Z", name: "Já sincronizado" }
  ];
  const remote = [{ id: "s1", date: "2026-10-20T10:00:00Z", volume: 3000 }];
  const merged = mergeHistory(remote, local);
  assert.deepEqual(merged.map((r) => r.id), ["local-9", "s1"]);
  assert.equal(merged[1].photo, "file://a.jpg");
  assert.equal(merged[1].volume, 3000);
});

test("replaceHistoryRow troca o id local pelo do servidor sem duplicar", () => {
  const list = [{ id: "local-1", date: "2026-10-28T10:00:00Z" }, { id: "s0", date: "2026-10-27T10:00:00Z" }];
  const next = replaceHistoryRow(list, "local-1", { id: "s9", date: "2026-10-28T10:00:00Z" });
  assert.deepEqual(next.map((r) => r.id), ["s9", "s0"]);
});

test("cronômetro de descanso conta pelo relógio", () => {
  const rest = beginRest(90);
  assert.equal(restStillRunning(rest), true);
  assert.ok(restLeft(rest) <= 90 && restLeft(rest) >= 89);
  assert.equal(restStillRunning({ endsAt: Date.now() - 1 }), false);
  assert.equal(formatRest(125), "2:05");
  assert.equal(beginRest(0).total, 60);
});

test("treino esquecido aberto por dias não vira 17 mil minutos", async () => {
  const { autoDuration, MAX_AUTO_MIN } = await import("../src/workout/duration.js");
  const now = Date.now();
  assert.equal(autoDuration({ startedAt: now - 52 * 60000, items: [] }, 10), 52);
  const old = { startedAt: now - 12 * 24 * 3600000, items: [{ rest: 90 }, { rest: 60 }] };
  const est = autoDuration(old, 12);
  assert.equal(est, Math.round((12 * (45 + 75)) / 60));
  assert.ok(autoDuration(old, 500) <= MAX_AUTO_MIN);
  assert.equal(autoDuration(old, 0), 1);
});

test("calorias e duração formatadas como no backend", async () => {
  const { estimateCalories, fmtDuration } = await import("../src/workout/duration.js");
  assert.equal(estimateCalories(60, 4000), Math.round(60 * 5.5 + 4000 * 0.035));
  assert.equal(fmtDuration(52), "52 min");
  assert.equal(fmtDuration(75), "1h 15");
  assert.equal(fmtDuration(120), "2h");
});

test("nome do treino no histórico sem a letra do plano", async () => {
  const { workoutName, mergeHistory } = await import("../src/shared/domain/history.js");
  assert.equal(workoutName("A · Peito e Bíceps"), "Peito e Bíceps");
  assert.equal(workoutName("b.bíceps"), "bíceps");
  assert.equal(workoutName("Treino C - Pernas"), "Pernas");
  assert.equal(workoutName("Abdômen"), "Abdômen");
  assert.equal(workoutName("Full body"), "Full body");
  assert.equal(workoutName(""), "Treino");
  assert.equal(mergeHistory([{ id: "1", name: "D · Costas", date: "2026-10-01" }], [])[0].name, "Costas");
});

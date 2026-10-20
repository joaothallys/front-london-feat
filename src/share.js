import { muscleArt } from "@shared/domain/muscle-art.js";
import { dayMuscles } from "./plan.js";

const GROUPS = {
  push: ["peito", "ombros", "triceps"],
  pull: ["costas", "biceps", "trapezio", "antebracos"],
  legs: ["quadriceps", "posterior", "gluteos", "panturrilha", "adutores", "abdutores"],
  core: ["abdomen", "obliquos", "lombar"]
};

const TITLES = {
  push: ["Força de Empurrar", "Pump Garantido", "Modo Fera", "Empurra que Cresce"],
  pull: ["Dia de Puxar", "Puxada Brutal", "Força de Tração", "Pegada de Ferro"],
  legs: ["Dia de Perna", "Base Inabalável", "Ninguém Pula Perna", "Pernas de Aço"],
  core: ["Core Blindado", "Centro de Força", "Abdômen Trincado"],
  mixed: ["Treino Completo", "Corpo Inteiro em Ação", "Missão Total", "Sem Desculpas"]
};

function isAutoName(name) {
  const s = String(name || "").trim();
  return !s || /^[A-Z]\s*·/.test(s) || /^(meu plano|treino|dia \d+)$/i.test(s);
}

function groupOf(muscles) {
  const hits = Object.keys(GROUPS).filter((g) => muscles.some((m) => GROUPS[g].includes(m)));
  return hits.length === 1 ? hits[0] : "mixed";
}

function pick(list, seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return list[h % list.length];
}

function joinLabels(muscles) {
  const labels = muscles.map((m) => (muscleArt(m) || {}).label).filter(Boolean).slice(0, 3);
  if (labels.length <= 1) return labels[0] || "";
  return labels.slice(0, -1).join(", ") + " e " + labels[labels.length - 1];
}

export function shareTitle(day) {
  const name = day && day.name;
  if (!isAutoName(name)) return String(name).trim();
  const muscles = dayMuscles(day);
  const title = pick(TITLES[groupOf(muscles)], (day && (day.id || day.name)) || muscles.join(","));
  const labels = joinLabels(muscles);
  return labels ? `${title}: ${labels}` : title;
}

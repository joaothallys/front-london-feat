import { ChestLibraryService } from "@shared/services/exercises/ChestLibraryService.js";
import { FavoriteService } from "@shared/services/favorites/FavoriteService.js";
import { FeedbackService } from "@shared/services/feedback/FeedbackService.js";
import { ExerciseAnalytics } from "@shared/services/analytics/ExerciseAnalytics.js";
import { findSimilarExercises } from "@shared/services/exercises/SimilarExercises.js";
import { resolveEquipment } from "@shared/data/exercises/equipmentCatalog.js";
import { resolveMuscleArt } from "@shared/domain/muscle-art.js";
import { ExerciseMedia, observeExerciseMedia } from "../../components/exercises/ExerciseMedia.js";
import { FavoriteButton, syncFavoriteButton } from "../../components/exercises/FavoriteButton.js";

const ICONS = {
  up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v10H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h2z"/><path d="M7 10l4.3-7.2A1.8 1.8 0 0 1 13.1 2h.2A2.7 2.7 0 0 1 16 5.4L15.2 9H19a2 2 0 0 1 2 2.3l-1 7.2A2 2 0 0 1 18 20H7"/></svg>',
  down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 14V4h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2z"/><path d="M17 14l-4.3 7.2A1.8 1.8 0 0 1 10.9 22h-.2A2.7 2.7 0 0 1 8 18.6L8.8 15H5a2 2 0 0 1-2-2.3l1-7.2A2 2 0 0 1 6 4h11"/></svg>',
  machine: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="10" y="8" width="28" height="32" rx="4"/><path d="M16 18h16M16 24h16M16 30h10"/></svg>'
};

const TABS = [
  ["muscle", "Músculo"],
  ["instructions", "Instruções"],
  ["equipment", "Equipamento"],
  ["analytics", "Analytics"]
];

const state = {
  tab: "muscle",
  tipsOpen: false,
  model: null
};

function popularityLabel(score) {
  if (Number(score) >= 40) return "Muito popular";
  return "Popular";
}

function buildModel(id, ctx) {
  const catalog = ChestLibraryService.get(id);
  const view = ctx.resolveView ? ctx.resolveView(id) : null;
  if (!catalog && !view) return null;
  const displayName = catalog ? catalog.displayName : (view.name || "");
  const secondary = catalog
    ? (catalog.secondaryMuscles || [])
    : (view.secondary || []);
  const steps = catalog && catalog.instructions && catalog.instructions.length
    ? catalog.instructions.map((step) => step.text)
    : (view && view.steps) || [];
  const tips = (catalog && catalog.importantTips) || [];
  const similar = catalog
    ? ChestLibraryService.similar(catalog.id, 3)
    : findSimilarExercises({
      id: view.id,
      primaryMuscle: view.bodyPart || view.target,
      secondaryMuscles: view.secondary || [],
      equipmentId: view.eq,
      category: view.muscle,
      level: "",
      displayName: view.name,
      popularity: 0
    }, (ctx.similar || []).map((item) => ({
      id: item.id,
      displayName: item.displayName || item.name,
      primaryMuscle: item.primaryMuscle || item.bodyPart,
      secondaryMuscles: item.secondary || [],
      equipmentId: item.equipmentId || item.eq,
      category: item.category || item.muscle,
      level: item.level || "",
      popularity: item.popularity || 0,
      media: item.media || { type: "gif", source: "exercisedb", url: item.gifUrl || item.gif || "" }
    })), 3);
  return {
    id: catalog ? catalog.id : view.id,
    displayName,
    category: catalog ? "Peito" : (view.bodyPart || "Peito"),
    popularity: popularityLabel(catalog ? catalog.popularity : 0),
    primaryMuscle: catalog ? catalog.primaryMuscle : (view.target || view.bodyPart || "Peito"),
    secondaryMuscles: secondary,
    equipment: resolveEquipment(catalog || { equipment: view.equipment, equipmentId: view.eq, displayName, sourceName: view.originalName }),
    mediaExercise: catalog || { displayName, media: { type: view.videoUrl ? "video" : "gif", source: "exercisedb", url: view.videoUrl || view.gifUrl || view.gif || "" } },
    description: "Como você gostaria que recomendássemos este exercício?",
    instructions: steps,
    importantTips: tips,
    similarExercises: similar,
    back: catalog ? "#/library/peito" : "#/library"
  };
}

function muscleRow(name) {
  const art = resolveMuscleArt(name);
  return `<div class="xd-muscle">
    <img src="${art ? art.url : "/assets/muscles/peito.svg"}" alt="${name}">
    <span>${name}</span>
  </div>`;
}

function similarRow(item) {
  return `<a class="xd-similar" href="#/exercicios/${item.id}">
    ${ExerciseMedia(item, "xd-similar-media")}
    <span>${item.displayName || item.name || ""}</span>
  </a>`;
}

function tabBar(tab) {
  return `<div class="xd-tabs" role="tablist">
    ${TABS.map(([id, label]) => `<button type="button" role="tab" class="${tab === id ? "on" : ""}" data-act="ex-tab" data-v="${id}">${label}</button>`).join("")}
  </div>`;
}

function panelMuscle(model) {
  return `<section class="xd-panel">
    <h3 class="xd-label">Primário</h3>
    ${muscleRow(model.primaryMuscle)}
    <h3 class="xd-label">Secundário</h3>
    ${model.secondaryMuscles.length
      ? model.secondaryMuscles.map(muscleRow).join("")
      : `<p class="xd-empty-inline">Nenhum músculo secundário cadastrado.</p>`}
    <div class="xd-similar-head">
      <h3 class="xd-label">Exercícios similares</h3>
      <span>${model.similarExercises.length} exercício${model.similarExercises.length === 1 ? "" : "s"}</span>
    </div>
    <div class="xd-similar-list">
      ${model.similarExercises.map(similarRow).join("") || `<p class="xd-empty-inline">Sem similares no catálogo.</p>`}
    </div>
  </section>`;
}

function panelInstructions(model) {
  const steps = model.instructions || [];
  return `<section class="xd-panel">
    ${steps.length ? steps.map((text, i) => `<div class="xd-step">
      <b>${String(i + 1).padStart(2, "0")}</b>
      <p>${text}</p>
    </div>`).join("") : `<p class="xd-empty-inline">Sem instruções neste exercício.</p>`}
    ${model.importantTips.length ? `<button type="button" class="xd-tips ${state.tipsOpen ? "open" : ""}" data-act="tips-toggle">
      <span>Dicas importantes</span>
      <i>${state.tipsOpen ? "˄" : "˅"}</i>
    </button>
    <div class="xd-tips-body ${state.tipsOpen ? "open" : ""}">
      <ul>${model.importantTips.map((tip) => `<li>${tip}</li>`).join("")}</ul>
    </div>` : ""}
  </section>`;
}

function panelEquipment(model) {
  const eq = model.equipment;
  return `<section class="xd-panel">
    <h3 class="xd-label">Equipamento</h3>
    <div class="xd-equip">
      <div class="xd-equip-art">${ICONS.machine}</div>
      <strong>${eq.displayName}</strong>
    </div>
  </section>`;
}

function panelAnalytics(model) {
  const events = ExerciseAnalytics.list().filter((item) => item.exerciseId === model.id);
  const views = events.filter((item) => item.event === "exercise_view").length;
  const favs = FavoriteService.has(model.id) ? 1 : 0;
  const hasReal = views > 0 || favs > 0;
  if (!hasReal) {
    return `<section class="xd-panel"><div class="xd-empty">Ainda não há dados</div></section>`;
  }
  return `<section class="xd-panel">
    <div class="xd-stats">
      ${views ? `<div><b>${views}</b><span>Visualizações</span></div>` : ""}
      ${favs ? `<div><b>${favs}</b><span>Favorito</span></div>` : ""}
    </div>
  </section>`;
}

function panelFor(model, tab) {
  if (tab === "instructions") return panelInstructions(model);
  if (tab === "equipment") return panelEquipment(model);
  if (tab === "analytics") return panelAnalytics(model);
  return panelMuscle(model);
}

function feedback(id) {
  const value = FeedbackService.get(id);
  return `<div class="xd-fb">
    <button type="button" class="${value === "positive" ? "on" : ""}" data-act="ex-fb" data-v="positive" aria-label="Recomendar">${ICONS.up}</button>
    <button type="button" class="${value === "negative" ? "on" : ""}" data-act="ex-fb" data-v="negative" aria-label="Não recomendar">${ICONS.down}</button>
  </div>`;
}

export function renderExerciseDetail(ctx, id) {
  const model = buildModel(id, ctx);
  if (!model) return false;
  if (!state.model || state.model.id !== model.id) {
    state.tipsOpen = false;
    state.tab = "muscle";
  }
  state.model = model;

  ExerciseAnalytics.track("exercise_view", model.id);

  ctx.root().innerHTML = `<div class="xd no-nav">
    <div class="xd-hero">
      ${ExerciseMedia(model.mediaExercise, "xd-media", { eager: true })}
      <div class="xd-header">
        <button class="xd-icon" data-go="${model.back}" aria-label="Voltar">${ctx.icons.back}</button>
        ${FavoriteButton(model.id, "xd-fav")}
      </div>
    </div>
    <div class="xd-body">
      <div class="xd-badges">
        <span class="xd-badge">${model.category}</span>
        <span class="xd-badge xd-badge-hot">${model.popularity}</span>
      </div>
      <h1 class="xd-title">${model.displayName}</h1>
      <div class="xd-ask">
        <p>${model.description}</p>
        ${feedback(model.id)}
      </div>
      ${tabBar(state.tab)}
      <div id="xd-panel">${panelFor(model, state.tab)}</div>
    </div>
  </div>`;

  observeExerciseMedia(ctx.root());
  return true;
}

export function handleDetailAction(act, target, ctx) {
  if (!state.model) return false;
  if (act === "ex-tab") {
    state.tab = target.dataset.v;
    if (ctx) ctx.setTab && ctx.setTab(state.tab);
    const bar = ctx.root().querySelector(".xd-tabs");
    const panel = ctx.root().querySelector("#xd-panel");
    if (bar) bar.outerHTML = tabBar(state.tab);
    if (panel) panel.innerHTML = panelFor(state.model, state.tab);
    observeExerciseMedia(ctx.root());
    return true;
  }
  if (act === "tips-toggle") {
    state.tipsOpen = !state.tipsOpen;
    const panel = ctx.root().querySelector("#xd-panel");
    if (panel) panel.innerHTML = panelFor(state.model, "instructions");
    return true;
  }
  if (act === "ex-fb") {
    FeedbackService.set(state.model.id, target.dataset.v);
    const box = ctx.root().querySelector(".xd-ask");
    if (box) {
      const p = box.querySelector("p");
      box.innerHTML = (p ? `<p>${p.textContent}</p>` : "") + feedback(state.model.id);
    }
    return true;
  }
  if (act === "fav-card" || act === "fav-ex") {
    FavoriteService.toggle(target.dataset.id || state.model.id);
    syncFavoriteButton(ctx.root(), state.model.id);
    return true;
  }
  return false;
}

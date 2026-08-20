import { store } from "@shared/store/local-store.js";
import { catalog as D } from "@shared/catalog/index.js";
import { api as LF_API } from "@shared/api/client.js";
import { setVolume } from "@shared/domain/volume.js";
import { calcStreak as streakFromHistory } from "@shared/domain/streak.js";
import { gifBox } from "./ui/media.js";
import { SESSION_DURATIONS } from "@shared/domain/profile.js";
import { EQUIPMENT_CATEGORIES, defaultLocations } from "@shared/domain/locations.js";
import { muscleArt, MUSCLE_ART } from "@shared/domain/muscle-art.js";
import { catalogToAppView } from "@shared/data/exercises/exerciseCatalog.js";
import { ChestLibraryService } from "@shared/services/exercises/ChestLibraryService.js";
import { FavoriteService } from "@shared/services/favorites/FavoriteService.js";
import { bootChestLibrary, handleChestAction } from "./pages/exercises/index.js";
import { renderExerciseDetail, handleDetailAction } from "./pages/exercises/detail.js";

  const S = store.get();
  const root = () => document.getElementById("app");
  let live = null;
  let restTimer = null;
  let draft = null;
  let filters = { muscle: "todos", eq: "todos", q: "", bodyPart: "", equipment: "", targetMuscle: "" };
  let pickerQ = "";
  let pickerList = [];
  let syncUi = { loaded: 0, total: 1500, running: false, page: 0, message: "", lastReport: null, lastSyncAt: null };
  let lib = { page: 1, data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 }, loadedFor: "" };
  let apiFilters = { bodyParts: [], equipments: [], targetMuscles: [] };
  let onboard = { step: 0, name: "Ana Costa", goal: "hipertrofia", level: "intermediario", days: 4 };
  let libTab = "muscle";
  let exTab = "muscle";
  let workoutsTab = "saved";

  const I = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z"/></svg>',
    dumbbell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 8v8M8 9v6M16 9v6M18 8v8M8 12h8M4 10v4M20 10v4"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 5a3 3 0 0 1 3-2h11v16H8a3 3 0 0 0-3 3z"/><path d="M8 3v16"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19h16M7 16V8m5 8V5m5 14v-6"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="3.5"/><path d="M5 19c1.5-3.5 4-5 7-5s5.5 1.5 7 5"/></svg>',
    back: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 5 8 12l7 7"/></svg>',
    bell: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4l2-2z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>',
    play: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
    plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
    check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m5 12 5 5 9-10"/></svg>',
    star: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3 2.7 6.4L21 10l-4.5 4.2L17.6 21 12 17.8 6.4 21l1.1-6.8L3 10l6.3-.6z"/></svg>',
    search: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>'
  };

  function $(sel, el) { return (el || document).querySelector(sel); }
  function go(hash) { location.hash = hash; }
  function route() {
    const h = (location.hash || "#/splash").replace(/^#\/?/, "");
    const [name, a, b] = h.split("/");
    return { name: name || "splash", a, b };
  }
  function fmtDate(iso) {
    const d = new Date(iso.length === 10 ? iso + "T12:00:00" : iso);
    return d.toLocaleDateString("pt-BR");
  }
  function daysLeft(iso) {
    const d = new Date(iso + "T12:00:00");
    return Math.ceil((d - new Date()) / 86400000);
  }
  function muscleLabel(id) {
    return (D.muscles.find((m) => m.id === id) || { label: id }).label;
  }
  function exerciseCard(ex) {
    const e = ex || {};
    return `${gifBox(e, "gif-thumb")}<div><h4>${e.name || ""}</h4><p>${e.bodyPart || ""} · ${e.equipment || ""} · ${e.target || ""}</p></div>`;
  }

  function persist() { store.persist(); }

  function ensureDomain() {
    if (!S.locations || !S.locations.length) S.locations = defaultLocations();
    if (!S.activeLocationId) S.activeLocationId = S.locations[0].id;
    if (!S.favorites) S.favorites = [];
    if (!S.favoriteWorkouts) S.favoriteWorkouts = [];
    if (!S.feedback) S.feedback = {};
    if (!S.analytics) S.analytics = [];
    if (!S.bodyMeasures) S.bodyMeasures = { height: null, weight: null, weightGoal: null };
    if (!S.connectedApps) S.connectedApps = { appleHealth: "disconnected", strava: "disconnected" };
    if (!S.settings) S.settings = { restDefault: 90, sound: true, language: "pt-BR", reminders: false };
    if (S.planDay == null) S.planDay = 0;
    if (!S.profile.sessionDuration) S.profile.sessionDuration = 60;
  }

  function activeLocation() {
    return (S.locations || []).find((l) => l.id === S.activeLocationId) || (S.locations || [])[0];
  }

  function planDays() {
    return (S.plan && S.plan.split) || [];
  }

  function currentPlanDay() {
    const days = planDays();
    if (!days.length) return null;
    const i = Math.max(0, Math.min(S.planDay || 0, days.length - 1));
    return { i, day: days[i] };
  }

  function beep() {
    if (!S.profile.sound) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = 880;
      o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.08, ctx.currentTime);
      o.start(); o.stop(ctx.currentTime + 0.18);
    } catch (e) {}
    if (navigator.vibrate) navigator.vibrate(80);
  }

  function recoveryPct(id) {
    const last = S.recovery[id];
    if (!last) return 100;
    const hours = (Date.now() - last) / 3600000;
    return Math.max(0, Math.min(100, Math.round((hours / 48) * 100)));
  }

  function weekDays() {
    const names = ["D", "S", "T", "Q", "Q", "S", "S"];
    const labels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay());
    const plan = S.plan;
    const map = { 3: [1, 3, 5], 4: [1, 2, 4, 5], 5: [1, 2, 3, 4, 5], 6: [1, 2, 3, 4, 5, 6] };
    const days = (plan && plan.split && plan.split.length) || S.profile.days || 4;
    const slots = map[days] || map[4];
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const slotIdx = slots.indexOf(i);
      const trained = S.history.some((h) => new Date(h.date).toDateString() === d.toDateString());
      return {
        i,
        letter: names[i],
        label: labels[i],
        date: d,
        today: d.toDateString() === today.toDateString(),
        workout: slotIdx >= 0 && plan ? plan.split[slotIdx] : null,
        trained
      };
    });
  }

  function todayWorkout() {
    const w = weekDays().find((d) => d.today);
    return w && w.workout;
  }

  function nav(active) {
    const tabs = [
      ["home", I.home, "Meu Plano"],
      ["workouts", I.dumbbell, "Treinos"],
      ["progress", I.chart, "Progresso"],
      ["library", I.book, "Exercícios"],
      ["profile", I.user, "Perfil"]
    ];
    return `<nav class="tabbar">${tabs.map(([id, ic, l]) =>
      `<button class="tab ${active === id ? "on" : ""}" data-go="#/${id}">${ic}<span>${l}</span></button>`
    ).join("")}</nav>`;
  }

  function top(title, back) {
    return `<div class="topbar">
      ${back ? `<button class="back-btn" data-go="${back}">${I.back}</button>` : ""}
      <h1 class="page-title grow">${title}</h1>
    </div>`;
  }

  function guarded() {
    const r = route();
    const open = ["splash", "login", "onboarding", "ai"];
    if (!S.session && !open.includes(r.name)) { go("#/login"); return true; }
    if (S.session && !S.onboardingDone && !open.includes(r.name)) { go("#/onboarding"); return true; }
    return false;
  }

  function pageCtx() {
    const id = route().a;
    return {
      root,
      nav,
      icons: I,
      exTab,
      history: S.history,
      liked: S.feedback[id],
      similar: ChestLibraryService.all().filter((x) => x.id !== id && x.category === "peito"),
      resolveView(viewId) { return D.byId[viewId]; },
      registerCatalog: registerChestCatalog,
      setTab(tab) { exTab = tab; }
    };
  }

  function registerChestCatalog() {
    ChestLibraryService.all().forEach((ex) => {
      const view = catalogToAppView(ex);
      if (!view) return;
      D.byId[ex.id] = view;
      if (ex.sourceId) D.byId[ex.sourceId] = view;
      if (!D.exercises.some((item) => item.id === view.id)) D.exercises.push(view);
    });
  }

  function render() {
    if (guarded()) return;
    ensureDomain();
    const r = route();
    if (r.name === "library" && r.a === "peito") {
      bootChestLibrary(pageCtx());
      return;
    }
    if (r.name === "exercicios") {
      exercise();
      return;
    }
    const map = {
      splash: splash, login: login, onboarding: onboarding, home: home, plan: home,
      workouts: workouts, library: library, exercise: exercise, progress: progress,
      profile: profile, membership: membership, session: sessionScreen,
      create: createWorkout, program: programScreen, fast: fastScreen,
      recovery: recoveryScreen, history: historyScreen, settings: settingsScreen,
      ai: aiScreen, summary: summaryScreen, sync: syncScreen,
      locations: locationsScreen, equipment: equipmentScreen,
      measures: measuresScreen, apps: appsScreen
    };
    (map[r.name] || home)();
  }

  function splash() {
    root().innerHTML = `<div class="screen full no-nav splash rise">
      <img class="logo" src="assets/logo.png" alt="Academia London Fitness">
      <h1>ACADEMIA<br>LONDON<br><span>FITNESS</span></h1>
      <p>Treino, matrícula e evolução. Feito para a sua academia.</p>
      <button class="btn btn-red btn-block" data-go="#/login">Começar</button>
    </div>`;
  }

  function login() {
    root().innerHTML = `<div class="screen no-nav rise">
      <div class="center mt-16 mb-16">
        <img src="assets/logo.png" alt="" style="width:120px;height:120px;border-radius:50%;margin:0 auto 12px;object-fit:cover">
        <h1 class="page-title">Entrar</h1>
        <p class="muted">Protótipo para homologação com os gestores</p>
      </div>
      <div class="field mb-8"><label>E-mail</label><input id="email" value="aluno@londonfitness.com"></div>
      <div class="field mb-16"><label>Senha</label><input id="pass" type="password" value="123456"></div>
      <button class="btn btn-red btn-block" data-act="login">Entrar como aluno</button>
      <p class="tiny center mt-12">Acesso demo · dados salvos só neste aparelho</p>
    </div>`;
  }

  function onboarding() {
    const steps = [
      { t: "Como podemos te chamar?", body: `<div class="field"><label>Nome</label><input id="on-name" value="${onboard.name}"></div>` },
      { t: "Qual é o seu objetivo?", body: choice("goal", [
        ["hipertrofia", "Hipertrofia", "Ganhar massa muscular"],
        ["forca", "Força", "Levantar mais carga"],
        ["emagrecimento", "Emagrecimento", "Perder gordura com treino"],
        ["definicao", "Definição", "Manter músculo e secar"]
      ]) },
      { t: "Qual é o seu nível?", body: choice("level", [
        ["iniciante", "Iniciante", "Até 6 meses de academia"],
        ["intermediario", "Intermediário", "Já treina com consistência"],
        ["avancado", "Avançado", "Periodização e cargas altas"]
      ]) },
      { t: "Quantos dias por semana?", body: choice("days", [
        [3, "3 dias", "ABC clássico"],
        [4, "4 dias", "Upper / lower ou ABCD"],
        [5, "5 dias", "Mais volume na semana"],
        [6, "6 dias", "Push Pull Legs"]
      ]) }
    ];
    const s = steps[onboard.step];
    root().innerHTML = `<div class="screen no-nav rise">
      <div class="progress-dots">${steps.map((_, i) => `<i class="${i <= onboard.step ? "on" : ""}"></i>`).join("")}</div>
      <p class="kicker">Plano com IA</p>
      <h1 class="page-title mb-16">${s.t}</h1>
      ${s.body}
      <div class="mt-16">
        <button class="btn btn-red btn-block" data-act="on-next">${onboard.step === 3 ? "Gerar meu plano" : "Continuar"}</button>
        ${onboard.step ? `<button class="btn btn-ghost btn-block mt-8" data-act="on-back">Voltar</button>` : ""}
      </div>
    </div>`;
    function choice(key, items) {
      return `<div class="choice-grid">${items.map(([v, t, d]) =>
        `<button class="choice ${String(onboard[key]) === String(v) ? "on" : ""}" data-act="on-pick" data-k="${key}" data-v="${v}"><b>${t}</b><span>${d}</span></button>`
      ).join("")}</div>`;
    }
  }

  function home() {
    const cur = currentPlanDay();
    const days = planDays();
    const loc = activeLocation();
    const items = (cur && cur.day && cur.day.items) || [];
    const muscles = [...new Set((cur && cur.day && cur.day.focus) || [])];
    if (!muscles.length) {
      items.forEach((it) => {
        const e = D.byId[it.id];
        if (e && e.muscle) muscles.push(e.muscle);
      });
    }
    const uniqueMuscles = [...new Set(muscles)].filter((m) => muscleArt(m));
    root().innerHTML = `<div class="screen rise has-cta">
      <div class="topbar">
        <div class="greet"><p>London Fitness</p><h2>Meu Plano</h2></div>
        <button class="icon-btn" data-go="#/ai">${I.star}</button>
      </div>
      ${syncBanner()}
      ${days.length ? `<div class="day-tabs">${days.map((d, i) =>
        `<button class="day-tab ${i === (cur && cur.i) ? "on" : ""}" data-act="plan-day" data-i="${i}">Dia ${i + 1}</button>`
      ).join("")}</div>` : `<p class="muted mb-12">Gere um plano no onboarding ou na IA.</p>`}
      <div class="plan-filters">
        <button class="chip" data-act="cycle-duration">${S.profile.sessionDuration || 60}min ▾</button>
        <button class="chip">${uniqueMuscles.length || 0} músculos ▾</button>
        <button class="chip" data-go="#/locations">${(loc && loc.name) || "Local"}</button>
      </div>
      <p class="section-title">Músculos trabalhados</p>
      <div class="muscle-scroll">
        ${uniqueMuscles.map((m) => {
          const art = muscleArt(m);
          return `<div class="muscle-card"><img src="${art.url}" alt="${art.label}"></div>`;
        }).join("") || `<p class="muted">Sem grupos neste dia.</p>`}
      </div>
      <p class="section-title">${items.length} exercícios</p>
      <div class="list plan-list">${items.map((it) => {
        const e = D.byId[it.id];
        if (!e) return "";
        return `<button class="item" data-go="#/exercise/${e.id}">
          ${gifBox(e, "gif-thumb")}
          <div><h4>${e.name}</h4><p>${it.sets || e.sets} séries · ${it.reps || e.reps} reps · ${it.kg || e.kg} kg</p></div>
          <span class="chev">⋮</span>
        </button>`;
      }).join("") || `<div class="empty">Nenhum exercício neste dia.</div>`}</div>
      ${cur ? `<div class="plan-cta"><button class="btn btn-red btn-block" data-act="start-plan-day">Iniciar treino</button></div>` : `<button class="btn btn-red btn-block" data-go="#/ai">Gerar meu plano</button>`}
    </div>${nav("home")}`;
  }

  function syncBanner() {
    if (syncUi.running) {
      return `<button class="card mb-12 btn-block" data-go="#/sync" style="text-align:left">
        <div class="kicker">ExerciseDB OSS</div>
        <b>Sincronizando...</b>
        <p class="tiny mt-8">${syncUi.message || ("Página " + (syncUi.page || 1))}</p>
        <div class="bar mt-8"><i style="width:${Math.max(4, Math.round((syncUi.loaded / Math.max(syncUi.total, 1)) * 100))}%"></i></div>
      </button>`;
    }
    if (lib.pagination.total || D.exercises.length) return "";
    return `<button class="card mb-12 btn-block" data-go="#/sync" style="text-align:left">
      <div class="kicker">Catálogo vazio</div>
      <b>Sincronize a ExerciseDB</b>
      <p class="tiny mt-8">O app lê o banco local. A API externa só entra no botão de sincronizar.</p>
    </button>`;
  }

  function syncScreen() {
    const report = syncUi.lastReport || {};
    const when = syncUi.lastSyncAt ? new Date(syncUi.lastSyncAt).toLocaleString("pt-BR") : "nunca";
    const pct = Math.max(4, Math.round((syncUi.loaded / Math.max(syncUi.total, 1)) * 100));
    root().innerHTML = `<div class="screen rise">
      ${top("Gerenciamento de exercícios", "#/profile")}
      <p class="muted mb-12">Sincroniza a ExerciseDB OSS V1 para o banco da aplicação. O frontend não chama a API externa.</p>
      <div class="card mb-12">
        <div class="kicker">Última sincronização</div>
        <h3 class="mt-8">${when}</h3>
        <p class="tiny">Exercícios no banco: ${lib.pagination.total || D.exercises.length}</p>
        ${syncUi.running ? `<p class="tiny mt-8">${syncUi.message || "Sincronizando..."}</p><div class="bar mt-8"><i style="width:${pct}%"></i></div>` : ""}
      </div>
      <div class="card mb-12">
        <div class="pay-row"><span>Encontrados</span><b>${report.totalFetched || 0}</b></div>
        <div class="pay-row"><span>Criados</span><b>${report.created || 0}</b></div>
        <div class="pay-row"><span>Atualizados</span><b>${report.updated || 0}</b></div>
        <div class="pay-row"><span>Erros</span><b>${report.failed || 0}</b></div>
      </div>
      ${report.error || syncUi.message && !syncUi.running && report.success === false ? `<p class="tiny danger mb-12">${report.error || syncUi.message}</p>` : ""}
      <button class="btn btn-red btn-block" data-act="sync-now" ${syncUi.running ? "disabled" : ""}>Sincronizar ExerciseDB</button>
      <p class="tiny center mt-12">Fonte: ExerciseDB / AscendAPI · GIF 180p · videoUrl reservado para MP4 próprio</p>
    </div>${nav("profile")}`;
  }

  function workouts() {
    const saved = S.custom || [];
    const programs = D.programs || [];
    root().innerHTML = `<div class="screen rise">
      ${top("Treinos")}
      <div class="lib-tabs">
        <button class="${workoutsTab === "saved" ? "on" : ""}" data-act="wtab" data-v="saved">Treinos (${saved.length})</button>
        <button class="${workoutsTab === "plans" ? "on" : ""}" data-act="wtab" data-v="plans">Planos (${S.plan ? 1 : 0})</button>
        <button class="${workoutsTab === "programs" ? "on" : ""}" data-act="wtab" data-v="programs">Programas</button>
        <button class="${workoutsTab === "fast" ? "on" : ""}" data-go="#/fast">Rápidos</button>
      </div>
      ${workoutsTab === "saved" ? `
        <button class="btn btn-ghost btn-block mb-12" data-go="#/create">${I.plus} Criar treino</button>
        ${saved.length ? saved.map((c) => `<div class="item mb-8">
          ${gifBox(D.byId[c.items[0] && c.items[0].id], "gif-thumb")}
          <div><h4>${c.name}</h4><p>${c.items.length} exercícios</p></div>
          <button class="chip" data-act="add-saved-plan" data-id="${c.id}">Adicionar</button>
        </div>`).join("") : `<div class="empty">Nenhum treino salvo ainda.</div>`}
      ` : ""}
      ${workoutsTab === "plans" ? `
        ${S.plan ? S.plan.split.map((d, i) => `<button class="item mb-8" data-act="start-split" data-i="${i}">
          ${gifBox(D.byId[d.items[0] && d.items[0].id], "gif-thumb")}
          <div><h4>${d.name}</h4><p>${d.items.length} exercícios</p></div>
          <span class="chev">›</span>
        </button>`).join("") : `<div class="empty">Nenhum plano ainda.</div>`}
      ` : ""}
      ${workoutsTab === "programs" ? programs.map((p) => `<button class="program-card mb-8" data-go="#/program/${p.id}">
        <span class="badge">${p.level || "programa"}</span>
        <h3 class="mt-8">${p.name}</h3>
        <p class="muted">${p.blurb}</p>
        <p class="tiny mt-8">${p.days} dias · ${p.split && p.split[0] ? p.split[0].name : ""}</p>
      </button>`).join("") : ""}
    </div>${nav("workouts")}`;
  }

  function library() {
    const key = [libTab, filters.q, filters.bodyPart, filters.equipment, filters.targetMuscle, lib.page].join("|");
    if (libTab === "favorites") {
      lib.data = (S.favorites || []).map((id) => D.byId[id]).filter(Boolean);
      lib.pagination = { page: 1, limit: 20, total: lib.data.length, totalPages: 1 };
      lib.loadedFor = key;
    } else if (libTab === "ranking" || filters.bodyPart || filters.equipment || filters.targetMuscle || filters.q) {
      if (lib.loadedFor !== key) loadLibrary(key);
    }
    const list = libTab === "favorites"
      ? (S.favorites || []).map((id) => D.byId[id]).filter(Boolean)
      : lib.data;
    const pg = lib.pagination;
    root().innerHTML = `<div class="screen rise">
      ${top("Exercícios")}
      ${syncBanner()}
      <div class="search mb-12"><span>⌕</span><input id="q" placeholder="Buscar exercício" value="${filters.q}"></div>
      <div class="lib-tabs">
        <button class="${libTab === "muscle" ? "on" : ""}" data-act="lib-tab" data-v="muscle">Por músculo</button>
        <button class="${libTab === "equipment" ? "on" : ""}" data-act="lib-tab" data-v="equipment">Equipamentos</button>
        <button class="${libTab === "ranking" ? "on" : ""}" data-act="lib-tab" data-v="ranking">Ranking</button>
        <button class="${libTab === "favorites" ? "on" : ""}" data-act="lib-tab" data-v="favorites">Favoritos</button>
      </div>
      ${libTab === "muscle" && !filters.bodyPart && !filters.targetMuscle && !filters.q ? `
        <div class="muscle-grid">${MUSCLE_ART.map((m) =>
          `<button type="button" class="muscle-card" data-act="f-muscle-art" data-v="${m.id}">
            <img src="/assets/muscles/${m.file}" alt="${m.label}">
          </button>`
        ).join("")}</div>
      ` : ""}
      ${libTab === "equipment" && !filters.equipment && !filters.q ? `
        <div class="list">${(apiFilters.equipments.length ? apiFilters.equipments : []).map((m) =>
          `<button class="item" data-act="f-equip" data-v="${m}">
            <div><h4>${D.eqLabel(m)}</h4><p>Filtrar equipamento</p></div><span class="chev">›</span>
          </button>`
        ).join("") || `<div class="empty">Sincronize o catálogo para ver equipamentos.</div>`}</div>
      ` : ""}
      ${(libTab === "ranking" || libTab === "favorites" || filters.bodyPart || filters.equipment || filters.targetMuscle || filters.q) ? `
        ${(filters.bodyPart || filters.equipment || filters.targetMuscle) ? `<button class="chip mb-12" data-act="lib-clear">Limpar filtro</button>` : ""}
        <p class="tiny mb-8">${libTab === "favorites" ? (list.length ? list.length + " favoritos" : "Ainda não há favoritos") : (pg.total + " exercícios")}</p>
        <div class="list">${list.map((raw) => {
          const view = D.byId[raw.externalId || raw.id] || raw;
          return `<button class="item" data-go="#/exercise/${view.externalId || view.id}">
            ${exerciseCard(view)}<span class="chev">›</span>
          </button>`;
        }).join("") || `<div class="empty">${libTab === "favorites" ? "Exercícios para salvar com a estrela." : "Carregando..."}</div>`}</div>
        ${libTab !== "favorites" && pg.page < pg.totalPages ? `<button class="btn btn-ghost btn-block mt-12" data-act="lib-more">Carregar mais</button>` : ""}
      ` : ""}
    </div>${nav("library")}`;
    const input = $("#q");
    if (input) input.addEventListener("input", (ev) => {
      filters.q = ev.target.value;
      lib.page = 1;
      clearTimeout(library.t);
      library.t = setTimeout(() => { lib.loadedFor = ""; library(); }, 350);
    });
  }

  async function loadLibrary(key) {
    lib.loadedFor = key;
    try {
      const res = await LF_API.list({
        page: lib.page,
        limit: 20,
        search: filters.q,
        bodyPart: filters.bodyPart,
        equipment: filters.equipment,
        targetMuscle: filters.targetMuscle
      });
      if (lib.loadedFor !== key) return;
      D.mergeCatalog(res.data);
      lib.data = lib.page === 1 ? res.data : lib.data.concat(res.data);
      lib.pagination = res.pagination;
      if (route().name === "library") library();
    } catch (err) {
      if (lib.loadedFor !== key) return;
      const cached = D.exercises.filter((ex) => {
        if (filters.bodyPart && ex.bodyPartRaw && ex.bodyPartRaw !== filters.bodyPart) return false;
        if (filters.equipment && ex.eq !== filters.equipment && ex.equipment !== filters.equipment) return false;
        if (filters.q) {
          const hay = ((ex.name || "") + " " + (ex.originalName || "")).toLowerCase();
          if (hay.indexOf(filters.q.toLowerCase()) < 0) return false;
        }
        return true;
      });
      lib.data = cached.slice(0, lib.page * 20);
      lib.pagination = { page: lib.page, limit: 20, total: cached.length, totalPages: Math.max(1, Math.ceil(cached.length / 20)) };
      if (route().name === "library") library();
    }
  }

  function exercise() {
    const id = route().a;
    if (renderExerciseDetail(pageCtx(), id)) return;
    root().innerHTML = `<div class="screen rise">${top("Exercício", "#/library")}<p class="muted">Carregando...</p></div>${nav("library")}`;
    LF_API.getById(id).then((res) => {
      if (res && res.data) D.mergeCatalog([res.data]);
      if ((route().name === "exercise" || route().name === "exercicios") && route().a === id) exercise();
    }).catch(() => go("#/library"));
  }

  function progress() {
    const totalVol = S.history.reduce((a, h) => a + (h.volume || 0), 0);
    const sessions = S.history.length;
    const exercisesDone = S.history.reduce((a, h) => a + (h.exercises || 0), 0);
    const best = [...S.history].sort((a, b) => (b.volume || 0) - (a.volume || 0)).slice(0, 8);
    const vals = lastN(7).map((h) => h ? h.volume / 1000 : 0);
    root().innerHTML = `<div class="screen rise">
      ${top("Progresso")}
      <p class="section-title">Seus levantamentos</p>
      <div class="card mb-12">
        <h3>${Math.round(totalVol / 1000)}k</h3>
        <p class="muted">Levantado em ${sessions} sessões e ${exercisesDone} exercícios.</p>
      </div>
      <p class="section-title">Volume da semana</p>
      <div class="chart mb-12">${barChart(vals)}</div>
      <p class="section-title">Seus melhores exercícios</p>
      ${best.length ? best.map((h, i) => `<div class="history-item mb-8">
        <div><b>${String(i + 1).padStart(2, "0")} · ${h.name}</b><div class="tiny">${fmtDate(h.date)}</div></div>
        <div><b>${Math.round((h.volume || 0) / 1000)}k</b><div class="tiny">${h.duration} min</div></div>
      </div>`).join("") : `<div class="empty">Conclua um treino para ver recordes.</div>`}
      <button class="btn btn-ghost btn-block mt-16" data-go="#/history">Histórico completo</button>
      <button class="btn btn-ghost btn-block mt-8" data-go="#/recovery">Recuperação muscular</button>
    </div>${nav("progress")}`;
  }

  function lastN(n) {
    const out = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      out.push(S.history.find((h) => new Date(h.date).toDateString() === d.toDateString()) || null);
    }
    return out;
  }

  function barChart(values) {
    const max = Math.max(1, ...values);
    const w = 320, h = 120, gap = 8;
    const bw = (w - gap * values.length) / values.length;
    const bars = values.map((v, i) => {
      const bh = (v / max) * 90;
      const x = i * (bw + gap) + 4;
      const y = 105 - bh;
      return `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="6" fill="${i === values.length - 1 ? "#d4141a" : "#3a3a3a"}"/>`;
    }).join("");
    return `<svg viewBox="0 0 ${w} ${h}">${bars}</svg>`;
  }

  function profile() {
    const mins = S.history.reduce((a, h) => a + (h.duration || 0), 0);
    const prs = S.history.filter((h) => h.volume > 12000).length;
    root().innerHTML = `<div class="screen rise">
      ${top("Perfil")}
      <div class="center mb-16">
        <img src="assets/logo.png" alt="" style="width:88px;height:88px;border-radius:50%;margin:0 auto 8px;object-fit:cover">
        <h2>${S.profile.name}</h2>
        <span class="badge mt-8">Aluno London Fitness</span>
      </div>
      <div class="stat-grid mb-12">
        <div class="stat"><b>${S.history.length}</b><span>Treinos</span></div>
        <div class="stat"><b>${prs}</b><span>Recordes</span></div>
        <div class="stat"><b>${Math.max(1, Math.round(mins / 60))}h</b><span>Tempo ativo</span></div>
      </div>
      <p class="section-title">Perfil</p>
      <div class="list">
        <button class="item" data-go="#/measures" style="grid-template-columns:1fr auto"><div><h4>Medidas corporais</h4><p>Altura, peso e meta</p></div><span class="chev">›</span></button>
        <button class="item" data-go="#/settings" style="grid-template-columns:1fr auto"><div><h4>Nível de condicionamento</h4><p>${S.profile.level}</p></div><span class="chev">›</span></button>
        <button class="item" data-go="#/locations" style="grid-template-columns:1fr auto"><div><h4>Locais de treino</h4><p>${(S.locations || []).length} locais</p></div><span class="chev">›</span></button>
      </div>
      <p class="section-title">Notificações</p>
      <div class="list">
        <button class="item" data-act="tog-sound" style="grid-template-columns:1fr auto"><div><h4>Sons</h4><p>Alerta de descanso</p></div><span>${S.profile.sound ? "On" : "Off"}</span></button>
        <button class="item" data-act="tog-reminders" style="grid-template-columns:1fr auto"><div><h4>Lembretes de treino</h4><p>Aviso no horário</p></div><span>${S.settings.reminders ? "On" : "Off"}</span></button>
      </div>
      <p class="section-title">Apps conectados</p>
      <div class="list">
        <button class="item" data-go="#/apps" style="grid-template-columns:1fr auto"><div><h4>Apple Saúde</h4><p>${S.connectedApps.appleHealth === "connected" ? "Conectado" : "Não conectado"}</p></div><span class="chev">›</span></button>
        <button class="item" data-go="#/apps" style="grid-template-columns:1fr auto"><div><h4>Strava</h4><p>${S.connectedApps.strava === "connected" ? "Conectado" : "Não conectado"}</p></div><span class="chev">›</span></button>
      </div>
      <p class="section-title">Geral</p>
      <div class="list">
        <button class="item" data-act="tog-unit" style="grid-template-columns:1fr auto"><div><h4>Unidades de medida</h4><p>${S.profile.unitKg ? "kg" : "lb"}</p></div><span class="chev">›</span></button>
        <button class="item" data-go="#/membership" style="grid-template-columns:1fr auto"><div><h4>Matrícula</h4><p>${S.member.plan}</p></div><span class="chev">›</span></button>
        <button class="item" data-go="#/sync" style="grid-template-columns:1fr auto"><div><h4>Catálogo ExerciseDB</h4><p>${D.exercises.length} exercícios</p></div><span class="chev">›</span></button>
      </div>
      <button class="btn btn-ghost btn-block mt-16" data-act="logout">Sair</button>
    </div>${nav("profile")}`;
  }

  function locationsScreen() {
    root().innerHTML = `<div class="screen rise">
      ${top("Locais de treino", "#/profile")}
      ${(S.locations || []).map((l) => `<div class="card mb-8">
        <div class="kicker">${l.type === "gym" ? "Academia" : l.type}</div>
        <h3 class="mt-8">${l.name}</h3>
        <p class="tiny">${(l.equipment || []).length} equipamentos</p>
        <div class="row gap-8 mt-12">
          <button class="chip ${S.activeLocationId === l.id ? "on" : ""}" data-act="use-loc" data-id="${l.id}">Usar</button>
          <button class="chip" data-go="#/equipment">Editar equipamento</button>
        </div>
      </div>`).join("")}
      <button class="btn btn-ghost btn-block" data-act="add-loc">${I.plus} Novo local de treino</button>
    </div>${nav("profile")}`;
  }

  function equipmentScreen() {
    const loc = activeLocation();
    if (!loc) return go("#/locations");
    const enabled = new Set(loc.equipment || []);
    root().innerHTML = `<div class="screen rise">
      ${top("Editar equipamento", "#/locations")}
      ${EQUIPMENT_CATEGORIES.map((cat) => `
        <div class="eq-cat">
          <div class="row space mb-8"><b>${cat.label}</b>
            <button class="tiny" data-act="eq-all" data-cat="${cat.id}">Selecionar todos</button>
          </div>
          ${cat.items.map((item) => `<div class="eq-row">
            <span>${item.label}</span>
            <button class="toggle ${enabled.has(item.id) ? "on" : ""}" data-act="eq-tog" data-id="${item.id}"><i></i></button>
          </div>`).join("")}
        </div>
      `).join("")}
      <button class="btn btn-red btn-block" data-go="#/locations">Salvar alterações</button>
    </div>${nav("profile")}`;
  }

  function measuresScreen() {
    const m = S.bodyMeasures;
    root().innerHTML = `<div class="screen rise">
      ${top("Medidas corporais", "#/profile")}
      <div class="field mb-8"><label>Altura (cm)</label><input id="m-h" type="number" value="${m.height || ""}"></div>
      <div class="field mb-8"><label>Peso (kg)</label><input id="m-w" type="number" value="${m.weight || ""}"></div>
      <div class="field mb-16"><label>Meta de peso (kg)</label><input id="m-g" type="number" value="${m.weightGoal || ""}"></div>
      <button class="btn btn-red btn-block" data-act="save-measures">Salvar alterações</button>
    </div>${nav("profile")}`;
  }

  function appsScreen() {
    root().innerHTML = `<div class="screen rise">
      ${top("Apps conectados", "#/profile")}
      <p class="muted mb-12">Arquitetura pronta. Integração real fica para uma fase posterior.</p>
      <div class="eq-row"><div><b>Apple Saúde</b><p class="tiny">${S.connectedApps.appleHealth}</p></div>
        <button class="chip" data-act="tog-app" data-k="appleHealth">${S.connectedApps.appleHealth === "connected" ? "Desconectar" : "Conectar"}</button></div>
      <div class="eq-row"><div><b>Strava</b><p class="tiny">${S.connectedApps.strava}</p></div>
        <button class="chip" data-act="tog-app" data-k="strava">${S.connectedApps.strava === "connected" ? "Desconectar" : "Conectar"}</button></div>
    </div>${nav("profile")}`;
  }

  function membership() {
    const m = S.member;
    const left = daysLeft(m.expiresAt);
    root().innerHTML = `<div class="screen rise">
      ${top("Matrícula", "#/profile")}
      <div class="card shadow-red member-card">
        <div class="member-kicker">${m.unit}</div>
        <h3>LONDON FITNESS</h3>
        <div class="member-row">
          <div><small>Aluno</small><b>${m.name}</b></div>
          <div><small>Código</small><b>${m.code}</b></div>
        </div>
      </div>
      <div class="qr" title="QR da catraca (mock)"></div>
      <p class="tiny center">Apresente na recepção · catraca (mock do protótipo)</p>
      <div class="card mt-12">
        <div class="pay-row"><span>Status</span><b class="${left > 5 ? "ok" : "danger"}">${m.status === "ativa" ? "Ativa" : "Inativa"}</b></div>
        <div class="pay-row"><span>Plano</span><b>${m.plan}</b></div>
        <div class="pay-row"><span>Início</span><b>${fmtDate(m.startedAt)}</b></div>
        <div class="pay-row"><span>Validade</span><b>${fmtDate(m.expiresAt)}</b></div>
        <div class="pay-row"><span>Próximo pagamento</span><b>${fmtDate(m.nextPayment)}</b></div>
        <div class="pay-row"><span>Valor</span><b>R$ ${m.amount.toFixed(2)}</b></div>
        <div class="pay-row"><span>Dias restantes</span><b>${left}</b></div>
      </div>
      <p class="section-title">Pagamentos</p>
      ${m.payments.map((p) => `<div class="history-item"><div><b>${fmtDate(p.date)}</b><div class="tiny">Mensalidade</div></div><div><b>R$ ${p.value.toFixed(2)}</b><div class="tiny">${p.status}</div></div></div>`).join("")}
    </div>${nav("profile")}`;
  }

  function programScreen() {
    const p = D.programs.find((x) => x.id === route().a);
    if (!p) return go("#/workouts");
    root().innerHTML = `<div class="screen rise">
      ${top(p.name, "#/workouts")}
      <p class="muted mb-12">${p.blurb}</p>
      ${p.split.map((d, i) => `<div class="card mb-8"><b>${d.name}</b><p class="tiny">${d.items.map((it) => (D.byId[it.id] && D.byId[it.id].name) || it.id).join(" · ")}</p>
        <button class="btn btn-red btn-sm mt-8" data-act="start-program" data-pid="${p.id}" data-i="${i}">Iniciar este dia</button></div>`).join("")}
      <button class="btn btn-ghost btn-block mt-8" data-act="use-program" data-pid="${p.id}">Usar como meu plano</button>
    </div>${nav("workouts")}`;
  }

  function fastScreen() {
    root().innerHTML = `<div class="screen rise">
      ${top("Treino rápido", "#/workouts")}
      <p class="muted mb-12">Escolha até 2 grupos. A IA monta uma sessão curta com os aparelhos da academia.</p>
      <div class="chips wrap mb-16" id="fast-mus">
        ${D.muscles.map((m) => `<button class="chip" data-act="fast-tog" data-v="${m.id}">${m.label}</button>`).join("")}
      </div>
      <p class="section-title">Duração</p>
      <div class="row gap-8 mb-16">
        ${[20, 30, 45].map((n) => `<button class="chip ${n === 30 ? "on" : ""}" data-act="fast-dur" data-v="${n}">${n} min</button>`).join("")}
      </div>
      <button class="btn btn-red btn-block" data-act="fast-go">Gerar e treinar</button>
    </div>${nav("workouts")}`;
  }

  function recoveryScreen() {
    root().innerHTML = `<div class="screen rise">
      ${top("Recuperação muscular", "#/home")}
      <p class="muted mb-12">Baseado nos treinos concluídos. Verde = pronto. Vermelho = ainda fatigado.</p>
      <div class="rec-list">
        ${D.muscles.map((m) => {
          const pct = recoveryPct(m.id);
          const cls = pct < 40 ? "low" : pct < 75 ? "warn" : "";
          return `<div class="rec-row"><b>${m.label}</b><div class="bar ${cls}"><i style="width:${pct}%"></i></div><span>${pct}%</span></div>`;
        }).join("")}
      </div>
    </div>${nav("home")}`;
  }

  function historyScreen() {
    const list = [...S.history].reverse();
    root().innerHTML = `<div class="screen rise">
      ${top("Histórico", "#/progress")}
      ${list.length ? list.map((h) => `<div class="history-item mb-8"><div><b>${h.name}</b><div class="tiny">${fmtDate(h.date)} · ${h.duration} min</div></div><div><b>${(h.volume / 1000).toFixed(1)} t</b><div class="tiny">${h.calories} kcal</div></div></div>`).join("") : `<div class="empty">Nenhum treino registrado ainda.</div>`}
    </div>${nav("progress")}`;
  }

  function settingsScreen() {
    root().innerHTML = `<div class="screen rise">
      ${top("Configurações", "#/profile")}
      <div class="card mb-8 row space"><div><b>Alertas de descanso</b><p class="tiny">Som ao terminar o timer</p></div>
        <button class="chip ${S.profile.sound ? "on" : ""}" data-act="tog-sound">${S.profile.sound ? "Ligado" : "Desligado"}</button></div>
      <div class="card">
        <b>Descanso padrão</b>
        <div class="num-step mt-12">
          <button data-act="rest-adj" data-d="-15">−</button>
          <b>${S.profile.restDefault}s</b>
          <button data-act="rest-adj" data-d="15">+</button>
        </div>
      </div>
      <button class="btn btn-ghost btn-block mt-16 danger" data-act="reset">Limpar dados do protótipo</button>
    </div>${nav("profile")}`;
  }

  function aiScreen() {
    root().innerHTML = `<div class="screen no-nav rise center" style="padding-top:80px">
      <div class="ai-spin"></div>
      <h2>Montando seu plano</h2>
      <p class="muted mt-8">Ficha genérica com os aparelhos da London Fitness.</p>
    </div>`;
    try {
      if (!S.plan || !S.plan.split || !S.plan.split.length) {
        S.plan = D.generatePlan({ goal: S.profile.goal, level: S.profile.level, days: S.profile.days });
      }
      S.onboardingDone = true;
      persist();
    } catch (err) {
      S.plan = JSON.parse(JSON.stringify(D.programs.find((p) => p.id === "hipertrofia") || D.programs[0]));
      S.onboardingDone = true;
      persist();
    }
    setTimeout(() => go("#/home"), 700);
  }

  function createWorkout() {
    if (!draft) draft = { name: "Meu treino", items: [] };
    root().innerHTML = `<div class="screen rise">
      ${top("Nova ficha", "#/workouts")}
      <div class="field mb-12"><label>Nome do treino</label><input id="c-name" value="${draft.name}"></div>
      <div class="list mb-12">${draft.items.map((it, i) => {
        const e = D.byId[it.id];
        return `<div class="item">${gifBox(e, "gif-thumb")}
          <div><h4>${e && e.name || "Exercício"}</h4><p>${it.sets} x ${it.reps} · ${it.rest}s</p></div>
          <button class="chip" data-act="draft-del" data-i="${i}">✕</button></div>`;
      }).join("") || `<div class="empty">Adicione exercícios da biblioteca</div>`}</div>
      <button class="btn btn-ghost btn-block" data-act="draft-add">${I.plus} Adicionar exercício</button>
      <button class="btn btn-red btn-block mt-8" data-act="draft-save" ${draft.items.length ? "" : "disabled"}>Salvar ficha</button>
      <div id="picker"></div>
    </div>${nav("workouts")}`;
    const n = $("#c-name");
    if (n) n.addEventListener("input", (e) => { draft.name = e.target.value; });
  }

  function openPicker() {
    const box = $("#picker");
    if (!box) return;
    const list = pickerList;
    box.innerHTML = `<div class="overlay"><div class="sheet">
      <div class="handle"></div>
      <h3 class="mb-12">Escolher exercício</h3>
      <div class="search mb-12"><span>⌕</span><input id="pq" placeholder="Buscar exercício" value="${pickerQ}"></div>
      <div class="list">${list.map((e) => `<button class="item" data-act="pick-ex" data-id="${e.id}">
        ${exerciseCard(e)}</button>`).join("") || `<div class="empty">${pickerQ ? "Nenhum exercício encontrado." : "Busque pelo nome."}</div>`}</div>
      <button class="btn btn-ghost btn-block mt-12" data-act="pick-close">Fechar</button>
    </div></div>`;
    const input = $("#pq");
    if (input) {
      input.focus();
      input.addEventListener("input", (ev) => {
        pickerQ = ev.target.value;
        clearTimeout(openPicker.t);
        openPicker.t = setTimeout(() => loadPicker(pickerQ), 300);
        openPicker();
      });
    }
  }

  async function loadPicker(q) {
    try {
      const res = q
        ? await LF_API.search(q, 1, 20)
        : await LF_API.list({ page: 1, limit: 20 });
      D.mergeCatalog(res.data);
      pickerList = res.data.map((raw) => D.byId[raw.externalId]).filter(Boolean);
      if ($("#picker")) openPicker();
    } catch (e) {
      pickerList = [];
      if ($("#picker")) openPicker();
    }
  }

  function buildLive(name, items) {
    live = {
      name,
      index: 0,
      startedAt: Date.now(),
      rest: null,
      items: items.filter((it) => D.byId[it.id]).map((it) => {
        const e = D.byId[it.id];
        const sets = [];
        sets.push({ type: "W", kg: Math.max(0, Math.round((it.kg || e.kg) * 0.5)), reps: 12, done: false });
        for (let i = 0; i < (it.sets || e.sets); i++) {
          sets.push({ type: "N", kg: it.kg || e.kg, reps: it.reps || e.reps, done: false });
        }
        return { id: it.id, rest: it.rest || e.rest || S.profile.restDefault, sets };
      })
    };
    if (!live.items.length) { live = null; return; }
    go("#/session");
  }

  function sessionScreen() {
    if (!live || !live.items || !live.items.length) return go("#/home");
    const item = live.items[live.index];
    const e = D.byId[item.id];
    if (!e) return go("#/home");
    const doneSets = item.sets.filter((s) => s.done).length;
    root().innerHTML = `<div class="session">
      <div class="session-top">
        <button class="back-btn" data-act="quit-session">${I.back}</button>
        <div class="grow"><div class="kicker">Exercício ${live.index + 1}/${live.items.length}</div><b>${live.name}</b></div>
        <span class="tiny">${doneSets}/${item.sets.length}</span>
      </div>
      <div class="session-scroll">
        ${gifBox(e, "gif-lg")}
        <div style="padding:10px 16px 0">
          <h2>${e.name}</h2>
          <p class="muted">${e.equipment} · ${muscleLabel(e.muscle)}</p>
        </div>
        <div class="set-table">
          <div class="set-head"><span>#</span><span>Tipo</span><span>kg</span><span>Reps</span><span></span></div>
          ${item.sets.map((s, i) => `<div class="set-row">
            <span class="tiny">${i + 1}</span>
            <span class="type-tag">${s.type}</span>
            <input data-act="set-kg" data-i="${i}" type="number" value="${s.kg}">
            <input data-act="set-reps" data-i="${i}" type="number" value="${s.reps}">
            <button class="check ${s.done ? "on" : ""}" data-act="set-done" data-i="${i}">${I.check}</button>
          </div>`).join("")}
        </div>
        <div class="row gap-8" style="padding:8px 12px">
          <button class="chip" data-act="add-set" data-t="N">+ Série</button>
          <button class="chip" data-act="add-set" data-t="D">+ Drop set</button>
          <button class="chip" data-act="add-set" data-t="S">+ Superset</button>
        </div>
      </div>
      <div class="session-actions">
        <button class="btn btn-ghost" data-act="replace">Trocar</button>
        <button class="btn btn-red" data-act="next-ex">${live.index === live.items.length - 1 ? "Concluir treino" : "Próximo aparelho"}</button>
      </div>
      <div class="overlay ${live.rest ? "" : "hidden"}" id="rest">
        <div class="rest-card">
          <p class="kicker">Descanso</p>
          <div class="ring">
            <svg width="180" height="180" viewBox="0 0 180 180">
              <circle cx="90" cy="90" r="78" stroke="#2a2a2a" stroke-width="10" fill="none"/>
              <circle id="arc" cx="90" cy="90" r="78" stroke="#d4141a" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="490" stroke-dashoffset="0"/>
            </svg>
            <b id="rest-n">${live.rest ? live.rest.left : 0}</b>
          </div>
          <p class="muted mb-12">Próximo: ${e.name}</p>
          <div class="row gap-8">
            <button class="btn btn-ghost grow" data-act="rest-more">+15s</button>
            <button class="btn btn-red grow" data-act="rest-skip">Pular</button>
          </div>
        </div>
      </div>
    </div>`;
    if (live.rest) tickRest();
  }

  function startRest(seconds) {
    live.rest = { total: seconds, left: seconds };
    clearInterval(restTimer);
    restTimer = setInterval(() => {
      if (!live || !live.rest) return;
      live.rest.left -= 1;
      if (live.rest.left <= 0) {
        clearInterval(restTimer);
        live.rest = null;
        beep();
        sessionScreen();
        return;
      }
      const n = document.getElementById("rest-n");
      const arc = document.getElementById("arc");
      if (n) n.textContent = live.rest.left;
      if (arc) {
        const c = 2 * Math.PI * 78;
        arc.style.strokeDashoffset = String(c * (1 - live.rest.left / live.rest.total));
      }
    }, 1000);
    sessionScreen();
  }

  function tickRest() {
    const arc = document.getElementById("arc");
    if (arc && live.rest) {
      const c = 2 * Math.PI * 78;
      arc.style.strokeDasharray = String(c);
      arc.style.strokeDashoffset = String(c * (1 - live.rest.left / live.rest.total));
    }
  }

  function finishWorkout() {
    if (!live) return;
    let volume = 0, sets = 0;
    const muscles = {};
    live.items.forEach((it) => {
      const e = D.byId[it.id];
      muscles[e.muscle] = true;
      (e.secondary || []).forEach((m) => { muscles[m] = true; });
      it.sets.forEach((setRow) => {
        if (setRow.done) { volume += setVolume(setRow); sets += 1; }
      });
    });
    Object.keys(muscles).forEach((m) => { S.recovery[m] = Date.now(); });
    const duration = Math.max(1, Math.round((Date.now() - live.startedAt) / 60000));
    const rec = {
      id: "w" + Date.now(),
      date: new Date().toISOString(),
      name: live.name,
      duration,
      volume,
      calories: Math.round(duration * 8.2),
      exercises: live.items.length,
      sets
    };
    S.history.push(rec);
    persist();
    live._summary = rec;
    go("#/summary");
  }

  function summaryScreen() {
    const rec = live && live._summary;
    if (!rec) return go("#/home");
    root().innerHTML = `<div class="screen no-nav rise center" style="padding-top:48px">
      <img src="assets/logo.png" alt="" style="width:96px;height:96px;border-radius:50%;margin:0 auto 12px;object-fit:cover">
      <p class="kicker">Treino concluído</p>
      <h1 class="page-title mb-16">${rec.name}</h1>
      <div class="stat-grid">
        <div class="stat"><b>${rec.duration}</b><span>min</span></div>
        <div class="stat"><b>${(rec.volume / 1000).toFixed(1)}t</b><span>volume</span></div>
        <div class="stat"><b>${rec.calories}</b><span>kcal</span></div>
      </div>
      <p class="muted mt-16">Séries marcadas: ${rec.sets} · Aparelhos: ${rec.exercises}</p>
      <button class="btn btn-red btn-block mt-16" data-act="end-ok">Voltar ao início</button>
    </div>`;
  }

  function calcStreak() { return streakFromHistory(S.history); }

  let fastSel = [];
  let fastDur = 30;

  function onClick(ev) {
    const t = ev.target.closest("[data-go],[data-act]");
    if (!t) return;
    if (t.dataset.go) { go(t.dataset.go); return; }
    const act = t.dataset.act;
    if (act === "login") {
      S.profile.email = ($("#email") && $("#email").value) || S.profile.email;
      store.login();
      go(S.onboardingDone ? "#/home" : "#/onboarding");
    }
    if (act === "logout") { store.logout(); go("#/login"); }
    if (act === "reset") { if (confirm("Apagar dados locais deste protótipo?")) store.reset(); }
    if (act === "on-pick") {
      const k = t.dataset.k;
      onboard[k] = k === "days" ? Number(t.dataset.v) : t.dataset.v;
      onboarding();
    }
    if (act === "on-next") {
      if (onboard.step === 0) onboard.name = ($("#on-name") && $("#on-name").value) || onboard.name;
      if (onboard.step < 3) { onboard.step += 1; onboarding(); }
      else {
        S.profile.name = onboard.name;
        S.profile.goal = onboard.goal;
        S.profile.level = onboard.level;
        S.profile.days = onboard.days;
        S.member.name = onboard.name;
        try {
          S.plan = D.generatePlan({ goal: S.profile.goal, level: S.profile.level, days: S.profile.days });
        } catch (err) {
          S.plan = JSON.parse(JSON.stringify(D.programs.find((p) => p.id === "hipertrofia") || D.programs[0]));
        }
        S.onboardingDone = true;
        persist();
        go("#/ai");
      }
    }
    if (act === "on-back") { onboard.step = Math.max(0, onboard.step - 1); onboarding(); }
    if (act === "start-day") {
      const w = todayWorkout();
      if (w) buildLive(w.name, w.items);
    }
    if (act === "start-plan-day") {
      const cur = currentPlanDay();
      if (cur) buildLive(cur.day.name, cur.day.items);
    }
    if (act === "plan-day") {
      S.planDay = Number(t.dataset.i);
      persist();
      home();
    }
    if (act === "cycle-duration") {
      const opts = SESSION_DURATIONS;
      const i = opts.indexOf(Number(S.profile.sessionDuration) || 60);
      S.profile.sessionDuration = opts[(i + 1) % opts.length];
      persist();
      home();
    }
    if (act === "wtab") { workoutsTab = t.dataset.v; workouts(); }
    if (act === "lib-tab") {
      libTab = t.dataset.v;
      filters.bodyPart = "";
      filters.equipment = "";
      filters.targetMuscle = "";
      lib.page = 1;
      lib.loadedFor = "";
      library();
    }
    if (act === "lib-clear") {
      filters.bodyPart = "";
      filters.equipment = "";
      filters.targetMuscle = "";
      filters.q = "";
      lib.page = 1;
      lib.loadedFor = "";
      library();
    }
    if (handleChestAction(act, t, pageCtx())) return;
    if ((route().name === "exercise" || route().name === "exercicios") && handleDetailAction(act, t, pageCtx())) return;
    if (act === "ex-tab") { exTab = t.dataset.v; exercise(); }
    if (act === "ex-fb") {
      const id = route().a;
      S.feedback[id] = t.dataset.v;
      persist();
      exercise();
    }
    if (act === "replace-from-detail") {
      const e = D.byId[t.dataset.id];
      const alt = D.exercises.find((x) => x && e && x.muscle === e.muscle && x.id !== e.id);
      if (alt) go("#/exercise/" + alt.id);
    }
    if (act === "fav-ex" || act === "fav-card") {
      ev.preventDefault();
      ev.stopPropagation();
      FavoriteService.toggle(t.dataset.id);
      if (route().name === "library" && route().a === "peito") bootChestLibrary(pageCtx());
      else if (route().name === "exercise" || route().name === "exercicios") exercise();
      else if (route().name === "library") library();
    }
    if (act === "add-saved-plan") {
      const c = S.custom.find((x) => x.id === t.dataset.id);
      if (c && S.plan) {
        S.plan.split.push({ name: c.name, focus: [], items: c.items });
        persist();
        go("#/home");
      }
    }
    if (act === "use-loc") { S.activeLocationId = t.dataset.id; persist(); locationsScreen(); }
    if (act === "add-loc") {
      const name = prompt("Nome do local", "Academia 2");
      if (name) {
        const id = "loc-" + Date.now();
        S.locations.push({ id, name, type: "gym", equipment: [] });
        persist();
        locationsScreen();
      }
    }
    if (act === "eq-tog") {
      const loc = activeLocation();
      const id = t.dataset.id;
      const set = new Set(loc.equipment || []);
      if (set.has(id)) set.delete(id); else set.add(id);
      loc.equipment = Array.from(set);
      persist();
      equipmentScreen();
    }
    if (act === "eq-all") {
      const loc = activeLocation();
      const cat = EQUIPMENT_CATEGORIES.find((c) => c.id === t.dataset.cat);
      const set = new Set(loc.equipment || []);
      (cat.items || []).forEach((item) => set.add(item.id));
      loc.equipment = Array.from(set);
      persist();
      equipmentScreen();
    }
    if (act === "save-measures") {
      S.bodyMeasures.height = Number($("#m-h") && $("#m-h").value) || null;
      S.bodyMeasures.weight = Number($("#m-w") && $("#m-w").value) || null;
      S.bodyMeasures.weightGoal = Number($("#m-g") && $("#m-g").value) || null;
      persist();
      go("#/profile");
    }
    if (act === "tog-reminders") { S.settings.reminders = !S.settings.reminders; persist(); profile(); }
    if (act === "tog-unit") { S.profile.unitKg = !S.profile.unitKg; persist(); profile(); }
    if (act === "tog-app") {
      const k = t.dataset.k;
      S.connectedApps[k] = S.connectedApps[k] === "connected" ? "disconnected" : "connected";
      persist();
      appsScreen();
    }
    if (act === "start-split") {
      const d = S.plan.split[Number(t.dataset.i)];
      buildLive(d.name, d.items);
    }
    if (act === "start-custom") {
      const c = S.custom.find((x) => x.id === t.dataset.id);
      if (c) buildLive(c.name, c.items);
    }
    if (act === "start-one") {
      const e = D.byId[t.dataset.id] || catalogToAppView(ChestLibraryService.get(t.dataset.id));
      if (!e) return;
      buildLive(e.name, [{ id: e.id, sets: e.sets, reps: e.reps, kg: e.kg, rest: e.rest }]);
    }
    if (act === "start-program") {
      const p = D.programs.find((x) => x.id === t.dataset.pid);
      const d = p.split[Number(t.dataset.i)];
      buildLive(d.name, d.items);
    }
    if (act === "use-program") {
      const p = D.programs.find((x) => x.id === t.dataset.pid);
      S.plan = JSON.parse(JSON.stringify(p));
      persist();
      go("#/home");
    }
    if (act === "f-body") {
      filters.bodyPart = t.dataset.v || "";
      filters.targetMuscle = "";
      lib.page = 1;
      lib.loadedFor = "";
      library();
    }
    if (act === "f-muscle-art") {
      if (t.dataset.v === "peito") {
        go("#/library/peito");
        return;
      }
      const art = muscleArt(t.dataset.v);
      filters.bodyPart = (art && art.bodyPart) || "";
      filters.targetMuscle = (art && art.targetMuscle) || "";
      lib.page = 1;
      lib.loadedFor = "";
      library();
    }
    if (act === "f-equip") {
      filters.equipment = t.dataset.v || "";
      lib.page = 1;
      lib.loadedFor = "";
      library();
    }
    if (act === "f-target") {
      filters.targetMuscle = t.dataset.v || "";
      lib.page = 1;
      lib.loadedFor = "";
      library();
    }
    if (act === "lib-more") {
      lib.page += 1;
      lib.loadedFor = "";
      library();
    }
    if (act === "sync-now") startSync();
    if (act === "tog-sound") { S.profile.sound = !S.profile.sound; persist(); if (route().name === "settings") settingsScreen(); else profile(); }
    if (act === "rest-adj") {
      S.profile.restDefault = Math.max(30, S.profile.restDefault + Number(t.dataset.d));
      persist(); settingsScreen();
    }
    if (act === "draft-add") { pickerQ = ""; loadPicker(""); openPicker(); }
    if (act === "pick-close") { const p = $("#picker"); if (p) p.innerHTML = ""; }
    if (act === "pick-ex") {
      const e = D.byId[t.dataset.id];
      draft.items.push({ id: e.id, sets: e.sets, reps: e.reps, kg: e.kg, rest: e.rest });
      createWorkout();
    }
    if (act === "draft-del") { draft.items.splice(Number(t.dataset.i), 1); createWorkout(); }
    if (act === "draft-save") {
      S.custom.push({ id: "c" + Date.now(), name: draft.name || "Meu treino", items: draft.items });
      persist(); draft = null; go("#/workouts");
    }
    if (act === "fast-tog") {
      t.classList.toggle("on");
      const id = t.dataset.v;
      if (fastSel.includes(id)) fastSel = fastSel.filter((x) => x !== id);
      else if (fastSel.length < 2) fastSel.push(id);
      else { fastSel = [id]; document.querySelectorAll("#fast-mus .chip").forEach((c) => c.classList.toggle("on", c.dataset.v === id)); }
    }
    if (act === "fast-dur") {
      fastDur = Number(t.dataset.v);
      document.querySelectorAll("[data-act=fast-dur]").forEach((c) => c.classList.toggle("on", Number(c.dataset.v) === fastDur));
    }
    if (act === "fast-go") {
      const mus = fastSel.length ? fastSel : ["peito"];
      const n = fastDur <= 20 ? 4 : fastDur <= 30 ? 5 : 6;
      const items = D.exercises.filter((e) => mus.includes(e.muscle)).slice(0, n).map((e) => ({ id: e.id, sets: 3, reps: e.reps, kg: e.kg, rest: 45 }));
      buildLive("Rápido · " + mus.map(muscleLabel).join(" + "), items);
    }
    if (act === "set-done" && live) {
      const item = live.items[live.index];
      const s = item.sets[Number(t.dataset.i)];
      s.done = !s.done;
      if (s.done) startRest(item.rest || S.profile.restDefault);
      else { live.rest = null; clearInterval(restTimer); sessionScreen(); }
    }
    if (act === "add-set" && live) {
      const item = live.items[live.index];
      const last = item.sets[item.sets.length - 1] || { kg: 0, reps: 10 };
      item.sets.push({ type: t.dataset.t, kg: last.kg, reps: last.reps, done: false });
      sessionScreen();
    }
    if (act === "next-ex" && live) {
      if (live.index < live.items.length - 1) { live.index += 1; sessionScreen(); }
      else finishWorkout();
    }
    if (act === "quit-session") {
      if (confirm("Encerrar este treino?")) { live = null; go("#/home"); }
    }
    if (act === "rest-skip") { live.rest = null; clearInterval(restTimer); sessionScreen(); }
    if (act === "rest-more" && live.rest) { live.rest.left += 15; live.rest.total += 15; tickRest(); const n = document.getElementById("rest-n"); if (n) n.textContent = live.rest.left; }
    if (act === "replace" && live) {
      const cur = D.byId[live.items[live.index].id];
      const alts = D.exercises.filter((e) => e.muscle === cur.muscle && e.id !== cur.id).slice(0, 24);
      const overlay = document.createElement("div");
      overlay.className = "overlay";
      overlay.innerHTML = `<div class="sheet"><div class="handle"></div><h3 class="mb-12">Trocar exercício</h3>
        ${alts.map((e) => `<button class="item" data-act="do-replace" data-id="${e.id}">${gifBox(e, "gif-thumb")}<div><h4>${e.name}</h4><p>${e.equipment}</p></div></button>`).join("")}
        <button class="btn btn-ghost btn-block mt-12" id="close-rep">Fechar</button></div>`;
      root().appendChild(overlay);
      overlay.querySelector("#close-rep").onclick = () => overlay.remove();
    }
    if (act === "do-replace" && live) {
      const e = D.byId[t.dataset.id];
      live.items[live.index] = {
        id: e.id, rest: e.rest,
        sets: live.items[live.index].sets.map((s) => ({ ...s, done: false, kg: e.kg }))
      };
      sessionScreen();
    }
    if (act === "end-ok") { live = null; go("#/home"); }
  }

  function onInput(ev) {
    const t = ev.target;
    if (!live || !t.dataset.act) return;
    const item = live.items[live.index];
    const i = Number(t.dataset.i);
    if (t.dataset.act === "set-kg") item.sets[i].kg = Number(t.value);
    if (t.dataset.act === "set-reps") item.sets[i].reps = Number(t.value);
  }

  function applySyncStatus(st) {
    if (!st) return;
    syncUi.running = !!st.running;
    syncUi.page = st.page || 0;
    syncUi.loaded = st.fetched || st.count || 0;
    syncUi.total = st.externalTotal || st.count || syncUi.total || 1500;
    syncUi.message = st.message || "";
    syncUi.lastSyncAt = st.lastSyncAt || null;
    syncUi.lastReport = st.lastReport || null;
    if (st.count) lib.pagination.total = st.count;
  }

  function startSyncPoll() {
    if (startSyncPoll.t) return;
    startSyncPoll.t = setInterval(async () => {
      try {
        const st = await LF_API.syncStatus();
        applySyncStatus(st);
        const name = route().name;
        if (name === "sync" || name === "library" || name === "home" || name === "profile") render();
        if (!st.running) {
          clearInterval(startSyncPoll.t);
          startSyncPoll.t = null;
          await refreshFilters();
          await hydrateCatalog();
          if (S.onboardingDone && (!S.plan || !S.plan.split || !S.plan.split.some((d) => d.items && d.items.length))) {
            S.plan = D.generatePlan({ goal: S.profile.goal, level: S.profile.level, days: S.profile.days });
            persist();
          }
          render();
        }
      } catch (e) {}
    }, 800);
  }

  function startSync() {
    if (syncUi.running) return;
    syncUi.running = true;
    syncUi.message = "Sincronizando...";
    syncUi.lastReport = null;
    if (route().name === "sync") syncScreen();
    LF_API.sync().catch((err) => {
      syncUi.message = err.message || "Falha na sincronização";
      if (err.body) syncUi.lastReport = err.body;
    });
    startSyncPoll();
  }

  async function refreshFilters() {
    try {
      const res = await LF_API.filters();
      apiFilters = {
        bodyParts: res.bodyParts || [],
        equipments: res.equipments || [],
        targetMuscles: res.targetMuscles || []
      };
    } catch (e) {}
  }

  async function hydrateCatalog() {
    try {
      const first = await LF_API.list({ page: 1, limit: 100 });
      D.mergeCatalog(first.data);
      lib.pagination = first.pagination;
      const pages = Math.min(first.pagination.totalPages || 1, 8);
      for (let page = 2; page <= pages; page += 1) {
        const res = await LF_API.list({ page, limit: 100 });
        D.mergeCatalog(res.data);
      }
    } catch (e) {}
  }

  async function bootFromApi() {
    try {
      applySyncStatus(await LF_API.syncStatus());
    } catch (e) {}
    await refreshFilters();
    await hydrateCatalog();
    try {
      await ChestLibraryService.hydrate();
      registerChestCatalog();
    } catch (e) {
      registerChestCatalog();
    }
    if (syncUi.running) startSyncPoll();
    if (route().name === "library" || route().name === "sync" || route().name === "home" || route().name === "exercicios" || route().name === "exercise") render();
  }

  function init() {
    window.addEventListener("hashchange", render);
    root().addEventListener("click", onClick);
    root().addEventListener("change", onInput);
    root().addEventListener("input", onInput);
    registerChestCatalog();
    if (!location.hash) location.hash = S.session ? "#/home" : "#/splash";
    else render();
    bootFromApi();
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js").catch(() => {});
  }

export function initApp() { init(); }

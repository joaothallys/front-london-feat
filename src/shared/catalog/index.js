import { translateBody, translateEquipment, translateInstructions, translateMuscle, translateName } from "../i18n/pt.js";

  const muscles = [
    { id: "peito", label: "Peito", body: "chest" },
    { id: "costas", label: "Costas", body: "back" },
    { id: "ombros", label: "Ombros", body: "shoulders" },
    { id: "biceps", label: "Bíceps", body: "upper arms" },
    { id: "triceps", label: "Tríceps", body: "upper arms" },
    { id: "quadriceps", label: "Quadríceps", body: "upper legs" },
    { id: "posterior", label: "Posterior", body: "upper legs" },
    { id: "gluteos", label: "Glúteos", body: "upper legs" },
    { id: "panturrilha", label: "Panturrilha", body: "lower legs" },
    { id: "abdomen", label: "Abdômen", body: "waist" },
    { id: "cardio", label: "Cardio", body: "cardio" }
  ];

  const equipment = [
    { id: "barra", label: "Barra", raw: "barbell" },
    { id: "halteres", label: "Halteres", raw: "dumbbell" },
    { id: "polia", label: "Polia", raw: "cable" },
    { id: "maquina", label: "Máquina", raw: "leverage machine" },
    { id: "smith", label: "Smith", raw: "smith machine" },
    { id: "peso-corporal", label: "Peso corporal", raw: "body weight" }
  ];

  const demoMember = {
    name: "Ana Costa",
    email: "aluno@londonfitness.com",
    phone: "(11) 98888-1200",
    code: "LF-2024-1847",
    plan: "Mensal Premium",
    status: "ativa",
    startedAt: "2026-07-19",
    expiresAt: "2026-09-18",
    nextPayment: "2026-09-18",
    amount: 149.9,
    unit: "Unidade Centro",
    payments: [
      { date: "2026-07-19", value: 149.9, status: "Pago" },
      { date: "2026-08-18", value: 149.9, status: "Pago" },
      { date: "2026-09-18", value: 149.9, status: "Em aberto" }
    ]
  };

  const data = {
    muscles,
    equipment,
    exercises: [],
    byId: {},
    programs: [],
    demoMember,
    lastSync: null
  };

  function slug(text) {
    return String(text || "").toLowerCase().trim();
  }

  function mapMuscle(row) {
    const part = slug((row.bodyParts || [])[0]);
    const target = slug((row.targetMuscles || [])[0]);
    if (part === "chest") return "peito";
    if (part === "back") return "costas";
    if (part === "shoulders") return "ombros";
    if (part === "waist") return "abdomen";
    if (part === "lower legs") return "panturrilha";
    if (part === "cardio") return "cardio";
    if (part === "neck") return "ombros";
    if (part === "upper arms") return target.indexOf("tricep") >= 0 ? "triceps" : "biceps";
    if (part === "upper legs") {
      if (target.indexOf("hamstring") >= 0) return "posterior";
      if (target.indexOf("glute") >= 0) return "gluteos";
      return "quadriceps";
    }
    return "cardio";
  }

  function mapEq(row) {
    const raw = slug((row.equipments || [])[0]);
    if (raw === "barbell" || raw === "ez barbell") return "barra";
    if (raw === "dumbbell") return "halteres";
    if (raw === "cable") return "polia";
    if (raw === "smith machine") return "smith";
    if (raw === "body weight") return "peso-corporal";
    if (raw.indexOf("machine") >= 0 || raw === "assisted" || raw === "sled machine") return "maquina";
    return raw || "maquina";
  }

  function defaults(muscle) {
    if (muscle === "quadriceps" || muscle === "posterior" || muscle === "peito" || muscle === "costas") {
      return { sets: 4, reps: 10, kg: 30, rest: 90 };
    }
    if (muscle === "abdomen" || muscle === "cardio") return { sets: 3, reps: 15, kg: 0, rest: 40 };
    return { sets: 3, reps: 12, kg: 12, rest: 60 };
  }

  function toApp(row) {
    const muscle = mapMuscle(row);
    const eq = mapEq(row);
    const def = defaults(muscle);
    const body = slug((row.bodyParts || [])[0]);
    const target = slug((row.targetMuscles || [])[0]);
    const eqRaw = slug((row.equipments || [])[0]);
    const original = row.originalName || row.name || "";
    return {
      id: row.externalId || row.id,
      externalId: row.externalId,
      name: translateName(original),
      originalName: original,
      localizedName: translateName(original),
      muscle,
      secondary: (row.secondaryMuscles || []).map(translateMuscle),
      eq,
      equipment: translateEquipment(eqRaw) || "Academia",
      bodyPart: translateBody(body) || "",
      bodyPartRaw: body,
      target: translateMuscle(target) || "",
      targetRaw: target,
      gifUrl: row.gifUrl || null,
      gif: row.gifUrl || null,
      videoUrl: row.videoUrl || null,
      steps: translateInstructions(row.instructions || []),
      source: row.source || "exercisedb",
      sets: def.sets,
      reps: def.reps,
      kg: def.kg,
      rest: def.rest
    };
  }

  function isGym(ex) {
    return ["barra", "halteres", "polia", "maquina", "smith", "peso-corporal"].indexOf(ex.eq) >= 0;
  }

  function pick(muscle, n, used) {
    const pool = data.exercises.filter(function (e) {
      return e.muscle === muscle && isGym(e) && !used[e.id];
    });
    const chosen = pool.slice(0, n);
    chosen.forEach(function (e) { used[e.id] = true; });
    return chosen.map(function (e) {
      return { id: e.id, sets: e.sets, reps: e.reps, kg: e.kg, rest: e.rest };
    });
  }

  function buildPrograms() {
    const used = {};
    const recipes = [
      {
        id: "hipertrofia",
        name: "Hipertrofia 4x",
        goal: "hipertrofia",
        level: "intermediario",
        days: 4,
        blurb: "Volume alto com os exercícios sincronizados da ExerciseDB.",
        daysDef: [
          { name: "A · Peito e tríceps", focus: ["peito", "triceps"], picks: [["peito", 4], ["triceps", 2]] },
          { name: "B · Costas e bíceps", focus: ["costas", "biceps"], picks: [["costas", 4], ["biceps", 2]] },
          { name: "C · Pernas", focus: ["quadriceps", "posterior", "gluteos"], picks: [["quadriceps", 3], ["posterior", 2], ["panturrilha", 1]] },
          { name: "D · Ombros e abdômen", focus: ["ombros", "abdomen"], picks: [["ombros", 4], ["abdomen", 2]] }
        ]
      },
      {
        id: "forca",
        name: "Força 3x",
        goal: "forca",
        level: "avancado",
        days: 3,
        blurb: "Básicos pesados montados a partir do catálogo.",
        daysDef: [
          { name: "A · Empurrar", focus: ["peito", "ombros", "triceps"], picks: [["peito", 2], ["ombros", 1], ["triceps", 1]] },
          { name: "B · Puxar", focus: ["costas", "biceps"], picks: [["costas", 3], ["biceps", 1]] },
          { name: "C · Pernas", focus: ["quadriceps", "posterior"], picks: [["quadriceps", 2], ["posterior", 2]] }
        ]
      },
      {
        id: "emagrecimento",
        name: "Emagrecimento 5x",
        goal: "emagrecimento",
        level: "iniciante",
        days: 5,
        blurb: "Densidade alta, descansos curtos.",
        daysDef: [
          { name: "A · Full body", focus: ["peito", "costas", "quadriceps"], picks: [["peito", 1], ["costas", 1], ["quadriceps", 1], ["cardio", 1]] },
          { name: "B · Posterior e core", focus: ["posterior", "abdomen"], picks: [["posterior", 2], ["abdomen", 2]] },
          { name: "C · Superiores", focus: ["ombros", "peito", "costas"], picks: [["peito", 1], ["costas", 1], ["ombros", 1], ["triceps", 1]] },
          { name: "D · Pernas", focus: ["quadriceps", "gluteos"], picks: [["quadriceps", 2], ["gluteos", 1], ["panturrilha", 1]] },
          { name: "E · Core e cardio", focus: ["abdomen", "cardio"], picks: [["abdomen", 2], ["cardio", 2]] }
        ]
      },
      {
        id: "definicao",
        name: "Definição 4x",
        goal: "definicao",
        level: "intermediario",
        days: 4,
        blurb: "Hipertrofia com densidade e abdômen.",
        daysDef: [
          { name: "A · Push", focus: ["peito", "ombros", "triceps"], picks: [["peito", 2], ["ombros", 2], ["triceps", 1]] },
          { name: "B · Pull", focus: ["costas", "biceps"], picks: [["costas", 3], ["biceps", 2]] },
          { name: "C · Legs", focus: ["quadriceps", "posterior"], picks: [["quadriceps", 2], ["posterior", 2], ["gluteos", 1]] },
          { name: "D · Upper pump", focus: ["peito", "costas"], picks: [["peito", 2], ["costas", 2], ["abdomen", 1]] }
        ]
      },
      {
        id: "ppl",
        name: "Push Pull Legs",
        goal: "hipertrofia",
        level: "intermediario",
        days: 6,
        blurb: "Empurra, puxa e pernas duas vezes na semana.",
        daysDef: [
          { name: "Push 1", focus: ["peito", "ombros", "triceps"], picks: [["peito", 2], ["ombros", 2], ["triceps", 1]] },
          { name: "Pull 1", focus: ["costas", "biceps"], picks: [["costas", 3], ["biceps", 2]] },
          { name: "Legs 1", focus: ["quadriceps", "posterior"], picks: [["quadriceps", 2], ["posterior", 2]] },
          { name: "Push 2", focus: ["peito", "ombros", "triceps"], picks: [["peito", 2], ["ombros", 2], ["triceps", 1]] },
          { name: "Pull 2", focus: ["costas", "biceps"], picks: [["costas", 3], ["biceps", 1]] },
          { name: "Legs 2", focus: ["gluteos", "quadriceps"], picks: [["quadriceps", 2], ["gluteos", 2]] }
        ]
      },
      {
        id: "abc",
        name: "ABC clássico",
        goal: "hipertrofia",
        level: "iniciante",
        days: 3,
        blurb: "A, B e C — simples de seguir na academia.",
        daysDef: [
          { name: "A · Peito, ombro e tríceps", focus: ["peito", "ombros", "triceps"], picks: [["peito", 2], ["ombros", 2], ["triceps", 1]] },
          { name: "B · Costas e bíceps", focus: ["costas", "biceps"], picks: [["costas", 3], ["biceps", 2]] },
          { name: "C · Pernas e abdômen", focus: ["quadriceps", "abdomen"], picks: [["quadriceps", 3], ["abdomen", 2]] }
        ]
      }
    ];

    data.programs = recipes.map(function (recipe) {
      const localUsed = {};
      return {
        id: recipe.id,
        name: recipe.name,
        goal: recipe.goal,
        level: recipe.level,
        days: recipe.days,
        blurb: recipe.blurb,
        split: recipe.daysDef.map(function (day) {
          let items = [];
          day.picks.forEach(function (pair) {
            items = items.concat(pick(pair[0], pair[1], localUsed));
          });
          if (!items.length) items = pick(day.focus[0], 3, used);
          return { name: day.name, focus: day.focus, items: items };
        }).filter(function (d) { return d.items.length; })
      };
    }).filter(function (p) { return p.split.length; });
  }

  function applyCatalog(rows) {
    data.exercises = (rows || []).map(toApp);
    data.byId = {};
    data.exercises.forEach(function (e) { data.byId[e.id] = e; });
    buildPrograms();
    return data.exercises.length;
  }

  function generatePlan(opts) {
    const goal = (opts && opts.goal) || "hipertrofia";
    const level = (opts && opts.level) || "intermediario";
    const days = (opts && opts.days) || 4;
    const map = {
      hipertrofia: ["hipertrofia", "ppl", "abc"],
      forca: ["forca", "abc"],
      emagrecimento: ["emagrecimento", "definicao"],
      definicao: ["definicao", "hipertrofia"]
    };
    const ids = map[goal] || ["abc"];
    let best = data.programs.find(function (p) { return ids.indexOf(p.id) >= 0 && p.days === days; });
    if (!best) best = data.programs.find(function (p) { return ids.indexOf(p.id) >= 0; }) || data.programs[0];
    if (!best) return { name: "Plano genérico", split: [], source: "ia" };
    const clone = JSON.parse(JSON.stringify(best));
    clone.split = clone.split.slice(0, days);
    clone.split.forEach(function (d) {
      d.items.forEach(function (it) {
        if (level === "iniciante") { it.sets = Math.min(it.sets, 3); it.kg = Math.round(it.kg * 0.7); }
        if (level === "avancado") { it.sets = Math.max(it.sets, 4); it.kg = Math.round(it.kg * 1.15); }
        if (goal === "forca") { it.reps = Math.min(it.reps, 6); it.rest = Math.max(it.rest, 120); }
        if (goal === "emagrecimento") { it.rest = Math.min(it.rest, 45); it.reps = Math.max(it.reps, 12); }
      });
    });
    clone.source = "ia";
    clone.generatedAt = Date.now();
    return clone;
  }

data.applyCatalog = applyCatalog;
data.mergeCatalog = function (rows) {
  (rows || []).forEach(function (row) {
    const ex = toApp(row);
    data.byId[ex.id] = ex;
    const idx = data.exercises.findIndex(function (e) { return e.id === ex.id; });
    if (idx >= 0) data.exercises[idx] = ex;
    else data.exercises.push(ex);
  });
  buildPrograms();
  return data.exercises.length;
};
data.generatePlan = generatePlan;
data.bodyLabel = function (v) { return translateBody(v) || v; };
data.eqLabel = function (v) { return translateEquipment(v) || v; };
data.muscleLabel = function (v) { return translateMuscle(v) || v; };

export const catalog = data;
export default data;

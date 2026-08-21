function fold(text) {
  return String(text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function family(name) {
  const n = fold(name);
  if (n.indexOf("crucifixo") >= 0 || n.indexOf("voador") >= 0 || n.indexOf("crossover") >= 0 || n.indexOf("face pull") >= 0) return "fly";
  if (n.indexOf("supino") >= 0) return "press";
  if (n.indexOf("flexao") >= 0 || n.indexOf("pike") >= 0 || n.indexOf("handstand") >= 0) return "pushup";
  if (n.indexOf("pullover") >= 0) return "pullover";
  if (n.indexOf("alongamento") >= 0) return "stretch";
  if (n.indexOf("remada") >= 0) return "remada";
  if (n.indexOf("puxada") >= 0 || n.indexOf("pulldown") >= 0 || n.indexOf("puxador") >= 0 || n.indexOf("barra fixa") >= 0 || n.indexOf("muscle-up") >= 0) return "puxada";
  if (n.indexOf("desenvolvimento") >= 0 || n.indexOf("militar") >= 0 || n.indexOf("arnold") >= 0 || n.indexOf("cuban") >= 0 || n.indexOf("thruster") >= 0) return "desenvolvimento";
  if (n.indexOf("elevacao lateral") >= 0 || n.indexOf("machine lateral") >= 0) return "elevacao-lateral";
  if (n.indexOf("elevacao frontal") >= 0) return "elevacao-frontal";
  if (n.indexOf("elevacao") >= 0) return "elevacao";
  if (n.indexOf("rotacao") >= 0) return "rotacao";
  if (n.indexOf("encolhimento") >= 0) return "shrug";
  if (n.indexOf("scott") >= 0) return "scott";
  if (n.indexOf("martelo") >= 0) return "martelo";
  if (n.indexOf("rosca") >= 0 || n.indexOf("biceps") >= 0) return "rosca";
  return "";
}

function overlap(a, b) {
  const left = (a || []).map(fold);
  const right = (b || []).map(fold);
  let n = 0;
  left.forEach((item) => {
    if (right.indexOf(item) >= 0) n += 1;
  });
  return n;
}

export function findSimilarExercises(exercise, pool, limit) {
  if (!exercise) return [];
  const max = limit || 3;
  const primary = fold(exercise.primaryMuscle || exercise.category);
  return (pool || [])
    .filter((item) => item && item.id !== exercise.id && item.isActive !== false)
    .map((item) => {
      let score = 0;
      if (fold(item.primaryMuscle || item.category) === primary) score += 50;
      score += overlap(exercise.secondaryMuscles, item.secondaryMuscles) * 10;
      if (item.equipmentId && item.equipmentId === exercise.equipmentId) score += 20;
      if (item.category && item.category === exercise.category) score += 15;
      if (item.level && item.level === exercise.level) score += 5;
      const fam = family(exercise.displayName);
      if (fam && fam === family(item.displayName)) score += 28;
      const srcName = fold(exercise.displayName);
      const itemName = fold(item.displayName);
      if (srcName.indexOf("crucifixo") >= 0 && itemName.indexOf("crucifixo") >= 0) score += 16;
      return { item, score };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || (b.item.popularity || 0) - (a.item.popularity || 0))
    .slice(0, max)
    .map((row) => row.item);
}

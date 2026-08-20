function fold(text) {
  return String(text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function family(name) {
  const n = fold(name);
  if (n.indexOf("crucifixo") >= 0 || n.indexOf("voador") >= 0 || n.indexOf("crossover") >= 0) return "fly";
  if (n.indexOf("supino") >= 0) return "press";
  if (n.indexOf("flexao") >= 0) return "pushup";
  if (n.indexOf("pullover") >= 0) return "pullover";
  if (n.indexOf("alongamento") >= 0) return "stretch";
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

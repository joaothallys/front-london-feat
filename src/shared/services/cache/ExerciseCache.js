const KEY = "london-fitness-exercise-cache";

function blank() {
  return { exercises: {}, media: {}, updatedAt: 0 };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blank();
    return Object.assign(blank(), JSON.parse(raw));
  } catch (err) {
    return blank();
  }
}

function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (err) {}
}

const state = load();

export const ExerciseCache = {
  saveExercise(exercise) {
    if (!exercise || !exercise.id) return;
    const media = exercise.media || {};
    state.exercises[exercise.id] = {
      id: exercise.id,
      displayName: exercise.displayName,
      sourceName: exercise.sourceName,
      sourceId: exercise.sourceId,
      category: exercise.category,
      primaryMuscle: exercise.primaryMuscle,
      equipment: exercise.equipment,
      equipmentId: exercise.equipmentId,
      level: exercise.level,
      thumbnailUrl: media.thumbnailUrl || media.url || "",
      mediaUrl: media.url || "",
      mediaSource: media.source || "",
      updatedAt: Date.now()
    };
    state.updatedAt = Date.now();
    save(state);
  },

  saveMany(list) {
    (list || []).forEach((exercise) => this.saveExercise(exercise));
  },

  getExercise(id) {
    return state.exercises[id] || null;
  },

  allExercises() {
    return Object.keys(state.exercises).map((id) => state.exercises[id]);
  },

  saveMedia(entry) {
    if (!entry || !entry.exerciseId || !entry.mediaUrl) return;
    state.media[entry.exerciseId] = {
      exerciseId: entry.exerciseId,
      mediaSource: entry.mediaSource,
      mediaUrl: entry.mediaUrl,
      thumbnailUrl: entry.thumbnailUrl || entry.mediaUrl,
      updatedAt: Date.now()
    };
    save(state);
  },

  getMedia(exerciseId) {
    return state.media[exerciseId] || null;
  }
};

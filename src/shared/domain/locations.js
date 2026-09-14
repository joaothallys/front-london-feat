export const EQUIPMENT_CATEGORIES = [
  {
    id: "machines",
    label: "Máquinas de peso",
    items: [
      { id: "leverage machine", label: "Máquina guiada" },
      { id: "smith machine", label: "Smith" },
      { id: "sled machine", label: "Sled" },
      { id: "assisted", label: "Assistido" }
    ]
  },
  {
    id: "free-weights",
    label: "Pesos livres",
    items: [
      { id: "dumbbell", label: "Halteres" },
      { id: "barbell", label: "Barra" },
      { id: "ez barbell", label: "Barra W" },
      { id: "kettlebell", label: "Kettlebell" },
      { id: "weighted", label: "Anilha" }
    ]
  },
  {
    id: "cables",
    label: "Cabos e elásticos",
    items: [
      { id: "cable", label: "Polia / cabo" },
      { id: "band", label: "Elástico" },
      { id: "resistance band", label: "Faixa elástica" }
    ]
  },
  {
    id: "benches",
    label: "Bancos e racks",
    items: [
      { id: "body weight", label: "Peso corporal" }
    ]
  }
];

export function allEquipmentIds() {
  return EQUIPMENT_CATEGORIES.flatMap((cat) => cat.items.map((item) => item.id));
}

export const LONDON_FIT_ID = "loc-london-fit";
export const INDEPENDENT_ID = "loc-independent";

export function londonFitGym() {
  return {
    id: LONDON_FIT_ID,
    name: "Academia London Fit",
    type: "gym",
    partner: true,
    equipment: allEquipmentIds()
  };
}

export function independentLocation() {
  return {
    id: INDEPENDENT_ID,
    name: "Treino por conta",
    type: "gym",
    partner: false,
    equipment: allEquipmentIds()
  };
}

export function defaultLocations() {
  return [independentLocation(), londonFitGym()];
}

export function isLondonFit(loc) {
  if (!loc) return false;
  if (loc.id === LONDON_FIT_ID || loc.partner) return true;
  return String(loc.name || "").toLowerCase().indexOf("london fit") >= 0;
}

export function ensurePartnerGyms(list) {
  const out = Array.isArray(list) ? list.slice() : [];
  const hasIndie = out.some((row) => row.id === INDEPENDENT_ID);
  const hasLondon = out.some(isLondonFit);
  if (!hasIndie) out.unshift(independentLocation());
  if (!hasLondon) {
    const indieAt = out.findIndex((row) => row.id === INDEPENDENT_ID);
    out.splice(indieAt >= 0 ? indieAt + 1 : 0, 0, londonFitGym());
  }
  return out;
}

export function applyGymChoice(state, gymId) {
  state.locations = ensurePartnerGyms(state.locations || []);
  if (gymId === LONDON_FIT_ID) {
    state.activeLocationId = LONDON_FIT_ID;
    if (state.member) state.member.unit = "Academia London Fit";
    if (state.profile) state.profile.environment = "academia";
    return;
  }
  state.activeLocationId = INDEPENDENT_ID;
  if (state.member) state.member.unit = "";
}

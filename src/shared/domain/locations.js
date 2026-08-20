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

export function defaultLocations() {
  return [
    {
      id: "loc-academia",
      name: "Minha Academia",
      type: "gym",
      equipment: allEquipmentIds()
    }
  ];
}

import React, { useMemo, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { ChestLibraryService } from "@shared/services/exercises/ChestLibraryService.js";
import { CATEGORY_META } from "@shared/data/exercises/catalogBuilder.js";
import { Chip, Empty, Field, Row, Screen, TopBar } from "../../src/components/ui.js";
import { ExerciseThumb } from "../../src/components/ExerciseThumb.js";
import { catalogToAppView } from "@shared/data/exercises/exerciseCatalog.js";

export default function CategoryLibrary() {
  const { category } = useLocalSearchParams();
  const cat = CATEGORY_META[category] || CATEGORY_META.peito;
  const [q, setQ] = useState("");
  const [equipment, setEquipment] = useState("todos");
  const list = useMemo(() => {
    return ChestLibraryService.query({ category: cat.id, q, equipment, level: "todos", sort: "popularidade" });
  }, [cat.id, q, equipment]);

  return (
    <Screen>
      <TopBar title={cat.title} back="/(tabs)/library" />
      <Field placeholder="Buscar" value={q} onChangeText={setQ} />
      <Chip label={equipment === "todos" ? "Todos equipamentos" : equipment} onPress={() => setEquipment(equipment === "todos" ? "halteres" : "todos")} />
      {list.length ? list.map((ex) => {
        const view = catalogToAppView(ex);
        return (
          <Row
            key={ex.id}
            title={ex.displayName}
            subtitle={(ex.equipment || "") + " · " + (ex.level || "")}
            thumb={<ExerciseThumb exercise={view} />}
            onPress={() => router.push("/exercise/" + ex.id)}
          />
        );
      }) : <Empty>Nenhum exercício nesta categoria.</Empty>}
    </Screen>
  );
}

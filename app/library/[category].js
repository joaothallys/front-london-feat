import React, { useEffect, useMemo, useRef, useState } from "react";
import { Text, View } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ChestLibraryService } from "@shared/services/exercises/ChestLibraryService.js";
import { FavoriteService } from "@shared/services/favorites/FavoriteService.js";
import { CATEGORY_META } from "@shared/data/exercises/catalogBuilder.js";
import { EQUIPMENT_FILTERS, LEVELS } from "@shared/types/exercise.js";
import { resolveListThumb } from "@shared/services/media/LondonMediaService.js";
import { Chip, Empty, Field, Screen, TopBar } from "../../src/components/ui.js";
import { HapticPressable } from "../../src/components/HapticPressable.js";
import { catalogToAppView } from "@shared/data/exercises/exerciseCatalog.js";
import { mediaUrl } from "../../src/catalog.js";
import { useAppState } from "../../src/state/AppState.js";
import { useStyles, useTheme } from "../../src/theme.js";

const LEVEL_LBL = { iniciante: "Iniciante", intermediario: "Intermediário", avancado: "Avançado" };

export default function CategoryLibrary() {
  const { colors } = useTheme();
  const styles = useStyles(styleFactory);
  const { state, refresh } = useAppState();
  const gender = state.profile && state.profile.gender;
  const { category } = useLocalSearchParams();
  const cat = CATEGORY_META[category] || CATEGORY_META.peito;
  const [q, setQ] = useState("");
  const [level, setLevel] = useState("todos");
  const [equipment, setEquipment] = useState("todos");
  const list = useMemo(() => {
    return ChestLibraryService.query({ category: cat.id, q, equipment, level, sort: "popularidade" });
  }, [cat.id, q, equipment, level]);

  function cycle(list, current, set) {
    const i = list.findIndex((row) => row.id === current);
    const next = list[(i + 1) % list.length];
    set(next.id);
  }

  const levelLbl = (LEVELS.find((row) => row.id === level) || LEVELS[0]).label;
  const eqLbl = (EQUIPMENT_FILTERS.find((row) => row.id === equipment) || EQUIPMENT_FILTERS[0]).label;

  return (
    <Screen>
      <TopBar title={cat.title} back="/(tabs)/library" />
      <Field placeholder="Buscar" value={q} onChangeText={setQ} />
      <View style={styles.filters}>
        <Chip label={"Nível: " + levelLbl} on={level !== "todos"} onPress={() => cycle(LEVELS, level, setLevel)} />
        <Chip label={"Academia: " + eqLbl} on={equipment !== "todos"} onPress={() => cycle(EQUIPMENT_FILTERS, equipment, setEquipment)} />
      </View>
      <Text style={styles.count}>{list.length} exercício{list.length === 1 ? "" : "s"}</Text>
      {list.length ? (
        <View style={styles.grid}>
          {list.map((ex) => {
            const view = catalogToAppView(ex);
            const uri = mediaUrl(view);
            const fav = FavoriteService.has(ex.id);
            return (
              <View key={ex.id} style={styles.card}>
                <HapticPressable onPress={() => router.push("/exercise/" + ex.id)}>
                  <View style={styles.media}>
                    <CardThumb exercise={view} fallback={uri} gender={gender} />
                  </View>
                  <Text style={styles.name} numberOfLines={2}>{ex.displayName}</Text>
                  <Text style={styles.meta} numberOfLines={1}>
                    {(ex.equipment || "") + (ex.level ? " · " + (LEVEL_LBL[ex.level] || ex.level) : "")}
                  </Text>
                </HapticPressable>
                <HapticPressable
                  style={styles.fav}
                  onPress={() => { FavoriteService.toggle(ex.id); refresh(); }}
                >
                  <Ionicons name={fav ? "heart" : "heart-outline"} size={16} color={fav ? colors.red : colors.muted} />
                </HapticPressable>
              </View>
            );
          })}
        </View>
      ) : <Empty>Nenhum exercício nesta categoria.</Empty>}
    </Screen>
  );
}

function CardThumb({ exercise, fallback, gender }) {
  const styles = useStyles(styleFactory);
  const [uri, setUri] = useState(fallback || "");

  useEffect(() => {
    let live = true;
    if (fallback) {
      setUri(fallback);
      return;
    }
    resolveListThumb(exercise, gender).then((next) => {
      if (live && next) setUri(next);
    });
    return () => { live = false; };
  }, [exercise && exercise.id, fallback, gender]);

  if (!uri) return <View style={styles.ph} />;
  return <StillThumb uri={uri} />;
}

function StillThumb({ uri }) {
  const styles = useStyles(styleFactory);
  const ref = useRef(null);
  return (
    <Image
      ref={ref}
      source={{ uri }}
      style={styles.img}
      contentFit="contain"
      cachePolicy="memory-disk"
      autoplay={false}
      onLoad={() => {
        if (ref.current && ref.current.stopAnimating) ref.current.stopAnimating();
      }}
    />
  );
}

function styleFactory(c) {
  return {
    filters: { flexDirection: "row", flexWrap: "wrap" },
    count: { color: c.muted, fontSize: 12, marginBottom: 10 },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    card: { width: "48%", backgroundColor: c.surface, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: c.line, paddingBottom: 10 },
    media: { width: "100%", height: 128, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
    img: { width: "100%", height: 128, backgroundColor: "#fff" },
    ph: { width: "100%", height: 128, backgroundColor: "#fff" },
    name: { color: c.text, fontWeight: "800", fontSize: 13, marginTop: 8, marginHorizontal: 8, minHeight: 34 },
    meta: { color: c.muted, fontSize: 11, marginHorizontal: 8, marginTop: 2 },
    fav: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: "rgba(255,255,255,0.92)",
      alignItems: "center",
      justifyContent: "center"
    }
  };
}

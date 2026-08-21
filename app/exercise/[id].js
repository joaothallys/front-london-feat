import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Image } from "expo-image";
import { ChestLibraryService } from "@shared/services/exercises/ChestLibraryService.js";
import { FavoriteService } from "@shared/services/favorites/FavoriteService.js";
import { FeedbackService } from "@shared/services/feedback/FeedbackService.js";
import { Button, Chip, Screen, Section, TopBar } from "../../src/components/ui.js";
import { useLive } from "../../src/state/LiveSession.js";
import { useAppState } from "../../src/state/AppState.js";
import { exerciseOf, mediaUrl } from "../../src/catalog.js";
import { colors } from "../../src/theme.js";

export default function ExerciseDetail() {
  const { id } = useLocalSearchParams();
  const { refresh } = useAppState();
  const { start } = useLive();
  const [tab, setTab] = useState("muscle");
  const catalog = ChestLibraryService.get(id);
  const view = exerciseOf(id);
  if (!catalog && !view) {
    return <Screen><TopBar title="Exercício" back /><Text style={{ color: colors.muted }}>Não encontrado.</Text></Screen>;
  }
  const name = catalog ? catalog.displayName : view.name;
  const uri = mediaUrl(view || catalog);
  const steps = catalog && catalog.instructions ? catalog.instructions.map((s) => s.text || s) : (view && view.steps) || [];
  const tips = (catalog && catalog.importantTips) || [];
  const fav = FavoriteService.has(id);
  const fb = FeedbackService.get(id);

  function begin() {
    const e = view || { id, sets: 3, reps: 12, kg: 12, rest: 60, name };
    const live = start(name, [{ id: e.id, sets: e.sets, reps: e.reps, kg: e.kg, rest: e.rest }], { sourceType: "single", sourceId: e.id });
    if (live) router.push("/session");
  }

  return (
    <Screen>
      <TopBar title={name} back />
      {uri ? <Image source={{ uri }} style={styles.gif} contentFit="contain" /> : null}
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 12 }}>
        <Chip label={fav ? "Favorito" : "Favoritar"} on={fav} onPress={() => { FavoriteService.toggle(id); refresh(); }} />
        <Chip label="Gostei" on={fb === "positive"} onPress={() => { FeedbackService.set(id, "positive"); refresh(); }} />
        <Chip label="Não gostei" on={fb === "negative"} onPress={() => { FeedbackService.set(id, "negative"); refresh(); }} />
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}>
        <Chip label="Músculo" on={tab === "muscle"} onPress={() => setTab("muscle")} />
        <Chip label="Instruções" on={tab === "instructions"} onPress={() => setTab("instructions")} />
      </View>
      {tab === "muscle" ? (
        <>
          <Section>Músculo principal</Section>
          <Text style={styles.p}>{(catalog && catalog.primaryMuscle) || (view && view.bodyPart)}</Text>
          <Section>Secundários</Section>
          <Text style={styles.p}>{(catalog ? catalog.secondaryMuscles : view && view.secondary || []).join(", ") || "—"}</Text>
        </>
      ) : (
        <>
          {steps.map((s, i) => <Text key={i} style={styles.p}>{i + 1}. {s}</Text>)}
          {tips.length ? <Section>Dicas</Section> : null}
          {tips.map((t, i) => <Text key={i} style={styles.p}>• {t.text || t}</Text>)}
        </>
      )}
      <Button label="Treinar este exercício" onPress={begin} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  gif: { width: "100%", height: 240, backgroundColor: colors.surface, borderRadius: 16 },
  p: { color: colors.muted2, lineHeight: 22, marginBottom: 8 }
});

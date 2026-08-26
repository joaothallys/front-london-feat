import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Image } from "expo-image";
import { ChestLibraryService } from "@shared/services/exercises/ChestLibraryService.js";
import { ensure } from "@shared/services/exercises/LondonExercise.js";
import { fetchExerciseMedia, pickDetailUrl } from "@shared/services/media/LondonMediaService.js";
import { FavoriteService } from "@shared/services/favorites/FavoriteService.js";
import { FeedbackService } from "@shared/services/feedback/FeedbackService.js";
import { Button, Chip, Screen, Section, TopBar } from "../../src/components/ui.js";
import { useLive } from "../../src/state/LiveSession.js";
import { useAppState } from "../../src/state/AppState.js";
import { exerciseOf, mediaUrl } from "../../src/catalog.js";
import { useStyles, useTheme } from "../../src/theme.js";

export default function ExerciseDetail() {
  const { colors } = useTheme();
  const styles = useStyles(styleFactory);
  const { id } = useLocalSearchParams();
  const { state, refresh } = useAppState();
  const { start } = useLive();
  const [tab, setTab] = useState("muscle");
  const [view, setView] = useState(() => exerciseOf(id));
  const [uri, setUri] = useState(() => mediaUrl(exerciseOf(id)));
  const catalog = ChestLibraryService.get(id);

  useEffect(() => {
    let live = true;
    const gender = state.profile && state.profile.gender;
    ensure(id, gender).then((next) => {
      if (!live || !next) return;
      setView(next);
      const fallback = mediaUrl(next, { preferGif: true });
      const q = next.originalName || next.sourceName || "";
      if (!q) {
        setUri(fallback);
        return;
      }
      fetchExerciseMedia(q, gender).then((media) => {
        if (!live) return;
        setUri(pickDetailUrl(media, fallback));
      });
    });
    return () => { live = false; };
  }, [id]);

  if (!catalog && !view) {
    return <Screen><TopBar title="Exercício" back /><Text style={{ color: colors.muted }}>Não encontrado.</Text></Screen>;
  }
  const name = (view && view.name) || (catalog && catalog.displayName) || String(id);
  const steps = catalog && catalog.instructions ? catalog.instructions.map((s) => s.text || s) : (view && view.steps) || [];
  const tips = (catalog && catalog.importantTips) || [];
  const startPos = (catalog && catalog.startingPosition) || (view && view.startingPosition) || "";
  const errors = (catalog && catalog.commonErrors) || (view && view.commonErrors) || [];
  const description = (catalog && catalog.description) || (view && view.description) || "";
  const equipment = (catalog && catalog.equipment) || (view && view.equipment) || "";
  const typeRaw = (catalog && catalog.exerciseType) || (view && view.exerciseType) || "";
  const type = { isolamento: "Isolamento", composto: "Composto" }[typeRaw] || typeRaw;
  const levelRaw = (catalog && catalog.level) || (view && view.level) || "";
  const level = { iniciante: "Iniciante", intermediario: "Intermediário", avancado: "Avançado" }[levelRaw] || levelRaw;
  const fav = FavoriteService.has(id);
  const fb = FeedbackService.get(id);

  function begin() {
    const e = view || { id, sets: 3, reps: 12, kg: 0, rest: 60, name };
    const live = start(name, [{ id: e.id, sets: e.sets, reps: e.reps, kg: e.kg, rest: e.rest }], { sourceType: "single", sourceId: e.id });
    if (live) router.push("/session");
  }

  return (
    <Screen>
      <TopBar title={name} back />
      {uri ? (
        <Image
          source={{ uri }}
          style={styles.gif}
          contentFit="contain"
          cachePolicy="memory-disk"
          autoplay
        />
      ) : null}
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
          <Text style={styles.p}>{(catalog && catalog.primaryMuscle) || (view && (view.bodyPart || view.muscle))}</Text>
          <Section>Secundários</Section>
          <Text style={styles.p}>{(catalog ? catalog.secondaryMuscles : view && view.secondary || []).join(", ") || "—"}</Text>
          {equipment ? <><Section>Equipamento</Section><Text style={styles.p}>{equipment}</Text></> : null}
          {type ? <><Section>Tipo de exercício</Section><Text style={styles.p}>{type}</Text></> : null}
          {level ? <><Section>Nível</Section><Text style={styles.p}>{level}</Text></> : null}
        </>
      ) : (
        <>
          {description ? <><Section>Descrição</Section><Text style={styles.p}>{description}</Text></> : null}
          {startPos ? <><Section>Posição inicial</Section><Text style={styles.p}>{startPos}</Text></> : null}
          {steps.length ? <Section>Execução</Section> : null}
          {steps.map((s, i) => <Text key={i} style={styles.p}>{i + 1}. {s}</Text>)}
          {errors.length ? <Section>Erros comuns</Section> : null}
          {errors.map((t, i) => <Text key={i} style={styles.p}>• {t.text || t}</Text>)}
          {tips.length ? <Section>Dicas</Section> : null}
          {tips.map((t, i) => <Text key={i} style={styles.p}>• {t.text || t}</Text>)}
        </>
      )}
      <Button label="Treinar este exercício" onPress={begin} />
    </Screen>
  );
}

function styleFactory(c) {
  return {
  gif: { width: "100%", height: 240, backgroundColor: c.surface, borderRadius: 16 },
  p: { color: c.muted2, lineHeight: 22, marginBottom: 8 }
};
}

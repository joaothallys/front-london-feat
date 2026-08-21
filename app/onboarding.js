import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Button, Field, Kicker, Screen, Title } from "../src/components/ui.js";
import { useAppState } from "../src/state/AppState.js";
import { colors } from "../src/theme.js";

const GOALS = [
  ["hipertrofia", "Hipertrofia", "Ganhar massa muscular"],
  ["forca", "Força", "Levantar mais carga"],
  ["emagrecimento", "Emagrecimento", "Perder gordura com treino"],
  ["definicao", "Definição", "Manter músculo e secar"]
];
const LEVELS = [
  ["iniciante", "Iniciante", "Até 6 meses de academia"],
  ["intermediario", "Intermediário", "Já treina com consistência"],
  ["avancado", "Avançado", "Periodização e cargas altas"]
];
const GENDERS = [
  ["homem", "Homem", "Masculino"],
  ["mulher", "Mulher", "Feminino"]
];
const DAYS = [
  [3, "3 dias", "ABC clássico"],
  [4, "4 dias", "Upper / lower ou ABCD"],
  [5, "5 dias", "Mais volume na semana"],
  [6, "6 dias", "Push Pull Legs"]
];

export default function Onboarding() {
  const { state, refresh } = useAppState();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(state.profile.name || "");
  const [gender, setGender] = useState(state.profile.gender === "male" ? "homem" : state.profile.gender === "female" ? "mulher" : (state.profile.gender || ""));
  const [goal, setGoal] = useState("hipertrofia");
  const [level, setLevel] = useState("intermediario");
  const [days, setDays] = useState(4);

  function finish() {
    state.profile.name = name;
    state.profile.gender = gender;
    state.profile.goal = goal;
    state.profile.level = level;
    state.profile.days = days;
    state.member.name = name;
    refresh();
    router.replace("/ai");
  }

  return (
    <Screen noNav>
      <View style={styles.dots}>
        {[0, 1, 2, 3, 4].map((i) => <View key={i} style={[styles.dot, i <= step && styles.dotOn]} />)}
      </View>
      <Kicker>Plano com IA</Kicker>
      {step === 0 ? (
        <>
          <Title>Como podemos te chamar?</Title>
          <Field label="Nome" value={name} onChangeText={setName} autoCapitalize="words" />
        </>
      ) : null}
      {step === 1 ? (
        <>
          <Title>Você é homem ou mulher?</Title>
          {GENDERS.map(([v, t, d]) => (
            <Choice key={v} title={t} desc={d} on={gender === v} onPress={() => setGender(v)} />
          ))}
        </>
      ) : null}
      {step === 2 ? (
        <>
          <Title>Qual é o seu objetivo?</Title>
          {GOALS.map(([v, t, d]) => (
            <Choice key={v} title={t} desc={d} on={goal === v} onPress={() => setGoal(v)} />
          ))}
        </>
      ) : null}
      {step === 3 ? (
        <>
          <Title>Qual é o seu nível?</Title>
          {LEVELS.map(([v, t, d]) => (
            <Choice key={v} title={t} desc={d} on={level === v} onPress={() => setLevel(v)} />
          ))}
        </>
      ) : null}
      {step === 4 ? (
        <>
          <Title>Quantos dias por semana?</Title>
          {DAYS.map(([v, t, d]) => (
            <Choice key={v} title={t} desc={d} on={days === v} onPress={() => setDays(v)} />
          ))}
        </>
      ) : null}
      <Button
        label={step === 4 ? "Gerar meu plano" : "Continuar"}
        disabled={step === 1 && !gender}
        onPress={() => (step < 4 ? setStep(step + 1) : finish())}
      />
      {step ? <Button ghost label="Voltar" onPress={() => setStep(step - 1)} /> : null}
    </Screen>
  );
}

function Choice({ title, desc, on, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.choice, on && styles.choiceOn]}>
      <Text style={styles.choiceT}>{title}</Text>
      <Text style={styles.choiceD}>{desc}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dots: { flexDirection: "row", gap: 6, marginBottom: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.line },
  dotOn: { backgroundColor: colors.red },
  choice: { backgroundColor: colors.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.line, marginBottom: 8 },
  choiceOn: { borderColor: colors.red, backgroundColor: colors.redSoft },
  choiceT: { color: colors.text, fontWeight: "800", fontSize: 16 },
  choiceD: { color: colors.muted, marginTop: 4 }
});

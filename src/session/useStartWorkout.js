import { useCallback } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { useLive } from "../state/LiveSession.js";

// Inicia um treino sem atropelar o que já está em andamento.
export function useStartWorkout() {
  const { live, start, quit } = useLive();
  return useCallback((name, items, meta) => {
    const go = () => {
      const next = start(name, items || [], meta);
      if (next) router.push("/session");
      else Alert.alert("Nada para treinar", "Adicione exercícios antes de começar.");
    };
    if (!live) {
      go();
      return;
    }
    Alert.alert("Treino em andamento", "Você já começou \"" + (live.name || "Treino") + "\". O que quer fazer?", [
      { text: "Continuar o atual", onPress: () => router.push("/session") },
      { text: "Descartar e começar", style: "destructive", onPress: () => { quit(); go(); } },
      { text: "Cancelar", style: "cancel" }
    ]);
  }, [live, start, quit]);
}

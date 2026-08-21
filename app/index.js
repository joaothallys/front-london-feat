import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../src/components/ui.js";
import { useAppState } from "../src/state/AppState.js";
import { colors } from "../src/theme.js";

export default function Splash() {
  const { state } = useAppState();
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.82)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 6.2, useNativeDriver: true })
    ]).start();
  }, [opacity, scale]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Animated.Image
          source={require("../assets/logo.png")}
          style={[styles.logo, { opacity, transform: [{ scale }] }]}
        />
        <Text style={styles.h1}>ACADEMIA{"\n"}LONDON{"\n"}<Text style={styles.red}>FITNESS</Text></Text>
        <Text style={styles.p}>Treino, matrícula e evolução. Feito para a sua academia.</Text>
      </View>
      <Button
        label="Começar"
        onPress={() => {
          if (state.session && state.onboardingDone) router.replace("/(tabs)/home");
          else if (state.session) router.replace("/onboarding");
          else router.push("/login");
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#000000", padding: 24, justifyContent: "space-between" },
  center: { alignItems: "center", marginTop: 48 },
  logo: { width: 140, height: 140, borderRadius: 32, marginBottom: 20 },
  h1: { color: colors.text, fontSize: 40, fontWeight: "800", textAlign: "center", letterSpacing: 1, lineHeight: 44 },
  red: { color: colors.red },
  p: { color: colors.muted, textAlign: "center", marginTop: 16, fontSize: 15, lineHeight: 22 }
});

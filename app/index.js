import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../src/components/ui.js";
import { useAppState } from "../src/state/AppState.js";
import { useStyles, useTheme } from "../src/theme.js";

export default function Splash() {
  const { colors } = useTheme();
  const styles = useStyles(styleFactory);
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

function styleFactory(c) {
  return {
  safe: { flex: 1, backgroundColor: c.bg, padding: 24, justifyContent: "space-between" },
  center: { alignItems: "center", marginTop: 48 },
  logo: { width: 140, height: 140, borderRadius: 32, marginBottom: 20 },
  h1: { color: c.text, fontSize: 40, fontWeight: "800", textAlign: "center", letterSpacing: 1, lineHeight: 44 },
  red: { color: c.red },
  p: { color: c.muted, textAlign: "center", marginTop: 16, fontSize: 15, lineHeight: 22 }
};
}

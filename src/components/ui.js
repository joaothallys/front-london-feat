import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors } from "../theme.js";
import { HapticPressable } from "./HapticPressable.js";

export function Screen({ children, padded = true, noNav = false }) {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          padded && styles.pad,
          { paddingBottom: noNav ? 32 : 108 }
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function TopBar({ title, back }) {
  return (
    <View style={styles.top}>
      {back ? (
        <HapticPressable onPress={() => (typeof back === "string" ? router.push(back) : router.back())} style={styles.back}>
          <Text style={styles.backTxt}>‹</Text>
        </HapticPressable>
      ) : null}
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

export function Title({ children }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Muted({ children, style }) {
  return <Text style={[styles.muted, style]}>{children}</Text>;
}

export function Kicker({ children }) {
  return <Text style={styles.kicker}>{children}</Text>;
}

export function Section({ children }) {
  return <Text style={styles.section}>{children}</Text>;
}

export function Button({ label, onPress, ghost, danger, disabled, block = true }) {
  return (
    <HapticPressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.btn,
        block && styles.block,
        ghost && styles.ghost,
        danger && styles.dangerBtn,
        disabled && styles.disabled
      ]}
    >
      <Text style={[styles.btnTxt, ghost && styles.ghostTxt, danger && styles.dangerTxt]}>{label}</Text>
    </HapticPressable>
  );
}

export function Field({ label, ...props }) {
  return (
    <View style={styles.field}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.muted}
        style={styles.input}
        autoCapitalize="none"
        {...props}
      />
    </View>
  );
}

export function Chip({ label, on, onPress }) {
  return (
    <HapticPressable onPress={onPress} style={[styles.chip, on && styles.chipOn]}>
      <Text style={[styles.chipTxt, on && styles.chipTxtOn]}>{label}</Text>
    </HapticPressable>
  );
}

export function Card({ children, onPress }) {
  const inner = <View style={styles.card}>{children}</View>;
  if (!onPress) return inner;
  return <HapticPressable onPress={onPress}>{inner}</HapticPressable>;
}

export function Row({ title, subtitle, onPress, right, thumb }) {
  const body = (
    <View style={styles.row}>
      {thumb}
      <View style={styles.grow}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSub}>{subtitle}</Text> : null}
      </View>
      {right || <Text style={styles.chev}>›</Text>}
    </View>
  );
  if (!onPress) return body;
  return <HapticPressable onPress={onPress}>{body}</HapticPressable>;
}

export function Empty({ children }) {
  return <View style={styles.empty}><Text style={styles.muted}>{children}</Text></View>;
}

export function Busy() {
  return <ActivityIndicator color={colors.red} style={{ marginVertical: 24 }} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  pad: { paddingHorizontal: 16, paddingTop: 8 },
  top: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  back: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  backTxt: { color: colors.text, fontSize: 28, marginTop: -4 },
  title: { color: colors.text, fontSize: 26, fontWeight: "800", letterSpacing: 0.6, textTransform: "uppercase", flex: 1 },
  muted: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  kicker: { color: colors.red, fontSize: 12, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 },
  section: { color: colors.muted2, fontSize: 13, fontWeight: "700", marginTop: 18, marginBottom: 10, textTransform: "uppercase" },
  btn: { backgroundColor: colors.red, borderRadius: 14, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  block: { alignSelf: "stretch" },
  ghost: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.line },
  dangerBtn: {},
  disabled: { opacity: 0.5 },
  btnTxt: { color: colors.text, fontWeight: "800", fontSize: 16 },
  ghostTxt: { color: colors.text },
  dangerTxt: { color: colors.red },
  field: { marginBottom: 12 },
  label: { color: colors.muted, fontSize: 12, fontWeight: "600", marginBottom: 6 },
  input: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.line, color: colors.text, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, marginRight: 8, marginBottom: 8 },
  chipOn: { backgroundColor: colors.redSoft, borderColor: colors.red },
  chipTxt: { color: colors.muted2, fontWeight: "600" },
  chipTxtOn: { color: colors.text },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: colors.line, marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.surface, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: colors.line, marginBottom: 8 },
  grow: { flex: 1 },
  rowTitle: { color: colors.text, fontWeight: "700", fontSize: 15 },
  rowSub: { color: colors.muted, fontSize: 12, marginTop: 2 },
  chev: { color: colors.muted, fontSize: 22 },
  empty: { padding: 24, alignItems: "center" }
});

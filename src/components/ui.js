import React from "react";
import { ActivityIndicator, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useStyles, useTheme } from "../theme.js";
import { HapticPressable } from "./HapticPressable.js";

function styleFactory(c) {
  return {
    safe: { flex: 1, backgroundColor: c.bg },
    flex: { flex: 1 },
    pad: { paddingHorizontal: 16, paddingTop: 8 },
    top: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
    topStack: { marginBottom: 18 },
    topRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
    back: { width: 40, height: 40, borderRadius: 12, backgroundColor: c.surface, alignItems: "center", justifyContent: "center" },
    backTxt: { color: c.text, fontSize: 28, marginTop: -4 },
    title: { color: c.text, fontSize: 22, fontWeight: "800", letterSpacing: 0.4, textTransform: "uppercase", flex: 1 },
    titleStack: { color: c.text, fontSize: 28, fontWeight: "800", letterSpacing: 0.4, textTransform: "uppercase", lineHeight: 34 },
    muted: { color: c.muted, fontSize: 14, lineHeight: 20 },
    kicker: { color: c.red, fontSize: 12, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 },
    section: { color: c.muted2, fontSize: 13, fontWeight: "700", marginTop: 18, marginBottom: 10, textTransform: "uppercase" },
    btn: { backgroundColor: c.red, borderRadius: 14, paddingVertical: 14, alignItems: "center", marginTop: 8 },
    block: { alignSelf: "stretch" },
    ghost: { backgroundColor: "transparent", borderWidth: 1, borderColor: c.line },
    dangerBtn: {},
    disabled: { opacity: 0.5 },
    btnTxt: { color: "#ffffff", fontWeight: "800", fontSize: 16 },
    ghostTxt: { color: c.text },
    dangerTxt: { color: c.red },
    field: { marginBottom: 12 },
    label: { color: c.muted, fontSize: 12, fontWeight: "600", marginBottom: 6 },
    input: { backgroundColor: c.surface, borderRadius: 12, borderWidth: 1, borderColor: c.line, color: c.text, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
    chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, marginRight: 8, marginBottom: 8 },
    chipOn: { backgroundColor: c.redSoft, borderColor: c.red },
    chipTxt: { color: c.muted2, fontWeight: "600" },
    chipTxtOn: { color: c.text },
    card: { backgroundColor: c.surface, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: c.line, marginBottom: 10 },
    row: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: c.surface, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: c.line, marginBottom: 8 },
    rowMain: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
    grow: { flex: 1 },
    rowTitle: { color: c.text, fontWeight: "700", fontSize: 15 },
    rowSub: { color: c.muted, fontSize: 12, marginTop: 2 },
    chev: { color: c.muted, fontSize: 22 },
    empty: { padding: 24, alignItems: "center" }
  };
}

export function Screen({ children, padded = true, noNav = false }) {
  const styles = useStyles(styleFactory);
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

export function TopBar({ title, back, right, stacked }) {
  const styles = useStyles(styleFactory);
  const goBack = () => (typeof back === "string" ? router.push(back) : router.back());
  const backBtn = back ? (
    <HapticPressable onPress={goBack} style={styles.back}>
      <Text style={styles.backTxt}>‹</Text>
    </HapticPressable>
  ) : null;
  if (stacked) {
    return (
      <View style={styles.topStack}>
        <View style={styles.topRow}>
          {backBtn}
          <View style={{ flex: 1 }} />
          {right || null}
        </View>
        <Text style={styles.titleStack}>{title}</Text>
      </View>
    );
  }
  return (
    <View style={styles.top}>
      {backBtn}
      <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{title}</Text>
      {right || null}
    </View>
  );
}

export function Title({ children, style }) {
  const styles = useStyles(styleFactory);
  return <Text style={[styles.title, style]}>{children}</Text>;
}

export function Muted({ children, style }) {
  const styles = useStyles(styleFactory);
  return <Text style={[styles.muted, style]}>{children}</Text>;
}

export function Kicker({ children }) {
  const styles = useStyles(styleFactory);
  return <Text style={styles.kicker}>{children}</Text>;
}

export function Section({ children }) {
  const styles = useStyles(styleFactory);
  return <Text style={styles.section}>{children}</Text>;
}

export function Button({ label, onPress, ghost, danger, disabled, block = true }) {
  const styles = useStyles(styleFactory);
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
  const { colors } = useTheme();
  const styles = useStyles(styleFactory);
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
  const styles = useStyles(styleFactory);
  return (
    <HapticPressable onPress={onPress} style={[styles.chip, on && styles.chipOn]}>
      <Text style={[styles.chipTxt, on && styles.chipTxtOn]}>{label}</Text>
    </HapticPressable>
  );
}

export function Card({ children, onPress, style }) {
  const styles = useStyles(styleFactory);
  const inner = <View style={[styles.card, style]}>{children}</View>;
  if (!onPress) return inner;
  return <HapticPressable onPress={onPress}>{inner}</HapticPressable>;
}

export function Row({ title, subtitle, onPress, right, thumb }) {
  const styles = useStyles(styleFactory);
  const main = (
    <>
      {thumb}
      <View style={styles.grow}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSub}>{subtitle}</Text> : null}
      </View>
      {right ? null : <Text style={styles.chev}>›</Text>}
    </>
  );
  return (
    <View style={styles.row}>
      {onPress ? (
        <HapticPressable onPress={onPress} style={styles.rowMain}>{main}</HapticPressable>
      ) : (
        <View style={styles.rowMain}>{main}</View>
      )}
      {right || null}
    </View>
  );
}

export function Empty({ children }) {
  const styles = useStyles(styleFactory);
  return <View style={styles.empty}><Text style={styles.muted}>{children}</Text></View>;
}

export function Busy() {
  const { colors } = useTheme();
  return <ActivityIndicator color={colors.red} style={{ marginVertical: 24 }} />;
}

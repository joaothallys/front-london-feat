import React, { useEffect, useState } from "react";
import { InputAccessoryView, Keyboard, Platform, Text, TextInput, View } from "react-native";
import { HapticPressable } from "./HapticPressable.js";
import { useStyles, useTheme } from "../theme.js";

export const NUM_ACCESSORY_ID = "lumenfit-number-done";

export function clampKg(n) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(500, Math.round(n * 10) / 10));
}

export function clampReps(n) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(99, Math.round(n)));
}

function parseKg(text) {
  const n = Number(String(text || "0").replace(",", "."));
  return clampKg(n);
}

function parseReps(text) {
  return clampReps(parseInt(String(text || "0").replace(/\D/g, ""), 10));
}

export function NumberDoneBar() {
  const { colors } = useTheme();
  if (Platform.OS !== "ios") return null;
  return (
    <InputAccessoryView nativeID={NUM_ACCESSORY_ID}>
      <View style={{
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.line,
        paddingHorizontal: 16,
        paddingVertical: 8,
        alignItems: "flex-end"
      }}>
        <HapticPressable onPress={() => Keyboard.dismiss()}>
          <Text style={{ color: colors.red, fontWeight: "800", fontSize: 16 }}>Pronto</Text>
        </HapticPressable>
      </View>
    </InputAccessoryView>
  );
}

export function NumField({
  value,
  decimal,
  onCommit,
  onFocusChange,
  style,
  textStyle,
  activeStyle,
  autoFocus,
  commitOnChange
}) {
  const { colors, scheme } = useTheme();
  const [text, setText] = useState(() => String(value ?? 0));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(String(value ?? 0));
  }, [value, focused]);

  return (
    <TextInput
      value={focused ? text : String(value ?? 0)}
      autoFocus={autoFocus}
      keyboardType={decimal ? "decimal-pad" : "number-pad"}
      keyboardAppearance={scheme === "light" ? "light" : "dark"}
      inputAccessoryViewID={Platform.OS === "ios" ? NUM_ACCESSORY_ID : undefined}
      selectTextOnFocus
      returnKeyType="done"
      onSubmitEditing={() => Keyboard.dismiss()}
      onFocus={() => {
        setFocused(true);
        setText(String(value ?? 0));
        if (onFocusChange) onFocusChange();
      }}
      onBlur={() => {
        setFocused(false);
        onCommit(decimal ? parseKg(text) : parseReps(text));
      }}
      onChangeText={(raw) => {
        const next = decimal ? raw.replace(/[^0-9.,]/g, "") : raw.replace(/[^0-9]/g, "");
        setText(next);
        if (commitOnChange) onCommit(decimal ? parseKg(next) : parseReps(next));
      }}
      style={[style, textStyle, focused ? activeStyle : null, { color: colors.text }]}
    />
  );
}

export function NumberPad({ kg, reps, focus = "kg", onFocus, onChangeKg, onChangeReps }) {
  const styles = useStyles(styleFactory);

  return (
    <View>
      <View style={styles.fields}>
        <View style={styles.fieldWrap}>
          <Text style={[styles.fieldLbl, focus === "kg" && styles.fieldLblOn]}>kg</Text>
          <NumField
            value={kg}
            decimal
            autoFocus={focus === "kg"}
            commitOnChange
            onCommit={onChangeKg}
            onFocusChange={() => onFocus && onFocus("kg")}
            style={[styles.field, focus === "kg" && styles.fieldOn]}
            textStyle={styles.fieldVal}
            activeStyle={styles.fieldOn}
          />
        </View>
        <View style={styles.fieldWrap}>
          <Text style={[styles.fieldLbl, focus === "reps" && styles.fieldLblOn]}>Reps</Text>
          <NumField
            value={reps}
            autoFocus={focus === "reps"}
            commitOnChange
            onCommit={onChangeReps}
            onFocusChange={() => onFocus && onFocus("reps")}
            style={[styles.field, focus === "reps" && styles.fieldOn]}
            textStyle={styles.fieldVal}
            activeStyle={styles.fieldOn}
          />
        </View>
      </View>
      <NumberDoneBar />
    </View>
  );
}

function styleFactory(c) {
  return {
    fields: { flexDirection: "row", gap: 10, marginBottom: 8 },
    fieldWrap: { flex: 1 },
    field: {
      backgroundColor: c.surface,
      borderRadius: 16,
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: "transparent",
      textAlign: "center"
    },
    fieldOn: { borderColor: c.red, backgroundColor: c.redSoft },
    fieldLbl: {
      color: c.muted,
      fontWeight: "700",
      fontSize: 11,
      letterSpacing: 0.6,
      textTransform: "uppercase",
      marginBottom: 6,
      textAlign: "center"
    },
    fieldLblOn: { color: c.red },
    fieldVal: { color: c.text, fontWeight: "800", fontSize: 32, textAlign: "center" }
  };
}

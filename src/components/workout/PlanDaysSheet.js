import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { HapticPressable } from "../HapticPressable.js";
import { useStyles, useTheme } from "../../theme.js";
import { MAX_PLAN_DAYS, WEEKDAY_LABEL, WEEKDAY_ORDER, normalizeWeekdays } from "@shared/domain/weekdays.js";

export function PlanDaysSheet({ visible, days, onClose, onSave }) {
  const { colors } = useTheme();
  const styles = useStyles(styleFactory);
  const { height } = useWindowDimensions();
  const [draft, setDraft] = useState([]);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (visible && !wasOpen.current) {
      setDraft((days || []).map((day) => ({
        id: day.id || null,
        name: day.name || "",
        weekdays: normalizeWeekdays(day.weekdays),
        focus: day.focus || [],
        items: day.items || []
      })));
    }
    wasOpen.current = !!visible;
  }, [visible, days]);

  function patch(index, next) {
    setDraft((cur) => cur.map((day, i) => (i === index ? Object.assign({}, day, next) : day)));
  }

  function toggleWeekday(index, id) {
    const day = draft[index];
    if (!day) return;
    const has = day.weekdays.indexOf(id) >= 0;
    patch(index, {
      weekdays: has ? day.weekdays.filter((value) => value !== id) : day.weekdays.concat(id)
    });
  }

  function addDay() {
    if (draft.length >= MAX_PLAN_DAYS) return;
    setDraft((cur) => cur.concat([{ id: null, name: "", weekdays: [], focus: [], items: [] }]));
  }

  function removeDay(index) {
    if (draft.length <= 1) {
      Alert.alert("Manter um dia", "O plano precisa de pelo menos um dia.");
      return;
    }
    const day = draft[index];
    const drop = () => setDraft((cur) => cur.filter((_, i) => i !== index));
    if (day && day.items && day.items.length) {
      Alert.alert("Tirar este dia?", "Os exercícios deste dia saem do plano.", [
        { text: "Cancelar", style: "cancel" },
        { text: "Tirar", style: "destructive", onPress: drop }
      ]);
      return;
    }
    drop();
  }

  return (
    <Modal visible={!!visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.modal} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <Pressable style={styles.dim} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle}>
            <View style={styles.grabber} />
          </View>
          <View style={styles.head}>
            <View style={styles.grow}>
              <Text style={styles.title}>Dias de treino</Text>
              <Text style={styles.hint}>Mude o nome e marque só os dias da semana em que você treina.</Text>
            </View>
            <HapticPressable onPress={() => { if (draft.length) onSave(draft); }} hitSlop={10} disabled={!draft.length}>
              <Text style={styles.done}>Salvar</Text>
            </HapticPressable>
          </View>
          <ScrollView
            style={[styles.scroll, { maxHeight: Math.round(height * 0.62) }]}
            contentContainerStyle={styles.scrollPad}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {draft.map((day, index) => (
              <View key={(day.id || "novo") + "-" + index} style={styles.card}>
                <View style={styles.cardHead}>
                  <Text style={styles.kicker}>DIA {index + 1}</Text>
                  <HapticPressable
                    onPress={() => removeDay(index)}
                    hitSlop={8}
                    accessibilityLabel={"Remover dia " + (index + 1)}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </HapticPressable>
                </View>
                <TextInput
                  value={day.name}
                  onChangeText={(name) => patch(index, { name })}
                  placeholder="Peito, pernas, full body"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  autoCapitalize="sentences"
                  autoCorrect={false}
                />
                <Text style={styles.field}>Dias da semana</Text>
                <View style={styles.weekRow}>
                  {WEEKDAY_ORDER.map((id) => {
                    const on = day.weekdays.indexOf(id) >= 0;
                    return (
                      <HapticPressable
                        key={id}
                        style={[styles.week, on && styles.weekOn]}
                        onPress={() => toggleWeekday(index, id)}
                      >
                        <Text style={[styles.weekTxt, on && styles.weekTxtOn]}>{WEEKDAY_LABEL[id]}</Text>
                      </HapticPressable>
                    );
                  })}
                </View>
                {day.weekdays.length ? null : (
                  <Text style={styles.note}>Sem dia marcado, continua como Dia {index + 1}.</Text>
                )}
              </View>
            ))}
            {draft.length < MAX_PLAN_DAYS ? (
              <HapticPressable style={styles.add} onPress={addDay}>
                <Ionicons name="add" size={18} color={colors.text} />
                <Text style={styles.addTxt}>Adicionar dia</Text>
              </HapticPressable>
            ) : (
              <Text style={styles.note}>Sete dias é o máximo.</Text>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function styleFactory(c) {
  return {
    modal: { flex: 1, justifyContent: "flex-end" },
    dim: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(0,0,0,0.55)" },
    sheet: { backgroundColor: c.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "86%", paddingBottom: 18 },
    handle: { alignItems: "center", paddingTop: 10, paddingBottom: 6 },
    grabber: { width: 40, height: 5, borderRadius: 3, backgroundColor: c.line },
    head: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingHorizontal: 18, paddingBottom: 12 },
    grow: { flex: 1 },
    title: { color: c.text, fontSize: 18, fontWeight: "800" },
    hint: { color: c.muted, fontSize: 13, lineHeight: 18, marginTop: 4 },
    done: { color: c.red, fontWeight: "800", fontSize: 16, paddingTop: 2 },
    scroll: { flexGrow: 0 },
    scrollPad: { paddingHorizontal: 18, paddingBottom: 12 },
    card: { backgroundColor: c.surface, borderRadius: 18, padding: 14, marginBottom: 10 },
    cardHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
    kicker: { color: c.muted, fontSize: 11, fontWeight: "800", letterSpacing: 0.6 },
    input: { backgroundColor: c.surface2, borderRadius: 12, color: c.text, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, fontWeight: "700" },
    field: { color: c.muted, fontSize: 12, fontWeight: "700", marginTop: 12, marginBottom: 8 },
    weekRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    week: { minWidth: 46, height: 34, paddingHorizontal: 10, borderRadius: 17, backgroundColor: c.surface2, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "transparent" },
    weekOn: { backgroundColor: c.redSoft, borderColor: c.red },
    weekTxt: { color: c.muted, fontWeight: "700", fontSize: 13 },
    weekTxtOn: { color: c.text },
    note: { color: c.muted, fontSize: 12, marginTop: 8 },
    add: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: c.surface, borderRadius: 16, minHeight: 48, marginTop: 2 },
    addTxt: { color: c.text, fontWeight: "700", fontSize: 15 }
  };
}

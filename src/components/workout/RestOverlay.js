import React from "react";
import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Button } from "../ui.js";
import { HapticPressable } from "../HapticPressable.js";
import { useStyles, useTheme } from "../../theme.js";
import { formatRest, restLeft, restProgress } from "../../session/restClock.js";

export function RestOverlay({ rest, onSkip, onNext, hasNext, exerciseName, minimized, onMinimize, onExpand }) {
  const { colors } = useTheme();
  const styles = useStyles(styleFactory);
  const left = restLeft(rest);
  const progress = restProgress(rest);

  if (minimized) {
    return (
      <View style={styles.miniWrap} pointerEvents="box-none">
        <HapticPressable
          style={styles.miniBar}
          onPress={onExpand}
          accessibilityRole="button"
          accessibilityLabel="Expandir intervalo"
        >
          <RestRing size={36} stroke={4} progress={progress} track={colors.line} tint={colors.red} />
          <View style={styles.miniMeta}>
            <Text style={styles.miniKicker}>Intervalo</Text>
            <Text style={styles.miniTime}>{formatRest(left)}</Text>
          </View>
          <Ionicons name="chevron-up" size={16} color={colors.muted} />
        </HapticPressable>
      </View>
    );
  }

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={styles.card}>
        <HapticPressable
          style={styles.collapse}
          onPress={onMinimize}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Minimizar intervalo"
        >
          <Ionicons name="chevron-down" size={22} color={colors.muted} />
        </HapticPressable>
        <Text style={styles.kicker}>Intervalo</Text>
        <Text style={styles.exercise} numberOfLines={1}>{exerciseName}</Text>
        <View style={styles.ring}>
          <RestRing size={176} stroke={9} progress={progress} track={colors.line} tint={colors.red} />
          <View style={styles.clock}>
            <Text style={styles.time}>{formatRest(left)}</Text>
            <Text style={styles.hint}>restante</Text>
          </View>
        </View>
        <View style={styles.actions}>
          <HapticPressable style={styles.skip} onPress={onSkip}>
            <Text style={styles.skipTxt}>Pular intervalo</Text>
          </HapticPressable>
          {hasNext ? <Button label="Próximo exercício" onPress={onNext} /> : null}
        </View>
      </View>
    </View>
  );
}

function RestRing({ size, stroke, progress, track, tint }) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - progress);
  return (
    <Svg width={size} height={size}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={track}
        strokeWidth={stroke}
        fill="none"
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={tint}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={String(circ)}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={"rotate(-90 " + (size / 2) + " " + (size / 2) + ")"}
      />
    </Svg>
  );
}

function styleFactory(c) {
  return {
    wrap: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 16 },
    card: {
      backgroundColor: c.surface,
      borderRadius: 28,
      paddingTop: 18,
      paddingHorizontal: 20,
      paddingBottom: 16,
      alignItems: "center",
      borderWidth: 1,
      borderColor: c.line
    },
    collapse: {
      position: "absolute",
      top: 10,
      right: 12,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: c.surface2,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2
    },
    kicker: { color: c.red, fontSize: 11, fontWeight: "800", letterSpacing: 1.6, textTransform: "uppercase" },
    exercise: { color: c.muted2, fontSize: 14, fontWeight: "600", marginTop: 4, marginBottom: 8 },
    ring: { width: 176, height: 176, alignItems: "center", justifyContent: "center" },
    clock: { position: "absolute", alignItems: "center" },
    time: { color: c.text, fontSize: 48, fontWeight: "800", fontVariant: ["tabular-nums"], letterSpacing: -1 },
    hint: { color: c.muted, fontSize: 12, fontWeight: "600", marginTop: -4 },
    actions: { alignSelf: "stretch", marginTop: 8, gap: 8 },
    skip: { alignItems: "center", paddingVertical: 10 },
    skipTxt: { color: c.muted2, fontWeight: "700" },
    miniWrap: { position: "absolute", right: 16, bottom: 16 },
    miniBar: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: c.surface,
      borderRadius: 22,
      paddingVertical: 8,
      paddingLeft: 8,
      paddingRight: 12,
      borderWidth: 1,
      borderColor: c.line,
      shadowColor: "#000",
      shadowOpacity: 0.35,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 8
    },
    miniMeta: { minWidth: 72 },
    miniKicker: { color: c.red, fontSize: 9, fontWeight: "800", letterSpacing: 1.1, textTransform: "uppercase" },
    miniTime: { color: c.text, fontSize: 20, fontWeight: "800", fontVariant: ["tabular-nums"], marginTop: 1 }
  };
}

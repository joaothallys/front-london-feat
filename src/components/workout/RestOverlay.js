import React from "react";
import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Button } from "../ui.js";
import { HapticPressable } from "../HapticPressable.js";
import { useStyles, useTheme } from "../../theme.js";
import { formatRest, restLeft, restProgress } from "../../session/restClock.js";

export function RestOverlay({ rest, onSkip, onNext, hasNext, exerciseName }) {
  const { colors } = useTheme();
  const styles = useStyles(styleFactory);
  const left = restLeft(rest);
  const progress = restProgress(rest);
  const size = 176;
  const stroke = 9;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - progress);

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={styles.card}>
        <Text style={styles.kicker}>Intervalo</Text>
        <Text style={styles.exercise} numberOfLines={1}>{exerciseName}</Text>
        <View style={styles.ring}>
          <Svg width={size} height={size}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={colors.line}
              strokeWidth={stroke}
              fill="none"
            />
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={colors.red}
              strokeWidth={stroke}
              fill="none"
              strokeDasharray={String(circ)}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform={"rotate(-90 " + (size / 2) + " " + (size / 2) + ")"}
            />
          </Svg>
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
    kicker: { color: c.red, fontSize: 11, fontWeight: "800", letterSpacing: 1.6, textTransform: "uppercase" },
    exercise: { color: c.muted2, fontSize: 14, fontWeight: "600", marginTop: 4, marginBottom: 8 },
    ring: { width: 176, height: 176, alignItems: "center", justifyContent: "center" },
    clock: { position: "absolute", alignItems: "center" },
    time: { color: c.text, fontSize: 48, fontWeight: "800", fontVariant: ["tabular-nums"], letterSpacing: -1 },
    hint: { color: c.muted, fontSize: 12, fontWeight: "600", marginTop: -4 },
    actions: { alignSelf: "stretch", marginTop: 8, gap: 8 },
    skip: { alignItems: "center", paddingVertical: 10 },
    skipTxt: { color: c.muted2, fontWeight: "700" }
  };
}

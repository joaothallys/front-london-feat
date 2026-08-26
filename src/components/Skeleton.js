import { Animated, StyleSheet, View } from "react-native";
import React, { useEffect, useRef } from "react";
import { useStyles, useTheme } from "../theme.js";

export function Skeleton({ width, height, radius = 8, style }) {
  const { colors } = useTheme();
  const styles = useStyles(styleFactory);
  const opacity = useRef(new Animated.Value(0.35)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(opacity, { toValue: 0.85, duration: 650, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0.35, duration: 650, useNativeDriver: true })
    ]));
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return (
    <Animated.View
      style={[
        styles.block,
        { width, height, borderRadius: radius, opacity },
        style
      ]}
    />
  );
}

export function ExerciseSkeleton() {
  const { colors } = useTheme();
  const styles = useStyles(styleFactory);
  return (
    <View style={styles.row}>
      <Skeleton width={64} height={64} radius={12} />
      <View style={styles.grow}>
        <Skeleton width="74%" height={14} radius={6} />
        <Skeleton width="42%" height={10} radius={6} style={{ marginTop: 10 }} />
      </View>
      <Skeleton width={24} height={24} radius={12} />
    </View>
  );
}

export function ExerciseSkeletonList({ count = 8 }) {
  const { colors } = useTheme();
  const styles = useStyles(styleFactory);
  const items = [];
  for (let i = 0; i < count; i += 1) items.push(<ExerciseSkeleton key={i} />);
  return <View>{items}</View>;
}

function styleFactory(c) {
  return {
  block: { backgroundColor: c.surface3 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  grow: { flex: 1 }
};
}

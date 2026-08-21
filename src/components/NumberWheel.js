import React, { useEffect, useMemo, useRef } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme.js";

const ITEM_H = 40;
const VISIBLE = 5;

function range(min, max, step) {
  const out = [];
  const n = Math.round((max - min) / step);
  for (let i = 0; i <= n; i += 1) {
    out.push(Math.round((min + i * step) * 10) / 10);
  }
  return out;
}

function nearestIndex(values, value) {
  let best = 0;
  let dist = Infinity;
  values.forEach((v, i) => {
    const d = Math.abs(v - value);
    if (d < dist) {
      dist = d;
      best = i;
    }
  });
  return best;
}

function format(value) {
  return Number.isInteger(value) ? String(value) : String(value);
}

export function NumberWheel({ value, min, max, step = 1, onChange }) {
  const values = useMemo(() => range(min, max, step), [min, max, step]);
  const ref = useRef(null);
  const pad = ITEM_H * Math.floor(VISIBLE / 2);

  useEffect(() => {
    const i = nearestIndex(values, Number(value) || 0);
    const node = ref.current;
    if (!node) return;
    requestAnimationFrame(() => {
      node.scrollTo({ y: i * ITEM_H, animated: false });
    });
  }, []);

  function commit(y) {
    const i = Math.max(0, Math.min(values.length - 1, Math.round(y / ITEM_H)));
    const next = values[i];
    if (next !== value) onChange(next);
  }

  return (
    <View style={styles.box}>
      <View pointerEvents="none" style={styles.hi} />
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        nestedScrollEnabled
        contentContainerStyle={{ paddingVertical: pad }}
        onMomentumScrollEnd={(ev) => commit(ev.nativeEvent.contentOffset.y)}
        onScrollEndDrag={(ev) => commit(ev.nativeEvent.contentOffset.y)}
      >
        {values.map((n) => (
          <View key={String(n)} style={styles.item}>
            <Text style={[styles.txt, Math.abs(n - value) < 0.001 && styles.txtOn]}>{format(n)}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { height: ITEM_H * VISIBLE, overflow: "hidden" },
  hi: {
    position: "absolute",
    left: 8,
    right: 8,
    top: ITEM_H * Math.floor(VISIBLE / 2),
    height: ITEM_H,
    borderRadius: 12,
    backgroundColor: colors.surface3,
    zIndex: 0
  },
  item: { height: ITEM_H, alignItems: "center", justifyContent: "center", zIndex: 1 },
  txt: { color: colors.muted, fontSize: 20, fontWeight: "600" },
  txtOn: { color: colors.text, fontWeight: "800", fontSize: 24 }
});

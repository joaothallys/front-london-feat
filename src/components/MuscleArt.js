import React from "react";
import { View } from "react-native";
import Svg, { Polygon } from "react-native-svg";
import { useStyles, useTheme } from "../theme.js";
import { ANTERIOR, POSTERIOR, FOCUS } from "./muscleMapData.js";
import { muscleArt } from "@shared/domain/muscle-art.js";

function toPoints(raw) {
  const n = String(raw || "").trim().split(/\s+/);
  const out = [];
  for (let i = 0; i + 1 < n.length; i += 2) out.push(n[i] + "," + n[i + 1]);
  return out.join(" ");
}

export function MuscleArt({ id, width = 88, height = 88, compact }) {
  const { colors, scheme } = useTheme();
  const styles = useStyles(styleFactory);
  const art = muscleArt(id);
  const focus = (art && FOCUS[art.id]) || FOCUS.peito;
  const groups = focus.view === "back" ? POSTERIOR : ANTERIOR;
  const body = scheme === "light" ? "#c8d2d5" : "#3a4e53";
  const hot = colors.red;
  const viewBox = compact && focus.crop
    ? focus.crop
    : (focus.view === "back" ? "0 0 100 220" : "0 0 100 200");

  return (
    <View style={[styles.box, { width, height }]}>
      <Svg width="100%" height="100%" viewBox={viewBox} preserveAspectRatio="xMidYMid meet">
        {groups.map((group) => {
          const fill = focus.hot[group.muscle] ? hot : body;
          return group.points.map((pts, i) => (
            <Polygon
              key={group.muscle + "-" + i}
              points={toPoints(pts)}
              fill={fill}
              stroke={scheme === "light" ? "#eef2f3" : "#001013"}
              strokeWidth="0.35"
            />
          ));
        })}
      </Svg>
    </View>
  );
}

function styleFactory() {
  return {
    box: { alignItems: "center", justifyContent: "center", overflow: "hidden" }
  };
}

import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Asset } from "expo-asset";
import { Image } from "expo-image";
import { SvgXml } from "react-native-svg";
import { useAppState } from "../state/AppState.js";
import { useStyles, useTheme } from "../theme.js";

const HOMEM = {
  peito: require("../../assets/muscles/homem/peito.svg"),
  costas: require("../../assets/muscles/homem/costas.svg"),
  ombros: require("../../assets/muscles/homem/ombros.svg"),
  trapezio: require("../../assets/muscles/homem/trapezio.svg"),
  biceps: require("../../assets/muscles/homem/biceps.svg"),
  triceps: require("../../assets/muscles/homem/triceps.svg"),
  antebracos: require("../../assets/muscles/homem/antebracos.svg"),
  abdomen: require("../../assets/muscles/homem/abdomen.svg"),
  obliquos: require("../../assets/muscles/homem/obliquos.svg"),
  pernas: require("../../assets/muscles/homem/pernas.png"),
  quadriceps: require("../../assets/muscles/homem/quadriceps.svg"),
  posterior: require("../../assets/muscles/homem/posterior.svg"),
  gluteos: require("../../assets/muscles/homem/gluteos.svg"),
  abdutores: require("../../assets/muscles/homem/abdutores.svg"),
  adutores: require("../../assets/muscles/homem/adutores.svg"),
  panturrilha: require("../../assets/muscles/homem/panturrilha.svg")
};

const MULHER = {
  peito: require("../../assets/muscles/mulher/peito.png"),
  costas: require("../../assets/muscles/mulher/costas.png"),
  ombros: require("../../assets/muscles/mulher/ombros.png"),
  trapezio: require("../../assets/muscles/mulher/trapezio.png"),
  biceps: require("../../assets/muscles/mulher/biceps.png"),
  triceps: require("../../assets/muscles/mulher/triceps.png"),
  antebracos: require("../../assets/muscles/mulher/antebracos.png"),
  abdomen: require("../../assets/muscles/mulher/abdomen.png"),
  obliquos: require("../../assets/muscles/mulher/obliquos.png"),
  pernas: require("../../assets/muscles/mulher/pernas.png"),
  quadriceps: require("../../assets/muscles/mulher/quadriceps.png"),
  posterior: require("../../assets/muscles/mulher/posterior.png"),
  gluteos: require("../../assets/muscles/mulher/gluteos.png"),
  abdutores: require("../../assets/muscles/mulher/abdutores.png"),
  adutores: require("../../assets/muscles/mulher/adutores.png"),
  panturrilha: require("../../assets/muscles/mulher/panturrilha.png")
};

const PNG = {
  pernas: true
};

const xmlCache = {};

function isFemale(gender) {
  return gender === "mulher" || gender === "female";
}

export function MuscleArt({ id, width = 88, height = 88 }) {
  const { colors } = useTheme();
  const styles = useStyles(styleFactory);
  const { state } = useAppState();
  const female = isFemale(state.profile && state.profile.gender);
  const pack = female ? MULHER : HOMEM;
  const raster = female || PNG[id];
  const [xml, setXml] = useState(!raster ? (xmlCache[id] || "") : "");

  useEffect(() => {
    if (raster) return;
    const mod = pack[id];
    if (!mod) return;
    if (xmlCache[id]) {
      setXml(xmlCache[id]);
      return;
    }
    const asset = Asset.fromModule(mod);
    asset.downloadAsync().then(() => {
      if (!asset.localUri) return;
      fetch(asset.localUri).then((res) => res.text()).then((text) => {
        xmlCache[id] = text;
        setXml(text);
      }).catch(() => {});
    }).catch(() => {});
  }, [id, female, raster, pack]);

  const png = raster ? pack[id] : null;

  return (
    <View style={[styles.box, { width, height }, png && styles.boxDark]}>
      {png ? (
        <Image source={png} style={styles.img} contentFit="contain" />
      ) : xml ? (
        <SvgXml xml={xml} width="100%" height="100%" />
      ) : null}
    </View>
  );
}

function styleFactory(c) {
  return {
  box: { backgroundColor: c.surface, borderRadius: 16, overflow: "hidden" },
  boxDark: { backgroundColor: "#000" },
  img: { width: "100%", height: "100%" }
};
}

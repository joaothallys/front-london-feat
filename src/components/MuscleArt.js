import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Asset } from "expo-asset";
import { SvgXml } from "react-native-svg";
import { colors } from "../theme.js";

const FILES = {
  peito: require("../../assets/muscles/peito.svg"),
  costas: require("../../assets/muscles/costas.svg"),
  ombros: require("../../assets/muscles/ombros.svg"),
  trapezio: require("../../assets/muscles/trapezio.svg"),
  biceps: require("../../assets/muscles/biceps.svg"),
  triceps: require("../../assets/muscles/triceps.svg"),
  antebracos: require("../../assets/muscles/antebracos.svg"),
  abdomen: require("../../assets/muscles/abdomen.svg"),
  obliquos: require("../../assets/muscles/obliquos.svg"),
  quadriceps: require("../../assets/muscles/quadriceps.svg"),
  posterior: require("../../assets/muscles/posteriores.svg"),
  gluteos: require("../../assets/muscles/gluteos.svg"),
  abdutores: require("../../assets/muscles/abdutores.svg"),
  adutores: require("../../assets/muscles/adutores.svg"),
  panturrilha: require("../../assets/muscles/panturrilhas.svg")
};

const xmlCache = {};

export function MuscleArt({ id, width = 88, height = 88 }) {
  const [xml, setXml] = useState(xmlCache[id] || "");
  useEffect(() => {
    const mod = FILES[id];
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
  }, [id]);
  return (
    <View style={[styles.box, { width, height }]}>
      {xml ? <SvgXml xml={xml} width="100%" height="100%" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: colors.surface, borderRadius: 16, overflow: "hidden" }
});

import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useStyles, useTheme } from "../theme.js";
import { cachedGif, warmGif } from "../media/GifCache.js";
import { Skeleton } from "./Skeleton.js";

export function GifPreview({ visible, uri, title, exerciseId, onClose }) {
  const { colors } = useTheme();
  const styles = useStyles(styleFactory);
  const [src, setSrc] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!visible || !uri) {
      setSrc("");
      setReady(false);
      return;
    }
    const local = cachedGif(exerciseId);
    setSrc(local || uri);
    setReady(false);
    if (uri.indexOf("file:") !== 0) {
      warmGif(exerciseId || uri, uri).then((next) => {
        if (next) setSrc(next);
      });
    }
  }, [visible, uri, exerciseId]);

  return (
    <Modal visible={!!visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          {src ? (
            <Image
              source={{ uri: src }}
              style={styles.gif}
              contentFit="contain"
              cachePolicy="memory-disk"
              autoplay
              onLoad={() => setReady(true)}
            />
          ) : (
            <View style={[styles.gif, styles.ph]} />
          )}
          {src && !ready ? (
            <View style={styles.skel}>
              <Skeleton width="100%" height={280} radius={16} />
            </View>
          ) : null}
          {title ? <Text style={styles.title}>{title}</Text> : null}
          <Text style={styles.hint}>Toque fora para fechar</Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function styleFactory(c) {
  return {
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.82)",
    justifyContent: "center",
    padding: 20
  },
  card: {
    backgroundColor: c.surface,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: c.line
  },
  gif: {
    width: "100%",
    height: 280,
    backgroundColor: "#fff",
    borderRadius: 16
  },
  ph: { backgroundColor: c.surface3 },
  skel: { position: "absolute", left: 16, right: 16, top: 16, height: 280, overflow: "hidden", borderRadius: 16 },
  title: {
    color: c.text,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 14
  },
  hint: { color: c.muted, textAlign: "center", marginTop: 8, fontSize: 12 }
};
}

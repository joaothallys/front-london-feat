import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { colors } from "../theme.js";
import { mediaUrl } from "../catalog.js";
import { cachedGif, warmGif } from "../media/GifCache.js";
import { MuscleArt } from "./MuscleArt.js";
import { HapticPressable } from "./HapticPressable.js";
import { Skeleton } from "./Skeleton.js";

export function ExerciseThumb({ exercise, size = 64, onPress, showMuscle = true, animate = false }) {
  const id = exercise && (exercise.id || exercise.sourceId);
  const remote = mediaUrl(exercise);
  const [uri, setUri] = useState(() => cachedGif(id) || remote || "");
  const [ready, setReady] = useState(false);
  const muscle = exercise && (exercise.muscle || exercise.category);

  useEffect(() => {
    let live = true;
    setReady(false);
    const local = cachedGif(id);
    if (local) {
      setUri(local);
    } else if (remote) {
      setUri(remote);
      warmGif(id, remote).then((next) => {
        if (live && next) setUri(next);
      });
    } else {
      setUri("");
      setReady(true);
    }
    return () => { live = false; };
  }, [id, remote]);

  const box = (
    <View style={[styles.box, { width: size, height: size }]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={styles.img}
          contentFit="cover"
          cachePolicy="memory-disk"
          recyclingKey={String(id || uri)}
          autoplay={animate}
          onLoad={() => setReady(true)}
        />
      ) : (
        <View style={styles.ph} />
      )}
      {uri && !ready ? (
        <View style={styles.skel}>
          <Skeleton width={size} height={size} radius={12} />
        </View>
      ) : null}
      {showMuscle && muscle ? (
        <View style={styles.badge}>
          <MuscleArt id={muscle} width={22} height={22} />
        </View>
      ) : null}
    </View>
  );
  if (!onPress) return box;
  return <HapticPressable onPress={onPress}>{box}</HapticPressable>;
}

const styles = StyleSheet.create({
  box: { borderRadius: 12, overflow: "hidden", backgroundColor: "#fff" },
  img: { width: "100%", height: "100%", backgroundColor: "#fff" },
  ph: { flex: 1, backgroundColor: "#e8e8e8" },
  skel: { ...StyleSheet.absoluteFillObject },
  badge: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 26,
    height: 26,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: colors.surface
  }
});

import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

export function BrandSplash({ onDone }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.78)).current;
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    const anim = Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 720, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 6.4, tension: 68, useNativeDriver: true })
      ]),
      Animated.delay(320)
    ]);
    anim.start(({ finished }) => {
      if (finished && done.current) done.current();
    });
    return () => anim.stop();
  }, [opacity, scale]);

  return (
    <View style={styles.wrap}>
      <Animated.Image
        source={require("../../assets/logo.png")}
        style={[styles.logo, { opacity, transform: [{ scale }] }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center"
  },
  logo: {
    width: 196,
    height: 196,
    borderRadius: 44
  }
});

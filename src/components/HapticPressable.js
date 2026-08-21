import React from "react";
import { Pressable } from "react-native";

export function HapticPressable({
  onPress,
  onPressIn,
  style,
  children,
  disabled,
  haptic,
  ...rest
}) {
  return (
    <Pressable
      disabled={disabled}
      onPressIn={onPressIn}
      onPress={onPress}
      style={(state) => [
        typeof style === "function" ? style(state) : style,
        state.pressed && !disabled ? { opacity: 0.72, transform: [{ scale: 0.98 }] } : null
      ]}
      {...rest}
    >
      {children}
    </Pressable>
  );
}

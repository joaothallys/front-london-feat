import React from "react";
import { Pressable } from "react-native";

export function HapticPressable({
  onPress,
  onPressIn,
  style,
  children,
  disabled,
  haptic,
  pressScale = true,
  pressOpacity = true,
  ...rest
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={disabled ? { disabled: true } : undefined}
      disabled={disabled}
      onPressIn={onPressIn}
      onPress={onPress}
      style={(state) => [
        typeof style === "function" ? style(state) : style,
        state.pressed && !disabled
          ? {
              ...(pressOpacity ? { opacity: 0.72 } : null),
              ...(pressScale ? { transform: [{ scale: 0.98 }] } : null)
            }
          : null
      ]}
      {...rest}
    >
      {children}
    </Pressable>
  );
}

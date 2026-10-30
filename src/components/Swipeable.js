import React, { forwardRef } from "react";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";

const Inner = ReanimatedSwipeable && ReanimatedSwipeable.default
  ? ReanimatedSwipeable.default
  : ReanimatedSwipeable;

const Swipeable = forwardRef(function Swipeable(
  {
    overshootRight = false,
    overshootLeft = false,
    dragOffsetFromRight = -40,
    dragOffsetFromLeft = 40,
    friction = 2,
    ...props
  },
  ref
) {
  return (
    <Inner
      ref={ref}
      overshootRight={overshootRight}
      overshootLeft={overshootLeft}
      dragOffsetFromRight={dragOffsetFromRight}
      dragOffsetFromLeft={dragOffsetFromLeft}
      friction={friction}
      {...props}
    />
  );
});

export default Swipeable;

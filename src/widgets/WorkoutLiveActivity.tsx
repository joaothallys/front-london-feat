import {
  Button,
  HStack,
  Image,
  Spacer,
  Text,
  VStack
} from "@expo/ui/swift-ui";
import {
  activityBackgroundTint,
  aspectRatio,
  background,
  buttonBorderShape,
  buttonStyle,
  clipShape,
  controlSize,
  dynamicTypeSize,
  font,
  foregroundStyle,
  frame,
  layoutPriority,
  lineLimit,
  minimumScaleFactor,
  monospacedDigit,
  padding,
  resizable,
  tint
} from "@expo/ui/swift-ui/modifiers";
import { createLiveActivity } from "expo-widgets";

type WorkoutLiveProps = {
  phase: string;
  exerciseName: string;
  nextExerciseName: string;
  exerciseIndex: number;
  exerciseCount: number;
  setIndex: number;
  setCount: number;
  kg: string;
  reps: string;
  restSeconds: number;
  startedAt: number;
  endsAt: number;
  totalRest: number;
  thumbPath: string;
  pendingAction: string;
};

const CTA = "#B6FF3B";
const CARD = "#0B0B0B";

const WorkoutLiveActivityLayout = (props: WorkoutLiveProps, environment: { isLuminanceReduced?: boolean; activityFamily?: "small" | "medium" }) => {
  "widget";
  const accent = environment.isLuminanceReduced ? "#FFFFFF" : CTA;
  const muted = environment.isLuminanceReduced ? "#BBBBBB" : "#9A9A9A";
  const resting = props.phase === "rest" && Number(props.endsAt) > 0;
  const small = environment.activityFamily === "small";
  const start = new Date(props.startedAt);
  const end = new Date(props.endsAt);
  const setsLabel = (props.setIndex || 0) + "/" + (props.setCount || 0) + " Sets";

  function applyAction(action: string) {
    const now = Date.now();
    const restMs = (Number(props.restSeconds) || Number(props.totalRest) || 60) * 1000;
    if (action === "complete") {
      return {
        ...props,
        phase: "rest",
        setIndex: Math.min((Number(props.setIndex) || 1) + 1, Number(props.setCount) || 1),
        startedAt: now,
        endsAt: now + restMs,
        totalRest: restMs / 1000,
        pendingAction: action
      };
    }
    if (action === "skip") {
      return { ...props, phase: "work", endsAt: 0, pendingAction: action };
    }
    return { ...props, pendingAction: action };
  }

  const thumb = props.thumbPath ? (
    <Image
      uiImage={props.thumbPath}
      modifiers={[
        resizable(),
        aspectRatio({ contentMode: "fill" }),
        frame({ width: small ? 36 : 48, height: small ? 36 : 48 }),
        clipShape("roundedRectangle", 10),
        background("#FFFFFF")
      ]}
    />
  ) : (
    <Image
      systemName="figure.strengthtraining.traditional"
      color="#111111"
      size={small ? 16 : 22}
      modifiers={[
        frame({ width: small ? 36 : 48, height: small ? 36 : 48 }),
        background("#FFFFFF"),
        clipShape("roundedRectangle", 10)
      ]}
    />
  );

  const stats = resting ? (
    <VStack spacing={0} alignment="trailing" modifiers={[layoutPriority(1)]}>
      <Text modifiers={[font({ weight: "medium", size: 11 }), foregroundStyle(muted)]}>Descanso</Text>
      <Text
        timerInterval={{ lower: start, upper: end }}
        countsDown
        modifiers={[font({ weight: "black", design: "rounded", size: small ? 20 : 24 }), monospacedDigit(), foregroundStyle("#FFFFFF"), lineLimit(1)]}
      />
    </VStack>
  ) : (
    <VStack spacing={0} alignment="trailing" modifiers={[layoutPriority(1)]}>
      <HStack spacing={3} alignment="firstTextBaseline">
        <Text modifiers={[font({ weight: "bold", size: 16 }), foregroundStyle("#FFFFFF"), lineLimit(1)]}>{props.reps}</Text>
        <Text modifiers={[font({ size: 12 }), foregroundStyle(muted)]}>reps</Text>
      </HStack>
      <HStack spacing={3} alignment="firstTextBaseline">
        <Text modifiers={[font({ weight: "bold", size: 16 }), foregroundStyle("#FFFFFF"), lineLimit(1)]}>{props.kg}</Text>
        <Text modifiers={[font({ size: 12 }), foregroundStyle(muted)]}>kg</Text>
      </HStack>
    </VStack>
  );

  const cta = (
    <Button
      label={resting ? "INICIAR PRÓXIMO SET" : "REGISTRAR SET & DESCANSAR"}
      target={resting ? "skip" : "complete"}
      onPress={() => applyAction(resting ? "skip" : "complete")}
      modifiers={[
        buttonStyle("borderedProminent"),
        buttonBorderShape("capsule"),
        controlSize(small ? "regular" : "large"),
        tint(accent),
        foregroundStyle("#111111"),
        font({ weight: "bold", size: small ? 11 : 13 }),
        frame({ maxWidth: 999 })
      ]}
    />
  );

  const banner = (
    <VStack
      spacing={10}
      alignment="leading"
      modifiers={[padding({ horizontal: 6, vertical: 8 }), activityBackgroundTint(CARD), dynamicTypeSize({ max: "large" })]}
    >
      <HStack spacing={10} alignment="center">
        {thumb}
        <VStack spacing={2} alignment="leading">
          <Text modifiers={[font({ weight: "semibold", size: 15 }), foregroundStyle("#FFFFFF"), lineLimit(1), minimumScaleFactor(0.7)]}>
            {props.exerciseName}
          </Text>
          <Text modifiers={[font({ size: 12 }), foregroundStyle(muted), lineLimit(1)]}>{setsLabel}</Text>
        </VStack>
        <Spacer />
        {stats}
      </HStack>
      {cta}
    </VStack>
  );

  const compactTimer = resting ? (
    <Text
      timerInterval={{ lower: start, upper: end }}
      countsDown
      modifiers={[font({ weight: "bold", design: "rounded", size: 16 }), monospacedDigit(), foregroundStyle(accent), lineLimit(1)]}
    />
  ) : (
    <Text modifiers={[font({ weight: "bold", size: 14 }), foregroundStyle(accent)]}>
      {props.setIndex}/{props.setCount}
    </Text>
  );

  return {
    banner,
    bannerSmall: banner,
    compactLeading: <Image systemName={resting ? "timer" : "figure.strengthtraining.traditional"} color={accent} size={16} />,
    compactTrailing: compactTimer,
    minimal: <Image systemName={resting ? "timer" : "dumbbell.fill"} color={accent} size={14} />,
    expandedLeading: thumb,
    expandedTrailing: stats,
    expandedBottom: (
      <VStack spacing={8} alignment="leading" modifiers={[dynamicTypeSize({ max: "large" })]}>
        <Text modifiers={[font({ weight: "semibold", size: 14 }), foregroundStyle("#FFFFFF"), lineLimit(1), minimumScaleFactor(0.7)]}>
          {props.exerciseName}
        </Text>
        <Text modifiers={[font({ size: 12 }), foregroundStyle(muted)]}>{setsLabel}</Text>
        {cta}
      </VStack>
    )
  };
};

export default createLiveActivity("WorkoutLiveActivity", WorkoutLiveActivityLayout);

import {
  Button,
  HStack,
  Image,
  ProgressView,
  Spacer,
  Text,
  VStack
} from "@expo/ui/swift-ui";
import {
  activityBackgroundTint,
  buttonBorderShape,
  buttonStyle,
  controlSize,
  dynamicTypeSize,
  fixedSize,
  font,
  foregroundStyle,
  frame,
  labelsHidden,
  layoutPriority,
  lineLimit,
  minimumScaleFactor,
  monospacedDigit,
  padding,
  progressViewStyle,
  tint,
  truncationMode
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

const WorkoutLiveActivityLayout = (props: WorkoutLiveProps, environment: { isLuminanceReduced?: boolean; activityFamily?: "small" | "medium" }) => {
  "widget";
  // Layout runs isolated inside the widget extension: it cannot see module-level values.
  const bg = "#09090B";
  const red = "#FF6A1A";
  const white = "#FFFFFF";
  const muted = "#A1A1AA";
  const reduced = !!environment.isLuminanceReduced;
  const accent = reduced ? white : red;
  const dim = reduced ? "#BBBBBB" : muted;
  const resting = props.phase === "rest" && Number(props.endsAt) > 0;
  const small = environment.activityFamily === "small";
  const start = new Date(Number(props.startedAt) || Date.now());
  const end = new Date(Number(props.endsAt) || Date.now());
  const setIndex = Number(props.setIndex) || 0;
  const setCount = Number(props.setCount) || 0;
  const setsLabel = setCount > 0 ? "Série " + Math.max(1, setIndex) + " de " + setCount : "";
  // Margens do banner: o sistema não aplica nenhuma com activityBackgroundTint.
  const pad = small ? padding({ horizontal: 12, vertical: 10 }) : padding({ horizontal: 16, vertical: 14 });
  const exerciseName = props.exerciseName || "Treino";
  const restAction = "skip";
  const workAction = "complete";

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

  const timerText = (
    <Text
      timerInterval={{ lower: start, upper: end }}
      countsDown
      modifiers={[
        font({ weight: "black", design: "rounded", size: small ? 28 : 34 }),
        monospacedDigit(),
        foregroundStyle(white),
        lineLimit(1),
        minimumScaleFactor(0.7)
      ]}
    />
  );

  const restProgress = (
    <ProgressView
      timerInterval={{ lower: start, upper: end }}
      countsDown={false}
      modifiers={[progressViewStyle("linear"), labelsHidden(), tint(accent), frame({ maxWidth: 999, minHeight: 4, maxHeight: 4 })]}
    />
  );

  const restRing = (
    <ProgressView
      timerInterval={{ lower: start, upper: end }}
      countsDown={false}
      modifiers={[progressViewStyle("circular"), labelsHidden(), tint(accent), frame({ width: 22, height: 22 })]}
    />
  );

  const cta = (
    <Button
      label={resting ? (small ? "PRÓXIMA" : "PRÓXIMA SÉRIE") : small ? "CONCLUIR" : "CONCLUIR SÉRIE"}
      systemImage="chevron.right"
      target={resting ? restAction : workAction}
      onPress={() => applyAction(resting ? restAction : workAction)}
      modifiers={[
        buttonStyle("borderedProminent"),
        buttonBorderShape("capsule"),
        controlSize(small ? "small" : "regular"),
        tint(accent),
        foregroundStyle(white),
        font({ weight: "bold", size: small ? 10 : 12 }),
        lineLimit(1),
        fixedSize()
      ]}
    />
  );

  const restBanner = (
    <VStack
      spacing={small ? 8 : 10}
      alignment="leading"
      modifiers={[pad, activityBackgroundTint(bg), dynamicTypeSize({ max: "large" })]}
    >
      <HStack spacing={6} alignment="center">
        <Image systemName="dumbbell.fill" color={accent} size={11} />
        <Text modifiers={[font({ weight: "semibold", size: 11 }), foregroundStyle(white), lineLimit(1), minimumScaleFactor(0.8)]}>
          {small ? "DESCANSO" : "INTERVALO DE DESCANSO"}
        </Text>
        <Image systemName="circle.fill" color={accent} size={5} />
        <Spacer />
        <Text modifiers={[font({ size: 11 }), foregroundStyle(dim), lineLimit(1), fixedSize()]}>{setsLabel}</Text>
      </HStack>
      <HStack spacing={small ? 8 : 12} alignment="center">
        <VStack spacing={2} alignment="leading" modifiers={[layoutPriority(1)]}>
          {timerText}
          <Text modifiers={[font({ size: 13 }), foregroundStyle(dim), lineLimit(1), minimumScaleFactor(0.85), truncationMode("tail")]}>
            {exerciseName}
          </Text>
        </VStack>
        <Spacer />
        {cta}
      </HStack>
      {restProgress}
    </VStack>
  );

  const workBanner = (
    <VStack
      spacing={small ? 8 : 10}
      alignment="leading"
      modifiers={[pad, activityBackgroundTint(bg), dynamicTypeSize({ max: "large" })]}
    >
      <HStack spacing={6} alignment="center">
        <Image systemName="dumbbell.fill" color={accent} size={11} />
        <Text modifiers={[font({ weight: "semibold", size: 11 }), foregroundStyle(white), lineLimit(1)]}>TREINO</Text>
        <Spacer />
        <Text modifiers={[font({ size: 11 }), foregroundStyle(dim), lineLimit(1), fixedSize()]}>{setsLabel}</Text>
      </HStack>
      <HStack spacing={small ? 8 : 12} alignment="center">
        <VStack spacing={2} alignment="leading" modifiers={[layoutPriority(1)]}>
          <Text modifiers={[font({ weight: "bold", size: small ? 16 : 18 }), foregroundStyle(white), lineLimit(1), minimumScaleFactor(0.8), truncationMode("tail")]}>
            {exerciseName}
          </Text>
          <Text modifiers={[font({ size: 13 }), foregroundStyle(dim), lineLimit(1)]}>
            {props.reps} reps · {props.kg} kg
          </Text>
        </VStack>
        <Spacer />
        {cta}
      </HStack>
    </VStack>
  );

  const banner = resting ? restBanner : workBanner;

  const compactTimer = resting ? (
    <Text
      timerInterval={{ lower: start, upper: end }}
      countsDown
      modifiers={[font({ weight: "bold", design: "rounded", size: 15 }), monospacedDigit(), foregroundStyle(accent), lineLimit(1)]}
    />
  ) : (
    <Text modifiers={[font({ weight: "bold", size: 13 }), foregroundStyle(accent)]}>
      {setIndex}/{setCount}
    </Text>
  );

  const islandTimer = resting ? (
    <Text
      timerInterval={{ lower: start, upper: end }}
      countsDown
      modifiers={[font({ weight: "black", design: "rounded", size: 22 }), monospacedDigit(), foregroundStyle(white), lineLimit(1)]}
    />
  ) : (
    <Text modifiers={[font({ weight: "black", size: 18 }), foregroundStyle(white)]}>
      {props.reps}
    </Text>
  );

  return {
    banner,
    bannerSmall: banner,
    compactLeading: resting ? restRing : <Image systemName="dumbbell.fill" color={accent} size={16} />,
    compactTrailing: compactTimer,
    minimal: resting ? restRing : <Image systemName="dumbbell.fill" color={accent} size={14} />,
    expandedLeading: resting ? restRing : <Image systemName="dumbbell.fill" color={accent} size={18} />,
    expandedTrailing: islandTimer,
    expandedBottom: (
      <VStack spacing={8} alignment="leading" modifiers={[dynamicTypeSize({ max: "large" })]}>
        <HStack spacing={6} alignment="center">
          <Text modifiers={[font({ weight: "semibold", size: 11 }), foregroundStyle(dim)]}>
            {resting ? "DESCANSO" : "TREINO"}
          </Text>
          <Spacer />
          <Text modifiers={[font({ size: 11 }), foregroundStyle(dim)]}>{setsLabel}</Text>
        </HStack>
        {resting ? restProgress : null}
        <Text modifiers={[font({ weight: "semibold", size: 14 }), foregroundStyle(white), lineLimit(1), minimumScaleFactor(0.7)]}>
          {exerciseName}
        </Text>
        {cta}
      </VStack>
    )
  };
};

export default createLiveActivity("WorkoutLiveActivity", WorkoutLiveActivityLayout);

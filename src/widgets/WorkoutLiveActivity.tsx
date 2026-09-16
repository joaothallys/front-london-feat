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
  font,
  foregroundStyle,
  labelsHidden,
  layoutPriority,
  lineLimit,
  minimumScaleFactor,
  monospacedDigit,
  padding,
  progressViewStyle,
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
  startedAt: number;
  endsAt: number;
  totalRest: number;
  pendingAction: string;
};

const WorkoutLiveActivityLayout = (props: WorkoutLiveProps, environment: { isLuminanceReduced?: boolean; activityFamily?: "small" | "medium" }) => {
  "widget";
  const accent = environment.isLuminanceReduced ? "#FFFFFF" : "#E10600";
  const muted = environment.isLuminanceReduced ? "#BBBBBB" : "#A8B4B7";
  const resting = props.phase === "rest" && props.endsAt > 0;
  const hasNext = props.exerciseIndex < props.exerciseCount;
  const start = new Date(props.startedAt);
  const end = new Date(props.endsAt);

  function applyAction(action: string) {
    return {
      phase: action === "skip" ? "work" : props.phase,
      exerciseName: props.exerciseName,
      nextExerciseName: props.nextExerciseName,
      exerciseIndex: props.exerciseIndex,
      exerciseCount: props.exerciseCount,
      setIndex: props.setIndex,
      setCount: props.setCount,
      startedAt: props.startedAt,
      endsAt: action === "skip" ? 0 : props.endsAt,
      totalRest: props.totalRest,
      pendingAction: action
    };
  }

  function actions(size: "mini" | "small") {
    return (
      <HStack spacing={8} modifiers={[layoutPriority(1)]}>
        {resting ? (
          <Button
            label="Pular"
            target="skip"
            onPress={() => applyAction("skip")}
            modifiers={[buttonStyle("bordered"), buttonBorderShape("capsule"), controlSize(size), tint("#FFFFFF")]}
          />
        ) : null}
        {hasNext ? (
          <Button
            label="Próximo"
            target="next"
            onPress={() => applyAction("next")}
            modifiers={[buttonStyle("borderedProminent"), buttonBorderShape("capsule"), controlSize(size), tint(accent)]}
          />
        ) : (
          <Button
            label="Abrir"
            target="open"
            onPress={() => applyAction("open")}
            modifiers={[buttonStyle("borderedProminent"), buttonBorderShape("capsule"), controlSize(size), tint(accent)]}
          />
        )}
      </HStack>
    );
  }

  const nameLine = (
    <Text modifiers={[font({ weight: "bold", size: 16 }), foregroundStyle("#FFFFFF"), lineLimit(1), minimumScaleFactor(0.65)]}>
      {props.exerciseName}
    </Text>
  );

  const banner = (
    <VStack
      spacing={8}
      alignment="leading"
      modifiers={[padding({ horizontal: 4, vertical: 2 }), activityBackgroundTint("#071316"), dynamicTypeSize({ max: "large" })]}
    >
      <HStack spacing={8}>
        <Text modifiers={[font({ weight: "semibold", size: 11 }), foregroundStyle(accent)]}>
          {resting ? "INTERVALO" : "TREINO"}
        </Text>
        <Spacer />
        {resting ? (
          <Text
            timerInterval={{ lower: start, upper: end }}
            countsDown
            modifiers={[font({ weight: "black", design: "rounded", size: 22 }), monospacedDigit(), foregroundStyle("#FFFFFF"), lineLimit(1)]}
          />
        ) : (
          <Text modifiers={[font({ weight: "medium", size: 12 }), foregroundStyle(muted)]}>
            {props.exerciseIndex}/{props.exerciseCount}
          </Text>
        )}
      </HStack>
      {nameLine}
      {actions("mini")}
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
    expandedLeading: (
      <VStack spacing={2} alignment="leading">
        <Image systemName={resting ? "timer" : "dumbbell.fill"} color={accent} size={22} />
        <Text modifiers={[font({ weight: "bold", size: 11 }), foregroundStyle(accent)]}>
          {resting ? "DESCANSO" : "TREINO"}
        </Text>
      </VStack>
    ),
    expandedTrailing: compactTimer,
    expandedBottom: (
      <VStack spacing={6} alignment="leading" modifiers={[dynamicTypeSize({ max: "xLarge" })]}>
        <Text modifiers={[font({ weight: "bold", size: 15 }), foregroundStyle("#FFFFFF"), lineLimit(1), minimumScaleFactor(0.7)]}>
          {props.exerciseName}
        </Text>
        {resting && props.nextExerciseName ? (
          <Text modifiers={[font({ size: 12 }), foregroundStyle(muted), lineLimit(1), minimumScaleFactor(0.75)]}>
            Depois: {props.nextExerciseName}
          </Text>
        ) : (
          <Text modifiers={[font({ size: 12 }), foregroundStyle(muted), lineLimit(1)]}>
            {props.exerciseIndex}/{props.exerciseCount} · série {props.setIndex}/{props.setCount}
          </Text>
        )}
        {resting ? (
          <ProgressView
            timerInterval={{ lower: start, upper: end }}
            countsDown
            modifiers={[progressViewStyle("linear"), tint(accent), labelsHidden()]}
          />
        ) : null}
        {actions("small")}
      </VStack>
    )
  };
};

export default createLiveActivity("WorkoutLiveActivity", WorkoutLiveActivityLayout);

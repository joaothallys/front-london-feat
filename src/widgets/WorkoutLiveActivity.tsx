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
  font,
  foregroundStyle,
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

const WorkoutLiveActivityLayout = (props: WorkoutLiveProps, environment: { isLuminanceReduced?: boolean }) => {
  "widget";
  const accent = environment.isLuminanceReduced ? "#FFFFFF" : "#E10600";
  const muted = environment.isLuminanceReduced ? "#BBBBBB" : "#A8B4B7";
  const resting = props.phase === "rest" && props.endsAt > 0;
  const hasNext = props.exerciseIndex < props.exerciseCount;
  const start = new Date(props.startedAt);
  const end = new Date(props.endsAt);
  const progress = props.exerciseCount > 0 ? props.exerciseIndex / props.exerciseCount : 0;

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

  const timer = resting ? (
    <Text
      timerInterval={{ lower: start, upper: end }}
      countsDown
      modifiers={[font({ weight: "black", design: "rounded", size: 44 }), monospacedDigit(), foregroundStyle("#FFFFFF")]}
    />
  ) : (
    <Text modifiers={[font({ weight: "black", design: "rounded", size: 28 }), foregroundStyle("#FFFFFF")]}>
      {props.exerciseName}
    </Text>
  );

  const compactTimer = resting ? (
    <Text
      timerInterval={{ lower: start, upper: end }}
      countsDown
      modifiers={[font({ weight: "bold", design: "rounded", size: 16 }), monospacedDigit(), foregroundStyle(accent)]}
    />
  ) : (
    <Text modifiers={[font({ weight: "bold", size: 14 }), foregroundStyle(accent)]}>
      {props.setIndex}/{props.setCount}
    </Text>
  );

  const actions = (
    <HStack spacing={8}>
      {resting ? (
        <Button
          label="Pular"
          systemImage="forward.fill"
          target="skip"
          onPress={() => applyAction("skip")}
          modifiers={[buttonStyle("bordered"), buttonBorderShape("capsule"), controlSize("large"), tint("#FFFFFF")]}
        />
      ) : null}
      {hasNext ? (
        <Button
          label="Próximo"
          systemImage="arrow.right"
          target="next"
          onPress={() => applyAction("next")}
          modifiers={[buttonStyle("borderedProminent"), buttonBorderShape("capsule"), controlSize("large"), tint(accent)]}
        />
      ) : (
        <Button
          label="Abrir treino"
          systemImage="checkmark.circle.fill"
          target="open"
          onPress={() => applyAction("open")}
          modifiers={[buttonStyle("borderedProminent"), buttonBorderShape("capsule"), controlSize("large"), tint(accent)]}
        />
      )}
    </HStack>
  );

  return {
    banner: (
      <VStack
        spacing={10}
        alignment="leading"
        modifiers={[padding({ all: 4 }), activityBackgroundTint("#071316")]}
      >
        <HStack spacing={8}>
          <Image systemName="figure.strengthtraining.traditional" color={accent} size={18} />
          <Text modifiers={[font({ weight: "semibold", size: 12 }), foregroundStyle(accent)]}>
            {resting ? "INTERVALO" : "TREINO"}
          </Text>
          <Spacer />
          <Text modifiers={[font({ weight: "medium", size: 12 }), foregroundStyle(muted)]}>
            {props.exerciseIndex}/{props.exerciseCount}
          </Text>
        </HStack>
        {timer}
        {resting ? (
          <Text modifiers={[font({ weight: "semibold", size: 15 }), foregroundStyle("#FFFFFF")]}>
            {props.exerciseName}
          </Text>
        ) : (
          <Text modifiers={[font({ size: 13 }), foregroundStyle(muted)]}>
            Série {props.setIndex}/{props.setCount}
            {props.nextExerciseName ? " · próximo: " + props.nextExerciseName : ""}
          </Text>
        )}
        {resting ? (
          <ProgressView
            timerInterval={{ lower: start, upper: end }}
            countsDown
            modifiers={[progressViewStyle("linear"), tint(accent)]}
          />
        ) : (
          <ProgressView value={progress} modifiers={[progressViewStyle("linear"), tint(accent)]} />
        )}
        {actions}
      </VStack>
    ),
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
      <VStack spacing={8} alignment="leading">
        <Text modifiers={[font({ weight: "bold", size: 16 }), foregroundStyle("#FFFFFF")]}>
          {props.exerciseName}
        </Text>
        {resting && props.nextExerciseName ? (
          <Text modifiers={[font({ size: 12 }), foregroundStyle(muted)]}>
            Depois: {props.nextExerciseName}
          </Text>
        ) : (
          <Text modifiers={[font({ size: 12 }), foregroundStyle(muted)]}>
            {props.exerciseIndex}/{props.exerciseCount} · série {props.setIndex}/{props.setCount}
          </Text>
        )}
        {resting ? (
          <ProgressView
            timerInterval={{ lower: start, upper: end }}
            countsDown
            modifiers={[progressViewStyle("linear"), tint(accent)]}
          />
        ) : null}
        {actions}
      </VStack>
    )
  };
};

export default createLiveActivity("WorkoutLiveActivity", WorkoutLiveActivityLayout);

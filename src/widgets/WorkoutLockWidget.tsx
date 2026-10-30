import {
  AccessoryWidgetBackground,
  HStack,
  Image,
  ProgressView,
  Spacer,
  Text,
  VStack,
  ZStack
} from "@expo/ui/swift-ui";
import {
  font,
  foregroundStyle,
  frame,
  lineLimit,
  minimumScaleFactor,
  monospacedDigit,
  padding,
  progressViewStyle,
  tint,
  widgetURL
} from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";

type WorkoutLockProps = {
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

const WorkoutLockWidgetView = (props: WorkoutLockProps, environment: WidgetEnvironment) => {
  "widget";
  const red = "#FF6A1A";
  const white = "#FFFFFF";
  const muted = "#A1A1AA";
  const resting = props.phase === "rest" && Number(props.endsAt) > 0;
  const start = new Date(Number(props.startedAt) || Date.now());
  const end = new Date(Number(props.endsAt) || Date.now());
  const vibrant = environment.widgetRenderingMode === "vibrant";
  const accent = vibrant ? white : red;
  const dim = vibrant ? white : muted;
  const family = environment.widgetFamily;
  const exerciseName = props.exerciseName || "LumenFit";
  const exerciseIndex = Number(props.exerciseIndex) || 1;
  const exerciseCount = Number(props.exerciseCount) || 1;
  const setIndex = Number(props.setIndex) || 0;
  const setCount = Number(props.setCount) || 0;
  const setsLabel = "Série " + setIndex + " de " + setCount;

  if (family === "accessoryInline") {
    return (
      <HStack spacing={4} modifiers={[widgetURL("londonfitness://session")]}>
        <Image systemName={resting ? "timer" : "dumbbell.fill"} color={accent} size={12} />
        {resting ? (
          <Text timerInterval={{ lower: start, upper: end }} countsDown modifiers={[monospacedDigit()]} />
        ) : (
          <Text>{exerciseName}</Text>
        )}
      </HStack>
    );
  }

  if (family === "accessoryCircular") {
    return (
      <ZStack modifiers={[widgetURL("londonfitness://session")]}>
        <AccessoryWidgetBackground />
        {resting ? (
          <ProgressView
            timerInterval={{ lower: start, upper: end }}
            countsDown={false}
            modifiers={[progressViewStyle("circular"), tint(accent), padding({ all: 4 })]}
          />
        ) : (
          <VStack spacing={0}>
            <Image systemName="dumbbell.fill" color={accent} size={16} />
            <Text modifiers={[font({ weight: "bold", size: 10 })]}>
              {exerciseIndex}/{exerciseCount}
            </Text>
          </VStack>
        )}
      </ZStack>
    );
  }

  if (family === "accessoryRectangular") {
    return (
      <VStack spacing={2} alignment="leading" modifiers={[widgetURL("londonfitness://session")]}>
        <HStack spacing={4}>
          <Image systemName={resting ? "dumbbell.fill" : "figure.strengthtraining.traditional"} color={accent} size={12} />
          <Text modifiers={[font({ weight: "semibold", size: 12 }), foregroundStyle(accent)]}>
            {resting ? "DESCANSO" : "TREINO"}
          </Text>
        </HStack>
        {resting ? (
          <Text
            timerInterval={{ lower: start, upper: end }}
            countsDown
            modifiers={[font({ weight: "black", design: "rounded", size: 22 }), monospacedDigit(), foregroundStyle(white)]}
          />
        ) : (
          <Text modifiers={[font({ weight: "bold", size: 15 }), foregroundStyle(white), lineLimit(1), minimumScaleFactor(0.7)]}>
            {exerciseName}
          </Text>
        )}
        <Text modifiers={[font({ size: 11 }), foregroundStyle(dim), lineLimit(1), minimumScaleFactor(0.75)]}>
          {resting ? exerciseName : setsLabel}
        </Text>
      </VStack>
    );
  }

  return (
    <VStack spacing={8} alignment="leading" modifiers={[padding({ all: 14 }), widgetURL("londonfitness://session")]}>
      <HStack spacing={6}>
        <Image systemName="dumbbell.fill" color={accent} size={14} />
        <Text modifiers={[font({ weight: "bold", size: 11 }), foregroundStyle(white)]}>
          {resting ? "INTERVALO DE DESCANSO" : "TREINO"}
        </Text>
        <Spacer />
        <Text modifiers={[font({ size: 11 }), foregroundStyle(dim)]}>{setsLabel}</Text>
      </HStack>
      {resting ? (
        <VStack spacing={6} alignment="leading">
          <Text
            timerInterval={{ lower: start, upper: end }}
            countsDown
            modifiers={[font({ weight: "black", design: "rounded", size: family === "systemMedium" ? 36 : 30 }), monospacedDigit(), foregroundStyle(white)]}
          />
          <Text modifiers={[font({ size: 13 }), foregroundStyle(dim), lineLimit(1), minimumScaleFactor(0.7)]}>{exerciseName}</Text>
          <ProgressView
            timerInterval={{ lower: start, upper: end }}
            countsDown={false}
            modifiers={[progressViewStyle("linear"), tint(accent), frame({ maxWidth: 999, minHeight: 4, maxHeight: 4 })]}
          />
        </VStack>
      ) : (
        <VStack spacing={4} alignment="leading">
          <Text modifiers={[font({ weight: "heavy", design: "rounded", size: family === "systemMedium" ? 22 : 18 }), foregroundStyle(white), lineLimit(2), minimumScaleFactor(0.7)]}>
            {exerciseName}
          </Text>
          <Text modifiers={[font({ size: 13 }), foregroundStyle(dim)]}>
            Exercício {exerciseIndex}/{exerciseCount}
          </Text>
        </VStack>
      )}
    </VStack>
  );
};

export default createWidget("WorkoutLockWidget", WorkoutLockWidgetView);

import {
  AccessoryWidgetBackground,
  HStack,
  Image,
  ProgressView,
  Text,
  VStack,
  ZStack
} from "@expo/ui/swift-ui";
import {
  font,
  foregroundStyle,
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
  const resting = props.phase === "rest" && Number(props.endsAt) > 0;
  const start = new Date(Number(props.startedAt) || Date.now());
  const end = new Date(Number(props.endsAt) || Date.now());
  const vibrant = environment.widgetRenderingMode === "vibrant";
  const accent = vibrant ? "#FFFFFF" : "#E10600";
  const family = environment.widgetFamily;
  const exerciseName = props.exerciseName || "LumenFit";
  const exerciseIndex = Number(props.exerciseIndex) || 1;
  const exerciseCount = Number(props.exerciseCount) || 1;
  const setIndex = Number(props.setIndex) || 0;
  const setCount = Number(props.setCount) || 0;

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
            countsDown
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
          <Image systemName={resting ? "timer" : "figure.strengthtraining.traditional"} color={accent} size={12} />
          <Text modifiers={[font({ weight: "semibold", size: 12 }), foregroundStyle(accent)]}>
            {resting ? "Intervalo" : "LumenFit"}
          </Text>
        </HStack>
        {resting ? (
          <Text
            timerInterval={{ lower: start, upper: end }}
            countsDown
            modifiers={[font({ weight: "bold", design: "rounded", size: 22 }), monospacedDigit()]}
          />
        ) : (
          <Text modifiers={[font({ weight: "bold", size: 15 })]}>{exerciseName}</Text>
        )}
        <Text modifiers={[font({ size: 11 })]}>
          {resting ? exerciseName : exerciseIndex + "/" + exerciseCount}
        </Text>
      </VStack>
    );
  }

  return (
    <VStack
      spacing={8}
      alignment="leading"
      modifiers={[padding({ all: 14 }), widgetURL("londonfitness://session")]}
    >
      <HStack>
        <Image systemName="dumbbell.fill" color={accent} size={16} />
        <Text modifiers={[font({ weight: "bold", size: 12 }), foregroundStyle(accent)]}>LUMENFIT</Text>
      </HStack>
      <Text modifiers={[font({ weight: "heavy", design: "rounded", size: family === "systemMedium" ? 22 : 18 })]}>
        {exerciseName}
      </Text>
      {resting ? (
        <VStack spacing={4} alignment="leading">
          <Text
            timerInterval={{ lower: start, upper: end }}
            countsDown
            modifiers={[font({ weight: "black", design: "rounded", size: 34 }), monospacedDigit(), foregroundStyle(accent)]}
          />
          <ProgressView
            timerInterval={{ lower: start, upper: end }}
            countsDown
            modifiers={[progressViewStyle("linear"), tint(accent)]}
          />
        </VStack>
      ) : (
        <Text modifiers={[font({ size: 13 })]}>
          Exercício {exerciseIndex}/{exerciseCount} · série {setIndex}/{setCount}
        </Text>
      )}
    </VStack>
  );
};

export default createWidget("WorkoutLockWidget", WorkoutLockWidgetView);

import { panturrilhaExerciseIds } from "./panturrilhaExercises.js";
import { buildRow } from "./catalogBuilder.js";

function row(spec) {
  return buildRow(panturrilhaExerciseIds, Object.assign({
    category: "panturrilha",
    exerciseType: spec.exerciseType || "isolamento"
  }, spec));
}

function steps(...texts) {
  return texts.map((text, i) => ({ step: i + 1, text }));
}

const SOLEUS = ["Sóleo"];
const GASTROC = ["Gastrocnêmio"];
const CALF_ERR = [
  "Não descer o calcanhar até alongar.",
  "Dobrar os joelhos no meio da repetição.",
  "Usar impulso e bater o calcanhar no fundo."
];
const RAISE_TIPS = [
  "Pause um segundo no topo, na ponta dos pés.",
  "A descida é lenta; o alongamento conta."
];

export const panturrilhaCatalog = [
  row({
    id: "panturrilha-sentado",
    displayName: "Panturrilha Sentado",
    sourceName: "lever seated calf raise",
    sourceId: "bOOdeyc",
    equipment: "Máquina",
    equipmentId: "maquina",
    level: "iniciante",
    secondaryMuscles: SOLEUS,
    description: "Elevação de calcanhar sentado. Com o joelho dobrado, o foco principal vai para o sóleo e a panturrilha profunda.",
    startingPosition: "Sentado, pontas dos pés na plataforma, joelhos sob as almofadas, tronco ereto.",
    instructions: steps(
      "Solte o seguro e deixe o calcanhar descer até alongar.",
      "Empurre a plataforma só com a ponta dos pés.",
      "Suba até a extensão máxima do tornozelo.",
      "Desça com controle e repita."
    ),
    commonErrors: CALF_ERR,
    importantTips: RAISE_TIPS
  }),
  row({
    id: "panturrilha-pe-smith",
    displayName: "Panturrilha em Pé no Smith",
    sourceName: "smith standing leg calf raise",
    sourceId: "6MaEjVA",
    equipment: "Smith",
    equipmentId: "smith",
    level: "iniciante",
    secondaryMuscles: GASTROC,
    description: "Elevação de calcanhar em pé na barra guiada. O joelho estendido prioriza o gastrocnêmio.",
    startingPosition: "Em pé no Smith, barra no trapézio, pontas dos pés num step, joelhos quase estendidos.",
    instructions: steps(
      "Destrave a barra e deixe o calcanhar descer.",
      "Suba na ponta dos pés até contrair a panturrilha.",
      "Segure no topo.",
      "Desça até alongar, sem dobrar os joelhos."
    ),
    commonErrors: CALF_ERR,
    importantTips: RAISE_TIPS.concat(["O Smith segura o equilíbrio: foque na amplitude."])
  }),
  row({
    id: "panturrilha-leg-press-45",
    displayName: "Panturrilha Leg Press 45°",
    sourceName: "sled 45° calf press",
    sourceId: "qCNVnaU",
    equipment: "Máquina",
    equipmentId: "maquina",
    level: "intermediario",
    secondaryMuscles: GASTROC.concat(SOLEUS),
    description: "Panturrilha no leg press 45°. Só a ponta dos pés empurra a plataforma; joelhos quase travados.",
    startingPosition: "Sentado no 45°, pontas dos pés na borda de baixo da plataforma, joelhos estendidos sem hiperextender.",
    instructions: steps(
      "Solte o seguro com as pernas estendidas.",
      "Deixe a plataforma voltar até alongar o calcanhar.",
      "Empurre só com a ponta dos pés.",
      "Não dobre os joelhos no meio da série."
    ),
    commonErrors: CALF_ERR.concat(["Colocar o pé inteiro na plataforma e transformar em leg press."]),
    importantTips: [
      "Os joelhos ficam quase travados o tempo todo.",
      "Amplitude completa vale mais que carga de agachamento."
    ]
  }),
  row({
    id: "panturrilha-leg-press-horizontal",
    displayName: "Panturrilha no Leg Press Horizontal",
    sourceName: "sled calf press on leg press",
    sourceId: "ykHcWme",
    equipment: "Máquina",
    equipmentId: "maquina",
    level: "iniciante",
    secondaryMuscles: GASTROC.concat(SOLEUS),
    description: "Mesmo padrão no leg press horizontal. O caminho fixo facilita controlar a amplitude.",
    startingPosition: "Sentado, pontas dos pés na borda da plataforma, joelhos estendidos, costas no encosto.",
    instructions: steps(
      "Desça o calcanhar até alongar a panturrilha.",
      "Empurre a plataforma só com a ponta dos pés.",
      "Pause no topo.",
      "Volte lento até o alongamento."
    ),
    commonErrors: CALF_ERR,
    importantTips: RAISE_TIPS
  }),
  row({
    id: "panturrilha-unilateral-smith",
    displayName: "Panturrilha Unilateral no Smith",
    sourceName: "smith one leg floor calf raise",
    sourceId: "9GXrTE6",
    equipment: "Smith",
    equipmentId: "smith",
    level: "intermediario",
    secondaryMuscles: GASTROC,
    description: "Uma perna por vez no Smith. Corrige diferença de força e pede mais equilíbrio.",
    startingPosition: "Uma ponta do pé no step, a outra perna livre, barra no trapézio, joelho da perna de trabalho quase estendido.",
    instructions: steps(
      "Desça o calcanhar da perna de apoio.",
      "Suba na ponta do pé até contrair.",
      "Complete as repetições e troque o lado.",
      "Não jogue o quadril para o lado."
    ),
    commonErrors: CALF_ERR.concat(["Inclinar o tronco para compensar."]),
    importantTips: [
      "Comece pelo lado mais fraco.",
      "Mesma amplitude nos dois lados."
    ]
  }),
  row({
    id: "panturrilha-pe",
    displayName: "Panturrilha em Pé",
    sourceName: "lever standing calf raise",
    sourceId: "ykUOVze",
    equipment: "Máquina",
    equipmentId: "maquina",
    level: "iniciante",
    secondaryMuscles: GASTROC,
    description: "Elevação clássica em pé na máquina. Joelho estendido, maior ativação do gastrocnêmio.",
    startingPosition: "Ombros sob as almofadas, pontas dos pés na plataforma, tronco ereto, joelhos quase estendidos.",
    instructions: steps(
      "Solte o seguro e alongue o calcanhar.",
      "Suba na ponta dos pés até o topo.",
      "Aperte a panturrilha.",
      "Desça lento até alongar de novo."
    ),
    commonErrors: CALF_ERR,
    importantTips: RAISE_TIPS
  }),
  row({
    id: "skipping-joelho-alto",
    displayName: "Skipping (Joelho Alto)",
    sourceName: "high knee against wall",
    sourceId: "ealLwvX",
    equipment: "Peso corporal",
    equipmentId: "peso-corporal",
    level: "iniciante",
    exerciseType: "composto",
    secondaryMuscles: ["Quadríceps", "Core"],
    description: "Corrida estacionária elevando os joelhos. Potência, resistência e ativação da panturrilha.",
    startingPosition: "Em pé, tronco alto, olhar à frente, cotovelos em 90°.",
    instructions: steps(
      "Eleve um joelho em direção ao peito.",
      "Alterne o outro no ritmo de corrida no lugar.",
      "Aterre na ponta do pé, não no calcanhar.",
      "Mantenha o tronco estável e os braços acompanhando."
    ),
    commonErrors: [
      "Inclinar o tronco para trás.",
      "Arrastar os pés no chão.",
      "Elevar pouco o joelho."
    ],
    importantTips: [
      "Pense em bater o chão com a ponta do pé.",
      "Ritmo alto por tempo, não por carga."
    ]
  }),
  row({
    id: "panturrilha-pe-halteres",
    displayName: "Panturrilha em Pé com Halteres",
    sourceName: "dumbbell standing calf raise",
    sourceId: "dPmaUaU",
    equipment: "Halteres",
    equipmentId: "halteres",
    level: "iniciante",
    secondaryMuscles: GASTROC,
    description: "Elevação de calcanhar em pé com um halter em cada mão. Alternativa quando não há máquina.",
    startingPosition: "Em pé, halteres ao lado do corpo, pontas dos pés no chão ou num step, joelhos quase estendidos.",
    instructions: steps(
      "Desça o calcanhar se estiver no step.",
      "Suba na ponta dos pés.",
      "Pause no topo.",
      "Desça com controle."
    ),
    commonErrors: CALF_ERR,
    importantTips: RAISE_TIPS.concat(["Pode fazer no degrau para ganhar amplitude."])
  }),
  row({
    id: "panturrilha-sentada-barra",
    displayName: "Panturrilha Sentada com Barra",
    sourceName: "barbell seated calf raise",
    sourceId: "ktsFQAZ",
    equipment: "Barra",
    equipmentId: "barra",
    level: "intermediario",
    secondaryMuscles: SOLEUS,
    description: "Panturrilha sentado usando a barra no colo. Mesmo foco no sóleo, sem máquina específica.",
    startingPosition: "Sentado no banco, pontas dos pés num step, barra almofadada sobre as coxas, tronco ereto.",
    instructions: steps(
      "Desça o calcanhar até alongar.",
      "Empurre só com a ponta dos pés e eleve os joelhos.",
      "Aperte no topo.",
      "Desça lento."
    ),
    commonErrors: CALF_ERR.concat(["Deixar a barra rolar nas coxas."]),
    importantTips: [
      "Use uma toalha ou pad entre a barra e as coxas.",
      "Joelhos ficam dobrados o tempo todo."
    ]
  }),
  row({
    id: "panturrilha-pe-kettlebell",
    displayName: "Panturrilha em Pé com Kettlebell",
    sourceName: "kettlebell standing calf raise",
    sourceId: "",
    equipment: "Kettlebell",
    equipmentId: "kettlebell",
    level: "iniciante",
    secondaryMuscles: GASTROC,
    description: "Elevação de calcanhar em pé segurando kettlebell. Pede força e um pouco mais de estabilidade.",
    startingPosition: "Em pé, kettlebell à frente ou ao lado, pontas dos pés no chão ou no step.",
    instructions: steps(
      "Trave o tronco e desça o calcanhar.",
      "Suba na ponta dos pés sem balançar o peso.",
      "Pause no topo.",
      "Desça com controle."
    ),
    commonErrors: CALF_ERR.concat(["Balançar o kettlebell para gerar impulso."]),
    importantTips: RAISE_TIPS
  }),
  row({
    id: "alongamento-panturrilha",
    displayName: "Alongamento de Panturrilha",
    sourceName: "standing calves calf stretch",
    sourceId: "qOKcgVP",
    equipment: "Peso corporal",
    equipmentId: "peso-corporal",
    level: "iniciante",
    exerciseType: "alongamento",
    secondaryMuscles: [],
    description: "Alongamento em pé para aumentar amplitude e flexibilidade da panturrilha.",
    startingPosition: "Em pé, uma perna à frente, a de trás estendida, calcanhar no chão.",
    instructions: steps(
      "Leve o peso à frente até sentir a panturrilha de trás.",
      "Mantenha o joelho de trás estendido.",
      "Segure 20 a 40 segundos sem quicar.",
      "Troque o lado."
    ),
    commonErrors: [
      "Tirar o calcanhar de trás do chão.",
      "Dobrar o joelho de trás e perder o alongamento.",
      "Prender a respiração."
    ],
    importantTips: [
      "O tronco pode inclinar um pouco à frente.",
      "Aumente a distância dos pés se precisar de mais tensão."
    ]
  }),
  row({
    id: "calcanhar-no-gluteo",
    displayName: "Calcanhar no Glúteo",
    sourceName: "butt kicks",
    sourceId: "",
    equipment: "Peso corporal",
    equipmentId: "peso-corporal",
    level: "iniciante",
    exerciseType: "alongamento",
    secondaryMuscles: ["Posteriores"],
    description: "Movimento dinâmico levando o calcanhar em direção ao glúteo. Aquecimento da cadeia posterior e da panturrilha.",
    startingPosition: "Em pé, tronco alto, olhar à frente.",
    instructions: steps(
      "Flexione um joelho e leve o calcanhar ao glúteo.",
      "Alterne o outro no ritmo de corrida leve.",
      "Aterre na ponta do pé.",
      "Mantenha o quadril estável, sem jogar o tronco à frente."
    ),
    commonErrors: [
      "Inclinar o tronco para alcançar o glúteo.",
      "Arrastar o pé no chão.",
      "Fazer o movimento só com o quadril."
    ],
    importantTips: [
      "O joelho aponta para baixo, não para o lado.",
      "Use como aquecimento antes das elevações."
    ]
  }),
  row({
    id: "panturrilha-hack",
    displayName: "Panturrilha Hack Machine",
    sourceName: "hack calf raise",
    sourceId: "2ORFMoR",
    equipment: "Máquina",
    equipmentId: "maquina",
    level: "intermediario",
    secondaryMuscles: GASTROC,
    description: "Elevação no hack. Costas apoiadas, mais estabilidade para aplicar carga na panturrilha.",
    startingPosition: "Costas no encosto, ombros sob os apoios, pontas dos pés na plataforma, joelhos quase estendidos.",
    instructions: steps(
      "Desça o calcanhar até alongar.",
      "Empurre só com a ponta dos pés.",
      "Pause no topo.",
      "Desça lento, sem soltar o encosto."
    ),
    commonErrors: CALF_ERR,
    importantTips: RAISE_TIPS.concat(["Não transforme o movimento em agachamento no hack."])
  }),
  row({
    id: "panturrilha-parede",
    displayName: "Panturrilha na Parede",
    sourceName: "calf stretch with hands against wall",
    sourceId: "m0tCHqc",
    equipment: "Peso corporal",
    equipmentId: "peso-corporal",
    level: "iniciante",
    exerciseType: "alongamento",
    secondaryMuscles: [],
    description: "Apoio nas mãos na parede. Alongamento e ativação da panturrilha com o corpo em linha.",
    startingPosition: "De frente para a parede, mãos na parede, uma perna atrás estendida, calcanhar no chão.",
    instructions: steps(
      "Incline o tronco em direção à parede.",
      "Mantenha o calcanhar de trás no chão.",
      "Sinta o alongamento e segure.",
      "Troque a perna de trás."
    ),
    commonErrors: [
      "Levantar o calcanhar de trás.",
      "Dobrar o joelho de trás demais.",
      "Encolher os ombros na parede."
    ],
    importantTips: [
      "O joelho da frente pode dobrar.",
      "Para ativar, faça pequenas elevações do calcanhar de trás depois do alongamento."
    ]
  }),
  row({
    id: "alongamento-panturrilha-sentado",
    displayName: "Alongamento de Panturrilha Sentado",
    sourceName: "seated calf stretch",
    sourceId: "17bqEXD",
    equipment: "Peso corporal",
    equipmentId: "peso-corporal",
    level: "iniciante",
    exerciseType: "alongamento",
    secondaryMuscles: SOLEUS,
    description: "Alongamento sentado, joelho mais dobrado. Maior foco no sóleo.",
    startingPosition: "Sentado no chão ou no banco, uma perna à frente, toalha ou mão no pé se precisar.",
    instructions: steps(
      "Puxe a ponta do pé em direção a você.",
      "Mantenha o joelho o mais estendido ou levemente dobrado, conforme o foco.",
      "Segure 20 a 40 segundos.",
      "Troque o lado."
    ),
    commonErrors: [
      "Arredondar a lombar só para alcançar o pé.",
      "Puxar com o impulso.",
      "Prender a respiração."
    ],
    importantTips: [
      "Joelho um pouco dobrado enfatiza o sóleo.",
      "Não force além de um alongamento confortável."
    ]
  })
];

import { trapezioExerciseIds } from "./trapezioExercises.js";
import { buildRow } from "./catalogBuilder.js";

function row(spec) {
  return buildRow(trapezioExerciseIds, Object.assign({ category: "trapezio" }, spec));
}

export const trapezioCatalog = [
  row({
    id: "encolhimento-halteres",
    displayName: "Encolhimento com Halteres",
    sourceName: "dumbbell shrug",
    sourceId: "NJzBsGJ",
    equipment: "Halteres",
    equipmentId: "halteres",
    level: "iniciante",
    secondaryMuscles: ["Ombros"],
    description: "Eleva os ombros com um halter em cada mão para isolar o trapézio superior, com amplitude livre e simetria entre os lados.",
    startingPosition: "Em pé, pés na largura dos ombros, um halter em cada mão ao lado do corpo, palmas voltadas para as coxas, tronco ereto e olhar à frente.",
    instructions: [
      { step: 1, text: "Trave o abdômen e deixe os braços longos, sem dobrar os cotovelos." },
      { step: 2, text: "Encolha os ombros em direção às orelhas, subindo na vertical." },
      { step: 3, text: "Aperte o trapézio no topo por um segundo." },
      { step: 4, text: "Desça os ombros com controle até a posição inicial." },
      { step: 5, text: "Repita sem balançar o tronco." }
    ],
    commonErrors: [
      "Dobrar os cotovelos e transformar o movimento em remada.",
      "Rolar os ombros para frente ou para trás.",
      "Usar impulso das pernas e da lombar."
    ],
    importantTips: [
      "Pense em elevar os ombros, não em puxar o peso com os braços.",
      "Mantenha o pescoço longo, sem encolher o queixo."
    ]
  }),
  row({
    id: "encolhimento-smith",
    displayName: "Encolhimento no Smith",
    sourceName: "smith back shrug",
    sourceId: "MzNnwx9",
    equipment: "Smith",
    equipmentId: "smith",
    level: "iniciante",
    secondaryMuscles: ["Ombros"],
    description: "Encolhimento na barra guiada do Smith, estável para sobrecarregar o trapézio sem se preocupar com o equilíbrio da barra.",
    startingPosition: "Em pé no Smith, barra à frente das coxas, pegada pronada um pouco mais larga que os ombros, joelho leve e tronco alinhado.",
    instructions: [
      { step: 1, text: "Trave a barra e deixe os braços estendidos." },
      { step: 2, text: "Eleve os ombros o máximo possível, sem flexionar os cotovelos." },
      { step: 3, text: "Segure a contração no topo." },
      { step: 4, text: "Desça a barra até alongar o trapézio, sem perder a postura." },
      { step: 5, text: "Repita no mesmo ritmo." }
    ],
    commonErrors: [
      "Ficar longe demais da barra e projetar o tronco.",
      "Usar só os braços para puxar.",
      "Descida rápida, sem controle."
    ],
    importantTips: [
      "Fique próximo da linha da barra.",
      "O Smith guia o caminho: foque só em subir e descer os ombros."
    ]
  }),
  row({
    id: "encolhimento-barra-reta",
    displayName: "Encolhimento com Barra Reta",
    sourceName: "barbell shrug",
    sourceId: "dG7tG5y",
    equipment: "Barra",
    equipmentId: "barra",
    level: "iniciante",
    secondaryMuscles: ["Ombros"],
    description: "Clássico de trapézio com barra reta à frente do corpo. Permite carga alta e contração forte na porção superior.",
    startingPosition: "Em pé, pés na largura dos ombros, barra à frente das coxas com pegada pronada, braços estendidos e peito aberto.",
    instructions: [
      { step: 1, text: "Segure a barra com as mãos um pouco além da largura dos ombros." },
      { step: 2, text: "Eleve os ombros em direção às orelhas, barra colada ao corpo." },
      { step: 3, text: "Aperte o trapézio no ponto mais alto." },
      { step: 4, text: "Desça a barra até os ombros alongarem, sem soltar a tensão." },
      { step: 5, text: "Repita sem inclinar o tronco para trás." }
    ],
    commonErrors: [
      "Balançar a barra para frente e para trás.",
      "Flexionar os cotovelos.",
      "Hiperextender a lombar para ajudar a carga."
    ],
    importantTips: [
      "Carga pesada só com o movimento curto e limpo.",
      "Expire na subida e mantenha o olhar à frente."
    ]
  }),
  row({
    id: "encolhimento-polia",
    displayName: "Encolhimento na Polia",
    sourceName: "cable shrug",
    sourceId: "Eg98Ft9",
    equipment: "Polia",
    equipmentId: "polia",
    level: "iniciante",
    secondaryMuscles: ["Ombros"],
    description: "Encolhimento na polia baixa, com tensão contínua no trapézio do início ao fim da repetição.",
    startingPosition: "De frente para a polia baixa, pés na largura dos ombros, puxador na mão com pegada pronada, braços longos e tronco ereto.",
    instructions: [
      { step: 1, text: "Afaste um passo da torre para a cabo ficar tenso já na largada." },
      { step: 2, text: "Encolha os ombros para cima, sem dobrar os cotovelos." },
      { step: 3, text: "Segure a contração no topo." },
      { step: 4, text: "Desça os ombros com controle até alongar." },
      { step: 5, text: "Não deixe o cabo puxar o tronco para frente." }
    ],
    commonErrors: [
      "Ficar colado na torre e perder a linha do cabo.",
      "Usar os bíceps para puxar.",
      "Inclinar o tronco para compensar."
    ],
    importantTips: [
      "A polia não descansa no ponto baixo: controle a descida.",
      "Pode usar barra reta ou dois cabos, um em cada mão."
    ]
  })
];

import { tricepsExerciseIds } from "./tricepsExercises.js";
import { buildRow } from "./catalogBuilder.js";

function row(spec) {
  return buildRow(tricepsExerciseIds, Object.assign({
    category: "triceps",
    exerciseType: spec.exerciseType || "isolamento"
  }, spec));
}

function steps(...texts) {
  return texts.map((text, i) => ({ step: i + 1, text }));
}

const PUSH_ERR = [
  "Abrir os cotovelos para os lados.",
  "Acompanhar o movimento com o tronco e os ombros.",
  "Travar o cotovelo com impacto no fundo."
];
const FRENCH_ERR = [
  "Deixar os cotovelos abrirem para os lados.",
  "Mover o braço inteiro em vez de só o antebraço.",
  "Arquear a lombar para empurrar a carga."
];
const SKULL_ERR = [
  "Deixar os úmeros caírem em direção à cabeça.",
  "Abrir os cotovelos demais.",
  "Descer a carga sem controle."
];
const DIP_ERR = [
  "Abrir os cotovelos para os lados e jogar o trabalho no peito.",
  "Encostar o queixo no peito e perder a linha do tronco.",
  "Descer além do confortável dos ombros."
];

export const tricepsCatalog = [
  row({
    id: "triceps-polia-barra-reta",
    displayName: "Tríceps na Polia com Barra Reta",
    sourceName: "cable pushdown",
    sourceId: "3ZflifB",
    equipment: "Polia",
    equipmentId: "polia",
    level: "iniciante",
    secondaryMuscles: ["Antebraço"],
    description: "Pushdown clássico na polia alta com barra reta. Isola o tríceps com os cotovelos fixos ao lado do tronco.",
    startingPosition: "Em pé de frente para a polia alta, pés na largura dos ombros, barra reta na pegada pronada, cotovelos colados ao tronco, antebraços paralelos ao chão.",
    instructions: steps(
      "Trave o abdômen e mantenha os ombros baixos.",
      "Estenda os cotovelos e empurre a barra para baixo até quase travar.",
      "Aperte o tríceps no ponto baixo, sem mover os úmeros.",
      "Volte com controle até os antebraços ficarem paralelos ao chão.",
      "Só os antebraços se movem; os cotovelos ficam no mesmo lugar."
    ),
    commonErrors: PUSH_ERR,
    importantTips: [
      "Expire na descida da barra.",
      "Se o punho doer, troque pela barra V ou W."
    ]
  }),
  row({
    id: "triceps-polia-corda",
    displayName: "Tríceps na Polia com Corda",
    sourceName: "cable pushdown (with rope attachment)",
    sourceId: "dU605di",
    equipment: "Polia",
    equipmentId: "polia",
    level: "iniciante",
    secondaryMuscles: ["Antebraço"],
    description: "Pushdown na polia alta com corda. No final da extensão, afasta as pontas para aumentar a contração das cabeças laterais.",
    startingPosition: "Em pé de frente para a polia alta, uma ponta da corda em cada mão, pegada neutra, cotovelos junto ao tronco.",
    instructions: steps(
      "Deixe o cabo tenso com os cotovelos fixos.",
      "Estenda os braços para baixo até quase travar os cotovelos.",
      "No final, afaste levemente as pontas da corda para os lados.",
      "Aperte o tríceps com as mãos afastadas.",
      "Una a corda de novo na subida controlada."
    ),
    commonErrors: [
      "Abrir os cotovelos no meio do caminho.",
      "Afastar a corda cedo demais, antes de estender.",
      "Inclinar o tronco para acompanhar a carga."
    ],
    importantTips: [
      "A abertura da corda é curta e só no final.",
      "Punhos firmes, sem deixar a corda girar."
    ]
  }),
  row({
    id: "triceps-frances-halter-unilateral",
    displayName: "Tríceps Francês com Halter — Unilateral",
    sourceName: "dumbbell standing one arm extension",
    sourceId: "BCUR88E",
    equipment: "Halteres",
    equipmentId: "halteres",
    level: "intermediario",
    secondaryMuscles: ["Ombros"],
    description: "Extensão acima da cabeça com um halter. O braço superior fica vertical; só o antebraço sobe e desce atrás da cabeça.",
    startingPosition: "Em pé, um halter acima da cabeça com uma mão, braço estendido na vertical, cotovelo apontando para o teto, outra mão pode apoiar o cotovelo.",
    instructions: steps(
      "Trave o core e mantenha o úmero ao lado da cabeça.",
      "Flexione o cotovelo e leve o halter para trás da cabeça.",
      "Desça até alongar o tríceps, sem abrir o cotovelo para o lado.",
      "Estenda o braço de volta até o peso ficar acima da cabeça.",
      "Termine a série e troque o lado."
    ),
    commonErrors: FRENCH_ERR,
    importantTips: [
      "A mão livre no cotovelo ajuda a manter o braço parado.",
      "Carga moderada: o alongamento pede controle."
    ]
  }),
  row({
    id: "triceps-testa-corda-polia",
    displayName: "Tríceps Testa com Corda na Polia",
    sourceName: "cable rope incline tricep extension",
    sourceId: "ZujAdR9",
    equipment: "Polia",
    equipmentId: "polia",
    level: "intermediario",
    secondaryMuscles: ["Antebraço"],
    description: "Extensão na polia com o tronco inclinado e a corda próxima à cabeça. Os antebraços partem da testa e avançam até a extensão.",
    startingPosition: "Corpo inclinado à frente, corda na polia, mãos ao lado da cabeça, cotovelos elevados e fixos, olhar à frente.",
    instructions: steps(
      "Trave o tronco na inclinação e deixe os cotovelos altos.",
      "Estenda os cotovelos à frente até os braços quase retos.",
      "Aperte o tríceps no final, sem baixar os úmeros.",
      "Volte a corda em direção à testa com controle.",
      "Não transforme o movimento em pushdown de pé."
    ),
    commonErrors: SKULL_ERR,
    importantTips: [
      "Os cotovelos ficam na altura da cabeça o tempo todo.",
      "Carga que permita o arco completo até a testa."
    ]
  }),
  row({
    id: "triceps-testa-halteres",
    displayName: "Tríceps Testa com Halteres",
    sourceName: "dumbbell lying triceps extension",
    sourceId: "mpKZGWz",
    equipment: "Halteres",
    equipmentId: "halteres",
    level: "intermediario",
    secondaryMuscles: ["Antebraço"],
    description: "Skull crusher com dois halteres no banco. Os braços apontam para cima; só os antebraços levam os pesos até perto da cabeça.",
    startingPosition: "Deitado no banco reto, um halter em cada mão, braços estendidos acima do peito, palmas se olhando ou para a frente, cotovelos estáveis.",
    instructions: steps(
      "Trave os ombros para os úmeros não caírem.",
      "Flexione os cotovelos e leve os halteres em direção às têmporas.",
      "Pare quando os antebraços estiverem próximos da cabeça.",
      "Estenda os braços de volta até o ponto alto.",
      "Os braços superiores permanecem praticamente parados."
    ),
    commonErrors: SKULL_ERR,
    importantTips: [
      "Não encoste os halteres na testa: controle a descida.",
      "Se o cotovelo doer, encurte um pouco o fundo."
    ]
  }),
  row({
    id: "triceps-unilateral-polia-corda",
    displayName: "Tríceps Unilateral na Polia com Corda",
    sourceName: "cable one arm tricep pushdown",
    sourceId: "qRZ5S1N",
    equipment: "Polia",
    equipmentId: "polia",
    level: "iniciante",
    secondaryMuscles: ["Antebraço"],
    description: "Pushdown de um braço na polia alta com corda. O cotovelo fica ao lado do corpo; só aquele antebraço trabalha.",
    startingPosition: "De lado ou de frente para a polia alta, uma ponta da corda na mão, cotovelo colado ao tronco, ombro baixo.",
    instructions: steps(
      "Afaste um passo da torre para o cabo nascer tenso.",
      "Estenda o cotovelo para baixo até quase travar.",
      "Aperte o tríceps no fundo.",
      "Volte lentamente até o antebraço ficar paralelo ao chão.",
      "Termine o lado e troque o braço."
    ),
    commonErrors: [
      "Abrir o cotovelo para o lado.",
      "Girar o tronco a cada repetição.",
      "Usar o ombro para puxar a corda."
    ],
    importantTips: [
      "A mão livre pode apoiar o cotovelo de trabalho.",
      "Série unilateral ajuda a igualar os lados."
    ]
  }),
  row({
    id: "extensao-triceps-maquina",
    displayName: "Extensão de Tríceps na Máquina",
    sourceName: "lever triceps extension",
    sourceId: "Ser9eQp",
    equipment: "Máquina",
    equipmentId: "maquina",
    level: "iniciante",
    secondaryMuscles: [],
    description: "Extensão guiada na máquina de tríceps. Os antebraços acompanham a alavanca contra a resistência.",
    startingPosition: "Sentado, costas no encosto, braços posicionados nos apoios ou pegas, cotovelos alinhados com o eixo da máquina, pés no chão.",
    instructions: steps(
      "Ajuste o banco para os ombros ficarem relaxados.",
      "Estenda os cotovelos contra a alavanca.",
      "Aperte o tríceps no final, sem impactar a trava.",
      "Volte com controle até a flexão inicial.",
      "Não levante o quadril do banco."
    ),
    commonErrors: [
      "Usar o tronco para empurrar o encosto.",
      "Cotovelos fora da linha do eixo.",
      "Descida rápida, deixando o peso cair."
    ],
    importantTips: [
      "A máquina guia: foque em contrair, não em acelerar.",
      "Amplitude completa sem dor no cotovelo."
    ]
  }),
  row({
    id: "mergulho-assistido-ajoelhado",
    displayName: "Mergulho Assistido — Ajoelhado",
    sourceName: "assisted triceps dip (kneeling)",
    sourceId: "J60bN17",
    equipment: "Máquina",
    equipmentId: "maquina",
    level: "iniciante",
    exerciseType: "composto",
    secondaryMuscles: ["Peito", "Ombros"],
    description: "Mergulho na máquina assistida com os joelhos na plataforma. O corpo sobe e desce; a plataforma acompanha e reduz a carga.",
    startingPosition: "Joelhos na plataforma assistida, mãos nas barras paralelas, tronco ereto, cotovelos quase estendidos.",
    instructions: steps(
      "Trave o abdômen e deixe os ombros baixos.",
      "Flexione os cotovelos e desça o corpo até os braços formarem cerca de 90°.",
      "Mantenha os cotovelos próximos ao tronco.",
      "Empurre as barras e suba até quase estender.",
      "A plataforma sobe e desce junto com você."
    ),
    commonErrors: DIP_ERR,
    importantTips: [
      "Mais assistência = mais fácil. Reduza conforme evoluir.",
      "Não encolha o pescoço na descida."
    ]
  }),
  row({
    id: "mergulho-paralelas-triceps",
    displayName: "Mergulho nas Paralelas",
    sourceName: "triceps dip",
    sourceId: "X6C6i5Y",
    equipment: "Peso corporal",
    equipmentId: "peso-corporal",
    level: "avancado",
    exerciseType: "composto",
    secondaryMuscles: ["Peito", "Ombros"],
    description: "Mergulho com o corpo suspenso nas barras paralelas. O corpo inteiro se desloca na vertical; cotovelos próximos isolam mais o tríceps.",
    startingPosition: "Suspenso nas paralelas, braços estendidos, tronco quase vertical, pernas juntas ou levemente à frente, ombros longe das orelhas.",
    instructions: steps(
      "Trave o core para o corpo não balançar.",
      "Flexione os cotovelos e desça até os ombros ficarem um pouco abaixo dos cotovelos.",
      "Mantenha o tronco mais ereto para enfatizar o tríceps.",
      "Empurre as barras até voltar à posição inicial.",
      "Não jogue o peito à frente como no mergulho de peito."
    ),
    commonErrors: DIP_ERR,
    importantTips: [
      "Se doer o ombro, encurte a descida.",
      "Cinto com anilha só com a técnica estável."
    ]
  }),
  row({
    id: "triceps-coice-polia-corda-unilateral",
    displayName: "Tríceps Coice na Polia com Corda — Unilateral",
    sourceName: "cable kickback",
    sourceId: "HEJ6DIX",
    equipment: "Polia",
    equipmentId: "polia",
    level: "intermediario",
    secondaryMuscles: [],
    description: "Kickback unilateral na polia com corda. O tronco inclina, o cotovelo fica junto ao corpo e só o antebraço vai para trás.",
    startingPosition: "Tronco inclinado, um passo à frente, uma ponta da corda na mão, cotovelo colado ao tronco e elevado, antebraço apontando para o chão.",
    instructions: steps(
      "Trave o tronco e o úmero no lugar.",
      "Estenda o cotovelo e leve o antebraço para trás até o braço ficar alinhado ao tronco.",
      "Aperte o tríceps no final do coice.",
      "Volte até cerca de 90° no cotovelo, sem cair o braço superior.",
      "Troque o lado ao terminar a série."
    ),
    commonErrors: [
      "Balançar o tronco a cada extensão.",
      "Dropar o cotovelo na volta.",
      "Usar o ombro para empurrar a corda."
    ],
    importantTips: [
      "Carga leve: o valor está no braço parado.",
      "Olhar o chão um pouco à frente ajuda a postura."
    ]
  }),
  row({
    id: "triceps-frances-halter",
    displayName: "Tríceps Francês com Halter",
    sourceName: "dumbbell standing triceps extension",
    sourceId: "PdmaD0N",
    equipment: "Halteres",
    equipmentId: "halteres",
    level: "iniciante",
    secondaryMuscles: ["Ombros"],
    description: "Francês em pé com um halter nas duas mãos. O peso sobe e desce na vertical atrás da cabeça.",
    startingPosition: "Em pé, um halter seguro pelas duas mãos acima da cabeça, cotovelos apontando para o teto, próximo às orelhas.",
    instructions: steps(
      "Trave o abdômen e evite arquear a lombar.",
      "Flexione os cotovelos e leve o halter para trás da cabeça.",
      "Desça até alongar, sem abrir os cotovelos.",
      "Estenda os braços até o peso voltar acima da cabeça.",
      "O úmero permanece vertical o tempo todo."
    ),
    commonErrors: FRENCH_ERR,
    importantTips: [
      "Segure o disco de cima ou o cabo do halter com as duas mãos.",
      "Pode fazer sentado se o tronco balançar."
    ]
  }),
  row({
    id: "triceps-polia-barra-v",
    displayName: "Tríceps na Polia com Barra V",
    sourceName: "cable triceps pushdown (v-bar)",
    sourceId: "gAwDzB3",
    equipment: "Polia",
    equipmentId: "polia",
    level: "iniciante",
    secondaryMuscles: ["Antebraço"],
    description: "Pushdown na polia alta com barra V. Pegada mais natural que a barra reta; a barra percorre a trajetória vertical.",
    startingPosition: "Em pé de frente para a polia alta, barra V na pegada pronada, cotovelos junto ao tronco, antebraços paralelos ao chão.",
    instructions: steps(
      "Trave os cotovelos ao lado do corpo.",
      "Empurre a barra V para baixo até estender os braços.",
      "Aperte o tríceps no fundo.",
      "Retorne com controle até a largada.",
      "Não deixe a barra puxar os ombros para cima."
    ),
    commonErrors: PUSH_ERR,
    importantTips: [
      "A curva da V costuma ser mais confortável para o punho.",
      "Mesmo padrão do pushdown com barra reta."
    ]
  }),
  row({
    id: "extensao-triceps-maquina-sentada",
    displayName: "Extensão de Tríceps na Máquina — Variação Sentada",
    sourceName: "lever triceps extension",
    sourceId: "Ser9eQp",
    equipment: "Máquina",
    equipmentId: "maquina",
    level: "iniciante",
    secondaryMuscles: [],
    description: "Variação sentada da extensão na máquina. Braços apoiados; a alavanca acompanha a extensão dos cotovelos.",
    startingPosition: "Sentado com os braços apoiados no equipamento, cotovelos no eixo da máquina, pegada firme, costas no encosto.",
    instructions: steps(
      "Ajuste apoios para os ombros não subirem.",
      "Estenda os cotovelos contra a resistência.",
      "Aperte o tríceps no ponto estendido.",
      "Volte controladamente até a flexão.",
      "Mantenha o quadril e as costas colados no banco."
    ),
    commonErrors: [
      "Levantar o quadril para completar a carga.",
      "Cotovelos escorregando do apoio.",
      "Travar o cotovelo com pancada."
    ],
    importantTips: [
      "Cadência lenta rende mais nesta máquina.",
      "Útil para aprender o padrão antes da carga livre."
    ]
  }),
  row({
    id: "mergulho-assistido-triceps",
    displayName: "Mergulho Assistido para Tríceps",
    sourceName: "lever overhand triceps dip",
    sourceId: "D5yqP2p",
    equipment: "Máquina",
    equipmentId: "maquina",
    level: "iniciante",
    exerciseType: "composto",
    secondaryMuscles: ["Peito", "Ombros"],
    description: "Mergulho na máquina assistida. A plataforma reduz o peso do corpo; tríceps empurra para subir.",
    startingPosition: "Apoiado na plataforma da máquina, mãos nas pegas, tronco ereto, cotovelos quase estendidos.",
    instructions: steps(
      "Escolha a assistência e trave o core.",
      "Flexione os cotovelos e desça o corpo.",
      "Mantenha os cotovelos próximos para o tríceps liderar.",
      "Empurre até voltar à posição alta.",
      "Corpo e plataforma se movem na vertical juntos."
    ),
    commonErrors: DIP_ERR,
    importantTips: [
      "Tronco mais vertical = mais tríceps.",
      "Progressão: menos assistência, depois paralelas livres."
    ]
  }),
  row({
    id: "triceps-coice-polia-corda",
    displayName: "Tríceps Coice na Polia com Corda",
    sourceName: "cable two arm tricep kickback",
    sourceId: "vvNjDJS",
    equipment: "Polia",
    equipmentId: "polia",
    level: "intermediario",
    secondaryMuscles: [],
    description: "Kickback bilateral na polia baixa com corda. Tronco inclinado, cotovelos para trás; os dois antebraços fazem o coice ao mesmo tempo.",
    startingPosition: "De frente para a polia baixa, tronco inclinado, uma ponta da corda em cada mão, cotovelos elevados e próximos ao tronco.",
    instructions: steps(
      "Trave o quadril e os úmeros.",
      "Estenda os dois cotovelos para trás ao mesmo tempo.",
      "Aperte o tríceps com os braços alinhados ao tronco.",
      "Volte até cerca de 90° nos cotovelos.",
      "Não levante o tronco a cada repetição."
    ),
    commonErrors: [
      "Transformar em remada, puxando os cotovelos.",
      "Usar o quadril como balanço.",
      "Carga alta que impede a extensão completa."
    ],
    importantTips: [
      "Pense em dois coices simétricos.",
      "Carga menor que o pushdown."
    ]
  }),
  row({
    id: "triceps-testa-polia-barra-w",
    displayName: "Tríceps Testa na Polia com Barra W",
    sourceName: "cable incline triceps extension",
    sourceId: "Hx1WC8I",
    equipment: "Polia",
    equipmentId: "polia",
    level: "intermediario",
    secondaryMuscles: ["Antebraço"],
    description: "Skull crusher na polia com barra W. A barra vai da testa para a frente quando os cotovelos se estendem.",
    startingPosition: "Cotovelos elevados, barra W próxima à testa, tronco estável (em pé inclinado ou no banco), pegada nas curvas da W.",
    instructions: steps(
      "Fixe os cotovelos na altura da cabeça.",
      "Estenda os braços e leve a barra para a frente e para cima.",
      "Aperte o tríceps no final da extensão.",
      "Flexione e aproxime a barra da testa de novo.",
      "Não deixe os úmeros caírem."
    ),
    commonErrors: SKULL_ERR,
    importantTips: [
      "A W alivia o punho em relação à barra reta.",
      "O cabo não descansa: controle a volta."
    ]
  }),
  row({
    id: "triceps-testa-polia-corda",
    displayName: "Tríceps Testa na Polia com Corda",
    sourceName: "cable lying triceps extension v. 2",
    sourceId: "uxJcFUU",
    equipment: "Polia",
    equipmentId: "polia",
    level: "intermediario",
    secondaryMuscles: ["Antebraço"],
    description: "Testa na polia com corda. Cotovelos elevados; a corda se aproxima da cabeça na flexão e acompanha o arco dos antebraços na extensão.",
    startingPosition: "Deitado ou inclinado, corda nas mãos ao lado da cabeça, cotovelos altos e fixos, cabo tenso.",
    instructions: steps(
      "Deixe os cotovelos apontando para a frente ou para o teto.",
      "Estenda os braços até quase travar.",
      "Aperte o tríceps no ponto longo.",
      "Flexione e aproxime a corda da cabeça.",
      "A corda segue o arco dos antebraços, sem puxar com os ombros."
    ),
    commonErrors: SKULL_ERR,
    importantTips: [
      "Pode abrir um pouco a corda no final da extensão.",
      "Mesma lógica da testa com halter, com tensão contínua."
    ]
  }),
  row({
    id: "triceps-polia-barra-w",
    displayName: "Tríceps na Polia com Barra W",
    sourceName: "active style cable pushdown",
    sourceId: "w7obpWd",
    equipment: "Polia",
    equipmentId: "polia",
    level: "iniciante",
    secondaryMuscles: ["Antebraço"],
    description: "Pushdown tradicional na polia alta com barra W. Cotovelos junto ao corpo; movimento semelhante ao da barra reta, com pegada mais confortável.",
    startingPosition: "Em pé de frente para a polia alta, barra W na pegada pronada nas curvas, cotovelos colados ao tronco.",
    instructions: steps(
      "Trave o core e os cotovelos.",
      "Empurre a barra para baixo até estender os braços.",
      "Aperte o tríceps no fundo.",
      "Retorne até os antebraços ficarem paralelos ao chão.",
      "Não acompanhe com o tronco."
    ),
    commonErrors: PUSH_ERR,
    importantTips: [
      "A W costuma doer menos o punho que a reta.",
      "Mesma cadência do pushdown clássico."
    ]
  }),
  row({
    id: "triceps-polia-um-braco",
    displayName: "Tríceps na Polia com Um Braço",
    sourceName: "cable standing one arm triceps extension",
    sourceId: "sYCcnon",
    equipment: "Polia",
    equipmentId: "polia",
    level: "iniciante",
    secondaryMuscles: ["Antebraço"],
    description: "Extensão unilateral na polia alta com pegador. Só o antebraço do lado trabalhado se move; o cotovelo fica próximo ao corpo.",
    startingPosition: "De lado para a polia alta, pegador na mão, cotovelo junto ao tronco, ombro baixo, tronco ereto.",
    instructions: steps(
      "Afaste um passo e deixe o cabo tenso.",
      "Estenda o cotovelo para baixo até quase travar.",
      "Aperte o tríceps no fundo.",
      "Volte com controle até cerca de 90°.",
      "Não gire o tronco nem abra o cotovelo."
    ),
    commonErrors: [
      "Puxar com o ombro.",
      "Inclinar o tronco para o lado.",
      "Folga no cabo no ponto alto."
    ],
    importantTips: [
      "Pegada pronada ou neutra, a que manter o cotovelo estável.",
      "Compare as reps dos dois lados."
    ]
  }),
  row({
    id: "triceps-frances-sentado-halter",
    displayName: "Tríceps Francês Sentado com Halter",
    sourceName: "dumbbell seated triceps extension",
    sourceId: "kont8Ut",
    equipment: "Halteres",
    equipmentId: "halteres",
    level: "iniciante",
    secondaryMuscles: ["Ombros"],
    description: "Francês sentado com um halter nas duas mãos. O tronco fica imóvel; o peso sobe e desce atrás da cabeça.",
    startingPosition: "Sentado no banco, pés no chão, halter acima da cabeça com as duas mãos, cotovelos junto às orelhas.",
    instructions: steps(
      "Apoie as costas se o banco tiver encosto.",
      "Flexione os cotovelos e leve o halter para trás da cabeça.",
      "Desça até alongar o tríceps.",
      "Estenda os braços até o peso voltar ao alto.",
      "Não balance o tronco para trás."
    ),
    commonErrors: FRENCH_ERR,
    importantTips: [
      "Sentado já tira o impulso das pernas.",
      "Encosto ajuda a não arquear a lombar."
    ]
  }),
  row({
    id: "triceps-frances-elastico",
    displayName: "Tríceps Francês com Elástico",
    sourceName: "band side triceps extension",
    sourceId: "obe5LMq",
    equipment: "Elástico",
    equipmentId: "elastico",
    level: "iniciante",
    secondaryMuscles: ["Ombros"],
    description: "Extensão de tríceps com faixa elástica. As mãos ficam atrás ou acima da cabeça; a tensão da faixa cresce conforme os braços estendem.",
    startingPosition: "Em pé sobre a faixa ou com ela ancorada, mãos atrás ou acima da cabeça segurando o elástico, cotovelos altos, faixa já com leve tensão.",
    instructions: steps(
      "Trave o elástico para ele não escapar.",
      "Estenda os cotovelos contra a faixa.",
      "Aperte o tríceps no ponto mais tenso.",
      "Flexione de volta com controle.",
      "Mantenha os úmeros parados."
    ),
    commonErrors: [
      "Soltar a faixa no fundo.",
      "Abrir os cotovelos.",
      "Usar o tronco para esticar o elástico."
    ],
    importantTips: [
      "Afaste os pés ou encurte a faixa para mais resistência.",
      "Bom para casa ou aquecimento."
    ]
  }),
  row({
    id: "triceps-invertido-polia-barra",
    displayName: "Tríceps Invertido na Polia com Barra",
    sourceName: "cable reverse-grip pushdown",
    sourceId: "VjYliFZ",
    equipment: "Polia",
    equipmentId: "polia",
    level: "intermediario",
    secondaryMuscles: ["Antebraço"],
    description: "Pushdown com pegada supinada (palmas para cima). Enfatiza a cabeça medial do tríceps; cotovelos fixos ao tronco.",
    startingPosition: "Em pé de frente para a polia alta, barra reta com pegada supinada, cotovelos junto ao tronco, antebraços paralelos ao chão.",
    instructions: steps(
      "Segure a barra com as palmas voltadas para cima.",
      "Estenda os cotovelos e empurre a barra para baixo.",
      "Aperte o tríceps no fundo.",
      "Volte com controle.",
      "Não deixe os pulsos quebrar para trás."
    ),
    commonErrors: [
      "Abrir os cotovelos.",
      "Usar o tronco.",
      "Carga alta demais para a pegada invertida."
    ],
    importantTips: [
      "Carga menor que o pushdown pronado.",
      "Punhos alinhados com o antebraço."
    ]
  }),
  row({
    id: "triceps-kickback-halteres",
    displayName: "Tríceps Kickback com Halteres",
    sourceName: "dumbbell one arm kickback",
    sourceId: "bQy2Eni",
    equipment: "Halteres",
    equipmentId: "halteres",
    level: "iniciante",
    secondaryMuscles: [],
    description: "Coice com halter e um braço apoiado no banco. O cotovelo fica elevado; o halter vai para trás e volta até cerca de 90°.",
    startingPosition: "Um joelho e a mão de apoio no banco, tronco paralelo ao chão, halter na outra mão, cotovelo colado ao tronco na altura do ombro.",
    instructions: steps(
      "Trave o úmero paralelo ao chão.",
      "Estenda o antebraço para trás até o braço ficar alinhado.",
      "Aperte o tríceps no final, sem girar o tronco.",
      "Volte o halter até o antebraço ficar vertical (cerca de 90°).",
      "Não balançar o tronco a cada rep."
    ),
    commonErrors: [
      "Dropar o cotovelo na descida.",
      "Usar o ombro como pêndulo.",
      "Carga que impede a extensão completa."
    ],
    importantTips: [
      "Halter leve e contração nítida no topo.",
      "Olhe o chão, pescoço longo."
    ]
  }),
  row({
    id: "triceps-testa-barra-reta",
    displayName: "Tríceps Testa com Barra Reta",
    sourceName: "barbell lying triceps extension skull crusher",
    sourceId: "h8LFzo9",
    equipment: "Barra",
    equipmentId: "barra",
    level: "intermediario",
    secondaryMuscles: ["Antebraço"],
    description: "Skull crusher clássico no banco com barra reta. A barra desce em direção à testa e volta com a extensão dos cotovelos.",
    startingPosition: "Deitado no banco reto, barra reta acima do peito com pegada pronada um pouco mais fechada que os ombros, braços estendidos.",
    instructions: steps(
      "Trave os ombros para os braços não caírem.",
      "Flexione os cotovelos e leve a barra em direção à testa.",
      "Pare o movimento perto da cabeça, com controle.",
      "Estenda os braços até a barra voltar acima do peito.",
      "Úmeros praticamente parados o tempo todo."
    ),
    commonErrors: SKULL_ERR,
    importantTips: [
      "Se o punho ou o cotovelo reclamarem, use a barra W.",
      "Spotter nas cargas maiores."
    ]
  }),
  row({
    id: "triceps-testa-unilateral-halter",
    displayName: "Tríceps Testa Unilateral com Halter",
    sourceName: "dumbbell lying single extension",
    sourceId: "6MfS53i",
    equipment: "Halteres",
    equipmentId: "halteres",
    level: "intermediario",
    secondaryMuscles: ["Antebraço"],
    description: "Testa de um braço no banco. Um único antebraço se move; o halter chega perto da cabeça e volta na extensão.",
    startingPosition: "Deitado no banco, um braço estendido para cima com o halter, cotovelo estável, outra mão pode apoiar o cotovelo de trabalho.",
    instructions: steps(
      "Aponte o braço para o teto e trave o ombro.",
      "Flexione só o cotovelo e leve o peso próximo à cabeça.",
      "Desça até alongar o tríceps.",
      "Estenda de volta até o braço ficar reto.",
      "Troque o lado ao terminar."
    ),
    commonErrors: [
      "Deixar o cotovelo abrir para o lado.",
      "Mover o ombro inteiro.",
      "Bater o halter na cabeça."
    ],
    importantTips: [
      "A mão livre no cotovelo isola melhor.",
      "Compare a amplitude dos dois lados."
    ]
  }),
  row({
    id: "triceps-supino-reto-pegada-fechada",
    displayName: "Tríceps no Supino Reto — Pegada Fechada",
    sourceName: "barbell close-grip bench press",
    sourceId: "J6Dx1Mu",
    equipment: "Barra",
    equipmentId: "barra",
    level: "intermediario",
    exerciseType: "composto",
    secondaryMuscles: ["Peito", "Ombros"],
    description: "Supino reto com pegada mais fechada. A barra sobe e desce sobre o peito; cotovelos próximos ao corpo jogam o trabalho no tríceps.",
    startingPosition: "Deitado no banco reto, barra na largura dos ombros ou um pouco mais fechada, pés no chão, escápulas no banco.",
    instructions: steps(
      "Desencaixe a barra e estenda os braços acima do peito.",
      "Desça a barra em direção ao peito médio, cotovelos próximos ao tronco.",
      "Toque o peito com controle, sem abrir os cotovelos.",
      "Empurre a barra para cima até quase travar.",
      "Não use pegada tão fechada a ponto de doer o punho."
    ),
    commonErrors: [
      "Pegada excessivamente fechada e punhos quebrados.",
      "Cotovelos abertos como no supino de peito.",
      "Quicar a barra no esterno."
    ],
    importantTips: [
      "Pegada na largura dos ombros já fecha o suficiente.",
      "Bom exercício composto para sobrecarregar o tríceps."
    ]
  }),
  row({
    id: "triceps-mergulho-maquina",
    displayName: "Tríceps Mergulho Máquina",
    sourceName: "lever seated dip",
    sourceId: "BRImeP8",
    equipment: "Máquina",
    equipmentId: "maquina",
    level: "iniciante",
    exerciseType: "composto",
    secondaryMuscles: ["Peito", "Ombros"],
    description: "Mergulho sentado na máquina. As mãos nas alças laterais empurram para baixo; os braços acompanham as alavancas.",
    startingPosition: "Sentado, tronco ereto, mãos nas alças laterais, cotovelos flexionados ao lado do corpo, pés apoiados.",
    instructions: steps(
      "Ajuste o banco para os ombros ficarem baixos.",
      "Empurre as alças para baixo estendendo os cotovelos.",
      "Aperte o tríceps no fundo.",
      "Volte lentamente até a flexão inicial.",
      "Não encolha o pescoço nem abra os cotovelos."
    ),
    commonErrors: [
      "Usar o trapézio e encolher os ombros.",
      "Empurrar com o peito, abrindo os cotovelos.",
      "Amplitude curta demais."
    ],
    importantTips: [
      "Tronco colado no encosto.",
      "Boa ponte para o mergulho livre."
    ]
  }),
  row({
    id: "triceps-mergulho-banco",
    displayName: "Tríceps Mergulho no Banco",
    sourceName: "bench dip (knees bent)",
    sourceId: "RrLske5",
    equipment: "Peso corporal",
    equipmentId: "peso-corporal",
    level: "iniciante",
    exerciseType: "composto",
    secondaryMuscles: ["Peito", "Ombros"],
    description: "Mergulho com as mãos no banco atrás do corpo e as pernas à frente. O quadril sobe e desce próximo ao banco.",
    startingPosition: "Mãos no bordo do banco atrás do quadril, dedos para a frente, pernas estendidas ou joelhos dobrados, braços quase estendidos.",
    instructions: steps(
      "Deixe o quadril perto do banco, sem sentar.",
      "Flexione os cotovelos e desça o quadril.",
      "Desça até os braços formarem cerca de 90°.",
      "Empurre o banco e suba o corpo.",
      "Cotovelos para trás, não para os lados."
    ),
    commonErrors: [
      "Afastar o quadril demais e sobrecarregar o ombro.",
      "Encolher o pescoço.",
      "Descer além do que o ombro aguenta."
    ],
    importantTips: [
      "Joelhos dobrados facilitam; pernas estendidas exigem mais.",
      "Pés no chão o tempo todo nesta versão."
    ]
  }),
  row({
    id: "triceps-frances-unilateral-elastico",
    displayName: "Tríceps Francês Unilateral com Elástico",
    sourceName: "dynamic style band side triceps extension",
    sourceId: "omsF3RN",
    equipment: "Elástico",
    equipmentId: "elastico",
    level: "iniciante",
    secondaryMuscles: ["Ombros"],
    description: "Francês de um braço com faixa. O braço fica elevado junto à cabeça; só aquele antebraço se move enquanto o elástico estica.",
    startingPosition: "Em pé, um braço elevado ao lado da cabeça segurando a faixa, cotovelo apontando para o teto, outra mão ou o dono da faixa ancorado.",
    instructions: steps(
      "Ancore bem a faixa (pé, porta ou a outra mão).",
      "Flexione o cotovelo e leve a mão atrás da cabeça.",
      "Estenda o braço contra a resistência.",
      "Aperte o tríceps no ponto mais tenso.",
      "Volte com controle e troque o lado."
    ),
    commonErrors: [
      "Abrir o cotovelo para o lado.",
      "Puxar a faixa com o tronco.",
      "Perder a âncora no meio da série."
    ],
    importantTips: [
      "A tensão cresce na extensão: não solte no topo.",
      "Útil para igualar os braços em casa."
    ]
  }),
  row({
    id: "triceps-maquina",
    displayName: "Tríceps Máquina",
    sourceName: "lever triceps extension",
    sourceId: "Ser9eQp",
    equipment: "Máquina",
    equipmentId: "maquina",
    level: "iniciante",
    secondaryMuscles: [],
    description: "Extensão na máquina específica de tríceps. Sentado nos apoios, empurra as alavancas com os cotovelos e volta controlado.",
    startingPosition: "Sentado conforme os apoios da máquina, mãos nas pegas, cotovelos alinhados ao eixo, tronco estável.",
    instructions: steps(
      "Ajuste banco e apoios antes de carregar o pin.",
      "Empurre as alavancas estendendo os cotovelos.",
      "Aperte o tríceps no final.",
      "Retorne até a flexão sem perder o contato dos braços.",
      "Braços e alavancas se movem juntos."
    ),
    commonErrors: [
      "Banco alto ou baixo demais, fora do eixo.",
      "Usar o tronco.",
      "Travar o cotovelo com impacto."
    ],
    importantTips: [
      "O eixo da máquina deve coincidir com o cotovelo.",
      "Boa escolha para iniciar o treino de tríceps."
    ]
  })
];

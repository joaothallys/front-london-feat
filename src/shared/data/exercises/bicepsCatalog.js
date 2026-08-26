import { bicepsExerciseIds } from "./bicepsExercises.js";
import { buildRow } from "./catalogBuilder.js";

function row(spec) {
  return buildRow(bicepsExerciseIds, Object.assign({
    category: "biceps",
    exerciseType: spec.exerciseType || "isolamento"
  }, spec));
}

function steps(...texts) {
  return texts.map((text, i) => ({ step: i + 1, text }));
}

const CURL_ERR = [
  "Balançar o tronco para levantar a carga.",
  "Deixar os cotovelos avançarem demais para a frente.",
  "Encurtar a amplitude no alto ou embaixo."
];

const HAMMER_SEC = ["Braquial", "Antebraço"];
const FOREARM = ["Antebraço"];
const REV_SEC = ["Braquiorradial", "Antebraço"];

export const bicepsCatalog = [
  row({
    id: "rosca-direta-barra-reta",
    displayName: "Rosca Direta com Barra Reta",
    sourceName: "barbell curl",
    sourceId: "25GPyDY",
    equipment: "Barra",
    equipmentId: "barra",
    level: "iniciante",
    secondaryMuscles: FOREARM,
    description: "Rosca clássica com barra reta em pé. Isola o bíceps com os dois braços ao mesmo tempo e permite sobrecarga progressiva.",
    startingPosition: "Em pé, pés na largura dos ombros, barra à frente das coxas com pegada supinada na largura dos ombros, cotovelos colados ao tronco e olhar à frente.",
    instructions: steps(
      "Trave o abdômen e mantenha o peito aberto, sem balançar o tronco.",
      "Flexione os cotovelos e suba a barra até a altura do peito.",
      "Aperte o bíceps no topo, sem projetar os ombros para frente.",
      "Desça a barra com controle até alongar quase por completo.",
      "Repita no mesmo ritmo, cotovelos fixos ao lado do corpo."
    ),
    commonErrors: CURL_ERR,
    importantTips: [
      "Se o punho doer, troque pela barra W.",
      "Expire na subida e mantenha os ombros baixos."
    ]
  }),
  row({
    id: "rosca-biceps-halteres-alternada",
    displayName: "Rosca Bíceps com Halteres (Alternada)",
    sourceName: "dumbbell alternate biceps curl",
    sourceId: "BU15nH4",
    equipment: "Halteres",
    equipmentId: "halteres",
    level: "iniciante",
    secondaryMuscles: FOREARM,
    description: "Rosca em pé com um braço de cada vez. Facilita corrigir assimetrias e manter o cotovelo estável.",
    startingPosition: "Em pé, um halter em cada mão ao lado do corpo, palmas voltadas para as coxas, ombros baixos e tronco ereto.",
    instructions: steps(
      "Gire o pulso do braço de trabalho para supinação enquanto sobe o halter.",
      "Leve o peso até a altura do ombro, sem mover o cotovelo para a frente.",
      "Aperte o bíceps no topo por um segundo.",
      "Desça com controle e volte a palma para a coxa.",
      "Alterne o outro braço no mesmo padrão."
    ),
    commonErrors: [
      "Subir os dois braços ao mesmo tempo sem controle.",
      "Inclinar o tronco para o lado do braço que sobe.",
      "Girar o tronco em vez de isolar o cotovelo."
    ],
    importantTips: [
      "O cotovelo fica no mesmo ponto do início ao fim.",
      "Comece pelo lado mais fraco se houver diferença."
    ]
  }),
  row({
    id: "rosca-direta-barra-w",
    displayName: "Rosca Direta com Barra W",
    sourceName: "ez barbell curl",
    sourceId: "6TG6x2w",
    equipment: "Barra",
    equipmentId: "barra",
    level: "iniciante",
    secondaryMuscles: FOREARM,
    description: "Mesmo padrão da rosca direta, com a curva da barra W aliviando punhos e permitindo pegada mais natural.",
    startingPosition: "Em pé, barra W à frente das coxas, pegada nas curvas internas com palmas semissupinadas, cotovelos junto ao tronco.",
    instructions: steps(
      "Trave o core e deixe os ombros baixos.",
      "Suba a barra flexionando só os cotovelos.",
      "Pare quando os antebraços estiverem quase verticais.",
      "Desça até alongar o bíceps, sem soltar a tensão.",
      "Repita sem usar o quadril."
    ),
    commonErrors: CURL_ERR,
    importantTips: [
      "Use a curva da barra: não force pegada totalmente reta.",
      "Carga um pouco maior que a barra reta, se o punho agradecer."
    ]
  }),
  row({
    id: "rosca-scott-barra-w",
    displayName: "Rosca Scott com Barra W",
    sourceName: "ez barbell close grip preacher curl",
    sourceId: "hacCyUv",
    equipment: "Barra",
    equipmentId: "barra",
    level: "intermediario",
    secondaryMuscles: FOREARM,
    description: "Rosca no banco Scott com barra W. O apoio do braço tira o impulso e isola o bíceps, especialmente a cabeça curta.",
    startingPosition: "Sentado no Scott, axilas no topo da almofada, braços estendidos sobre o apoio, barra W com pegada um pouco mais fechada que os ombros.",
    instructions: steps(
      "Ajuste o banco para os ombros ficarem relaxados, sem encostar o peito na almofada com força.",
      "Suba a barra até quase o ombro, sem levantar os cotovelos do apoio.",
      "Aperte o bíceps no topo.",
      "Desça até alongar, parando antes de hiperextender o cotovelo.",
      "Repita com o mesmo tempo de descida."
    ),
    commonErrors: [
      "Levantar o quadril do banco no final da subida.",
      "Estender o cotovelo até travar no fundo.",
      "Usar pegada larga demais e perder o isolamento."
    ],
    importantTips: [
      "A parte mais difícil é o início da subida: não dê um tranco.",
      "Mantenha os pulsos alinhados com o antebraço."
    ]
  }),
  row({
    id: "rosca-unilateral-biceps-polia",
    displayName: "Rosca Unilateral de Bíceps na Polia",
    sourceName: "cable one arm curl",
    sourceId: "YTur5nR",
    equipment: "Polia",
    equipmentId: "polia",
    level: "iniciante",
    secondaryMuscles: FOREARM,
    description: "Rosca de um braço na polia baixa. A tensão do cabo se mantém no bíceps do início ao fim da repetição.",
    startingPosition: "De lado ou de frente para a polia baixa, pega o cabo com uma mão em supinação, cotovelo junto ao tronco, pé da frente firme.",
    instructions: steps(
      "Afaste um passo da torre para o cabo já nascer tenso.",
      "Flexione o cotovelo e leve a mão em direção ao ombro.",
      "Aperte o bíceps no topo sem girar o tronco.",
      "Desça até alongar, sem deixar o cabo puxar o ombro para frente.",
      "Termine a série e troque o braço."
    ),
    commonErrors: [
      "Ficar colado na torre e perder a linha do cabo.",
      "Abrir o cotovelo para o lado.",
      "Usar o tronco para completar a subida."
    ],
    importantTips: [
      "A polia não descansa embaixo: controle a volta.",
      "Olhe à frente, não para a mão."
    ]
  }),
  row({
    id: "rosca-biceps-alongada-unilateral-polia",
    displayName: "Rosca Bíceps Alongada Unilateral na Polia",
    sourceName: "cable one arm preacher curl",
    sourceId: "eHBlPsa",
    equipment: "Polia",
    equipmentId: "polia",
    level: "intermediario",
    secondaryMuscles: FOREARM,
    description: "Variação unilateral na polia com o braço mais alongado atrás da linha do tronco, enfatizando o estiramento do bíceps.",
    startingPosition: "De lado para a polia baixa, um passo à frente, braço de trabalho um pouco atrás do tronco, cabo na mão em supinação, tronco inclinado só o necessário.",
    instructions: steps(
      "Deixe o bíceps alongado na largada, sem hiperextender o cotovelo.",
      "Flexione o cotovelo mantendo o úmero estável.",
      "Suba até a contração máxima sem avançar o ombro.",
      "Desça até alongar de novo, cabo sempre tenso.",
      "Complete o lado e troque."
    ),
    commonErrors: [
      "Transformar o movimento em remada, puxando o cotovelo para trás.",
      "Inclinar demais o tronco.",
      "Encurtar a fase alongada."
    ],
    importantTips: [
      "Pense em rosca, não em puxar o cabo para o quadril.",
      "Carga moderada: o alongamento pede controle."
    ]
  }),
  row({
    id: "rosca-biceps-halteres",
    displayName: "Rosca Bíceps com Halteres",
    sourceName: "dumbbell biceps curl",
    sourceId: "NbVPDMW",
    equipment: "Halteres",
    equipmentId: "halteres",
    level: "iniciante",
    secondaryMuscles: FOREARM,
    description: "Rosca simultânea com dois halteres em pé. Permite giro natural do pulso e amplitude livre de cada braço.",
    startingPosition: "Em pé, um halter em cada mão ao lado do corpo, palmas voltadas para a frente ou começando neutras, cotovelos junto ao tronco.",
    instructions: steps(
      "Trave o abdômen e evite jogar o quadril para frente.",
      "Suba os dois halteres ao mesmo tempo até a altura dos ombros.",
      "Aperte os bíceps no topo.",
      "Desça com controle até alongar.",
      "Repita sem bater os pesos nas coxas."
    ),
    commonErrors: CURL_ERR,
    importantTips: [
      "Se um lado falhar primeiro, termine o outro com menos reps.",
      "Pode iniciar com pegada neutra e supinar na subida."
    ]
  }),
  row({
    id: "rosca-martelo-cruzada-halteres",
    displayName: "Rosca Martelo Cruzada com Halteres",
    sourceName: "dumbbell cross body hammer curl",
    sourceId: "Qyk5J3p",
    equipment: "Halteres",
    equipmentId: "halteres",
    level: "intermediario",
    secondaryMuscles: HAMMER_SEC,
    description: "Rosca martelo levando o halter em direção ao ombro oposto. Enfatiza braquial e porção lateral do antebraço.",
    startingPosition: "Em pé, halteres ao lado do corpo com pegada neutra (polegares para cima), tronco ereto e cotovelos baixos.",
    instructions: steps(
      "Suba um halter em diagonal, cruzando à frente do tronco rumo ao ombro contrário.",
      "Mantenha a pegada neutra o tempo todo.",
      "Aperte o braquial no topo.",
      "Desça até o halter voltar ao lado da coxa.",
      "Alterne o outro braço."
    ),
    commonErrors: [
      "Girar o tronco para ajudar o cruzamento.",
      "Abrir o cotovelo para o lado em vez de cruzar.",
      "Usar impulso do ombro."
    ],
    importantTips: [
      "O cotovelo aponta para baixo, não para o lado.",
      "Movimento curto e limpo vale mais que carga alta."
    ]
  }),
  row({
    id: "rosca-martelo-halteres",
    displayName: "Rosca Martelo com Halteres",
    sourceName: "dumbbell hammer curl",
    sourceId: "slDvUAU",
    equipment: "Halteres",
    equipmentId: "halteres",
    level: "iniciante",
    secondaryMuscles: HAMMER_SEC,
    description: "Rosca com pegada neutra. Trabalha bíceps, braquial e antebraço, útil para volume do braço e pegada.",
    startingPosition: "Em pé, um halter em cada mão ao lado do corpo, palmas se olhando, cotovelos colados ao tronco.",
    instructions: steps(
      "Suba os halteres na vertical, como se segurasse um martelo.",
      "Pare na altura do ombro sem avançar o cotovelo.",
      "Aperte o braquial no topo.",
      "Desça até alongar.",
      "Pode fazer os dois juntos ou alternado."
    ),
    commonErrors: CURL_ERR,
    importantTips: [
      "Não deixe o halter girar para supinação.",
      "Punhos firmes, sem deixar o peso cair para trás."
    ]
  }),
  row({
    id: "rosca-martelo-polia-corda",
    displayName: "Rosca Martelo na Polia com Corda",
    sourceName: "cable hammer curl (with rope)",
    sourceId: "HPlPoQA",
    equipment: "Polia",
    equipmentId: "polia",
    level: "iniciante",
    secondaryMuscles: HAMMER_SEC,
    description: "Rosca martelo na polia baixa com corda. Tensão contínua e pegada neutra estável.",
    startingPosition: "De frente para a polia baixa, uma ponta da corda em cada mão, pegada neutra, cotovelos junto ao tronco, um passo atrás da torre.",
    instructions: steps(
      "Deixe o cabo tenso com os braços quase estendidos.",
      "Flexione os cotovelos e suba as pontas da corda até a altura do peito.",
      "Afaste um pouco as mãos no topo para aumentar a contração.",
      "Desça controlando o cabo.",
      "Não deixe os cotovelos abrirem."
    ),
    commonErrors: [
      "Puxar a corda com os ombros.",
      "Ficar longe demais e inclinar o tronco.",
      "Bater as mãos no peito sem controlar."
    ],
    importantTips: [
      "A abertura da corda no topo é curta.",
      "Tronco parado, só o antebraço se move."
    ]
  }),
  row({
    id: "rosca-scott-maquina",
    displayName: "Rosca Scott na Máquina",
    sourceName: "lever preacher curl",
    sourceId: "b6hQYMb",
    equipment: "Máquina",
    equipmentId: "maquina",
    level: "iniciante",
    secondaryMuscles: FOREARM,
    description: "Rosca no preacher de alavanca. Trajeto guiado, fácil de aprender e seguro para isolar o bíceps.",
    startingPosition: "Sentado, peito próximo ao apoio, axilas no topo da almofada, mãos nas pegas em supinação, braços alongados sobre o banco.",
    instructions: steps(
      "Ajuste o banco para os ombros não subirem.",
      "Flexione os cotovelos e puxe as pegas em direção aos ombros.",
      "Aperte o bíceps no topo.",
      "Desça até alongar, sem travar o cotovelo.",
      "Repita no mesmo arco da máquina."
    ),
    commonErrors: [
      "Levantar os cotovelos da almofada.",
      "Usar o tronco para empurrar o peito no apoio.",
      "Descida rápida, deixando o peso cair."
    ],
    importantTips: [
      "A máquina guia: foque em contrair, não em acelerar.",
      "Série com cadência lenta rende mais aqui."
    ]
  }),
  row({
    id: "rosca-biceps-polia-baixa-barra-reta",
    displayName: "Rosca bíceps na Polia Baixa (Barra Reta)",
    sourceName: "cable curl",
    sourceId: "G08RZcQ",
    equipment: "Polia",
    equipmentId: "polia",
    level: "iniciante",
    secondaryMuscles: FOREARM,
    description: "Rosca direta na polia baixa com barra reta. Tensão constante, boa para finalizar o treino de bíceps.",
    startingPosition: "De frente para a polia baixa, barra reta na pegada supinada na largura dos ombros, cotovelos junto ao tronco, um passo atrás.",
    instructions: steps(
      "Trave o core com o cabo já tenso.",
      "Suba a barra até a altura do peito.",
      "Aperte o bíceps sem projetar os ombros.",
      "Desça até alongar, cabo sem folga.",
      "Repita sem balançar o quadril."
    ),
    commonErrors: CURL_ERR,
    importantTips: [
      "Fique perto o suficiente para o cabo subir na vertical.",
      "Não encoste a barra no corpo no fundo."
    ]
  }),
  row({
    id: "rosca-biceps-sentado-halteres",
    displayName: "Rosca Bíceps Sentado com Halteres",
    sourceName: "dumbbell seated bicep curl",
    sourceId: "xiA6lRr",
    equipment: "Halteres",
    equipmentId: "halteres",
    level: "iniciante",
    secondaryMuscles: FOREARM,
    description: "Rosca sentada com dois halteres. O banco reduz o impulso das pernas e do quadril.",
    startingPosition: "Sentado no banco, pés no chão, costas apoiadas ou eretas, um halter em cada mão ao lado das coxas, palmas à frente.",
    instructions: steps(
      "Encoste as costas se o banco tiver encosto.",
      "Suba os dois halteres até os ombros.",
      "Aperte o bíceps no topo.",
      "Desça até os pesos quase tocarem as coxas.",
      "Não balance o tronco para trás."
    ),
    commonErrors: [
      "Arquear a lombar no encosto.",
      "Levantar o quadril do banco.",
      "Bater o halter na coxa e perder tensão."
    ],
    importantTips: [
      "Sentado já tira trapaça: use isso a favor da carga honesta.",
      "Cotovelos apontando para o chão."
    ]
  }),
  row({
    id: "rosca-biceps-sobre-cabeca-polia",
    displayName: "Rosca Bíceps Sobre a Cabeça na Polia",
    sourceName: "cable overhead curl",
    sourceId: "wDUqY2u",
    equipment: "Polia",
    equipmentId: "polia",
    level: "intermediario",
    secondaryMuscles: FOREARM,
    description: "Rosca com os braços elevados, cabos vindo de cima. Alonga a cabeça longa do bíceps em um ângulo incomum.",
    startingPosition: "No centro da polia alta, um cabo em cada mão, braços abertos e elevados, cotovelos altos, palmas para cima, tronco estável.",
    instructions: steps(
      "Deixe os cotovelos altos e fixos, alinhados com os ombros.",
      "Flexione os cotovelos e leve as mãos em direção às orelhas ou à nuca.",
      "Aperte o bíceps no ponto mais curto.",
      "Abra de volta até alongar, sem baixar os cotovelos.",
      "Não deixe o tronco avançar."
    ),
    commonErrors: [
      "Baixar os cotovelos e transformar em rosca comum.",
      "Arquear a lombar.",
      "Usar carga que fecha o movimento pela metade."
    ],
    importantTips: [
      "Pense em um 'bíceps de crucifixo': só o antebraço se move.",
      "Carga leve a moderada."
    ]
  }),
  row({
    id: "rosca-concentrada",
    displayName: "Rosca Concentrada",
    sourceName: "dumbbell concentration curl",
    sourceId: "gvsWLQw",
    equipment: "Halteres",
    equipmentId: "halteres",
    level: "iniciante",
    secondaryMuscles: FOREARM,
    description: "Rosca unilateral sentada com o cotovelo apoiado na face interna da coxa. Isolamento máximo e pico de contração.",
    startingPosition: "Sentado, pernas abertas, tronco inclinado à frente, cotovelo do braço de trabalho apoiado na coxa interna, halter pendurado com o braço alongado.",
    instructions: steps(
      "Apoie o cotovelo firme na coxa, sem encostar o peso no chão se ainda houver tensão.",
      "Flexione o cotovelo e suba o halter em direção ao ombro.",
      "Aperte o bíceps no topo, sem girar o tronco.",
      "Desça até alongar.",
      "Termine o lado e troque."
    ),
    commonErrors: [
      "Usar o ombro e o tronco para balançar o peso.",
      "Tirar o cotovelo do apoio.",
      "Encurtar a descida."
    ],
    importantTips: [
      "Olhe o bíceps trabalhar: o ritmo costuma melhorar.",
      "Não precisa de carga alta."
    ]
  }),
  row({
    id: "rosca-biceps-banco-inclinado",
    displayName: "Rosca bíceps no Banco Inclinado",
    sourceName: "dumbbell incline biceps curl",
    sourceId: "F3xgbjF",
    equipment: "Halteres",
    equipmentId: "halteres",
    level: "intermediario",
    secondaryMuscles: FOREARM,
    description: "Rosca no banco inclinado, braços pendurados atrás da linha do tronco. Alonga a cabeça longa do bíceps.",
    startingPosition: "Deitado no banco a cerca de 45–60°, um halter em cada mão, braços pendurados ao lado do banco, palmas à frente, ombros baixos.",
    instructions: steps(
      "Mantenha as costas e a cabeça no banco.",
      "Flexione os cotovelos e suba os halteres sem levantar os ombros do encosto.",
      "Aperte no topo.",
      "Desça até alongar de verdade, com controle.",
      "Não deixe os cotovelos avançarem à frente do tronco."
    ),
    commonErrors: [
      "Arquejar e sair do banco na subida.",
      "Encurtar o alongamento embaixo.",
      "Carga alta demais para o ângulo alongado."
    ],
    importantTips: [
      "Comece mais leve que a rosca em pé.",
      "O valor do exercício está na descida lenta."
    ]
  }),
  row({
    id: "rosca-biceps-inversa-polia-baixa",
    displayName: "Rosca bíceps inversa na Polia Baixa",
    sourceName: "cable reverse curl",
    sourceId: "eOG0r6v",
    equipment: "Polia",
    equipmentId: "polia",
    level: "intermediario",
    secondaryMuscles: REV_SEC,
    description: "Rosca com pegada pronada na polia baixa. Enfatiza braquiorradial e antebraço, com participação do bíceps.",
    startingPosition: "De frente para a polia baixa, barra reta com pegada pronada (palmas para baixo), cotovelos junto ao tronco, cabo tenso.",
    instructions: steps(
      "Mantenha os pulsos firmes, alinhados com o antebraço.",
      "Flexione os cotovelos e suba a barra até a altura do peito.",
      "Aperte antebraço e bíceps no topo.",
      "Desça com controle.",
      "Não deixe os pulsos quebrar para trás."
    ),
    commonErrors: [
      "Dobrar o pulso para cima para 'roubar' amplitude.",
      "Abrir os cotovelos.",
      "Usar o tronco."
    ],
    importantTips: [
      "Carga menor que a rosca supinada.",
      "Útil no final do treino de braço ou para antebraço."
    ]
  }),
  row({
    id: "rosca-direta-um-braco-polia",
    displayName: "Rosca Direta com Um Braço na Polia",
    sourceName: "cable seated one arm concentration curl",
    sourceId: "rZ80Gbp",
    equipment: "Polia",
    equipmentId: "polia",
    level: "intermediario",
    secondaryMuscles: FOREARM,
    description: "Rosca concentrada na polia, em geral sentado. Isola um braço com tensão contínua do cabo.",
    startingPosition: "Sentado de lado ou de frente para a polia baixa, um cabo na mão, cotovelo apoiado na coxa ou fixo ao lado do tronco, braço alongado.",
    instructions: steps(
      "Ajuste a distância para o cabo não folgar embaixo.",
      "Flexione só o cotovelo e leve a mão ao ombro.",
      "Aperte o bíceps no topo.",
      "Desça até alongar.",
      "Troque o lado ao terminar a série."
    ),
    commonErrors: [
      "Girar o tronco a cada repetição.",
      "Usar o ombro para puxar o cabo.",
      "Folga no cabo no ponto baixo."
    ],
    importantTips: [
      "Trate como concentrada: um músculo, um caminho.",
      "Série unilateral ajuda a igualar os lados."
    ]
  }),
  row({
    id: "rosca-martelo-cruzada-polia",
    displayName: "Rosca Martelo Cruzada na Polia",
    sourceName: "cable rope one arm hammer preacher curl",
    sourceId: "4hATdoB",
    equipment: "Polia",
    equipmentId: "polia",
    level: "intermediario",
    secondaryMuscles: HAMMER_SEC,
    description: "Martelo unilateral na polia, muitas vezes com corda e apoio. Cruza ou sobe em pegada neutra com tensão constante.",
    startingPosition: "De lado para a polia baixa, uma ponta da corda na mão em pegada neutra, cotovelo estável, tronco alinhado.",
    instructions: steps(
      "Deixe o cabo tenso com o braço alongado.",
      "Flexione o cotovelo em pegada de martelo, podendo cruzar à frente do corpo.",
      "Aperte o braquial no topo.",
      "Desça até alongar.",
      "Complete o lado e troque."
    ),
    commonErrors: [
      "Puxar com o ombro.",
      "Girar o tronco no cruzamento.",
      "Soltar a pegada neutra."
    ],
    importantTips: [
      "Se usar preacher, não levante o cotovelo do apoio.",
      "Carga moderada e cadência lenta."
    ]
  }),
  row({
    id: "rosca-biceps-spider-halteres",
    displayName: "Rosca bíceps Spider com Halteres",
    sourceName: "dumbbell prone incline curl",
    sourceId: "mwpPcr1",
    equipment: "Halteres",
    equipmentId: "halteres",
    level: "avancado",
    secondaryMuscles: FOREARM,
    description: "Peito apoiado no banco inclinado, braços pendurados à frente. Tira o impulso e pede contração forte no pico.",
    startingPosition: "Deitado de bruços no banco inclinado, peito na almofada, pés firmes no chão, um halter em cada mão pendurado à frente, palmas para cima.",
    instructions: steps(
      "Deixe os ombros estáveis sobre o banco.",
      "Flexione os cotovelos e suba os halteres em direção aos ombros.",
      "Aperte o bíceps no topo, sem encostar os pesos no banco.",
      "Desça até alongar, sem balançar.",
      "Mantenha a cabeça alinhada, sem olhar demais para cima."
    ),
    commonErrors: [
      "Levantar o peito do banco.",
      "Usar um balanço dos halteres.",
      "Encurtar o topo, onde o exercício mais pede."
    ],
    importantTips: [
      "Banco por volta de 45°.",
      "Carga bem menor que a rosca em pé."
    ]
  }),
  row({
    id: "rosca-biceps-barra-reta-invertida",
    displayName: "Rosca bíceps com Barra Reta",
    sourceName: "inverted row",
    sourceId: "bZGHsAZ",
    equipment: "Peso corporal",
    equipmentId: "peso-corporal",
    level: "intermediario",
    exerciseType: "composto",
    secondaryMuscles: ["Costas", "Antebraço"],
    description: "Remada invertida com ênfase em bíceps (pegada mais fechada ou supinada). Usa o peso do corpo pendurado na barra.",
    startingPosition: "Deitado sob uma barra fixa na altura da cintura, mãos na barra, corpo em prancha dos calcanhares à cabeça, braços estendidos.",
    instructions: steps(
      "Trave o abdômen e o glúteo para o corpo ficar em linha.",
      "Puxe o peito em direção à barra flexionando os cotovelos.",
      "Aperte costas e bíceps no topo.",
      "Desça até os braços alongarem, sem deixar o quadril cair.",
      "Quanto mais horizontal o corpo, mais difícil."
    ),
    commonErrors: [
      "Deixar o quadril afundar.",
      "Puxar só o pescoço em direção à barra.",
      "Usar impulso das pernas."
    ],
    importantTips: [
      "Pegada supinada aumenta a demanda do bíceps.",
      "Dobre os joelhos para facilitar."
    ]
  }),
  row({
    id: "rosca-biceps-polia-baixa-barra-w",
    displayName: "Rosca bíceps na Polia Baixa (Barra W)",
    sourceName: "cable close grip curl",
    sourceId: "BCGQ6J5",
    equipment: "Polia",
    equipmentId: "polia",
    level: "iniciante",
    secondaryMuscles: FOREARM,
    description: "Rosca na polia baixa com barra W e pegada mais fechada. Confortável para os punhos e boa contração no pico.",
    startingPosition: "De frente para a polia baixa, barra W nas curvas internas, pegada semissupinada um pouco fechada, cotovelos junto ao tronco.",
    instructions: steps(
      "Afaste um passo e deixe o cabo tenso.",
      "Suba a barra até a altura do peito.",
      "Aperte o bíceps no topo.",
      "Desça controlando.",
      "Mantenha os cotovelos parados."
    ),
    commonErrors: CURL_ERR,
    importantTips: [
      "Pegada fechada enfatiza a cabeça curta.",
      "Não encoste a barra no corpo no fundo."
    ]
  }),
  row({
    id: "rosca-martelo-sentado-halteres",
    displayName: "Rosca martelo sentado com Halteres",
    sourceName: "dumbbell seated hammer curl",
    sourceId: "IGtBdNT",
    equipment: "Halteres",
    equipmentId: "halteres",
    level: "iniciante",
    secondaryMuscles: HAMMER_SEC,
    description: "Martelo sentado. Mesmo padrão da versão em pé, com menos chance de usar o quadril.",
    startingPosition: "Sentado, pés no chão, um halter em cada mão ao lado das coxas, pegada neutra, tronco ereto.",
    instructions: steps(
      "Apoie as costas se houver encosto.",
      "Suba os halteres na vertical até os ombros.",
      "Aperte o braquial no topo.",
      "Desça até alongar.",
      "Não gire o pulso para supinação."
    ),
    commonErrors: [
      "Balançar o tronco para trás.",
      "Bater o peso na coxa.",
      "Abrir os cotovelos."
    ],
    importantTips: [
      "Pode alternar os braços para mais foco.",
      "Punhos firmes o tempo todo."
    ]
  }),
  row({
    id: "rosca-scott-barra-reta",
    displayName: "Rosca Scott com Barra Reta",
    sourceName: "barbell preacher curl",
    sourceId: "qOgPVf6",
    equipment: "Barra",
    equipmentId: "barra",
    level: "intermediario",
    secondaryMuscles: FOREARM,
    description: "Scott com barra reta. Isolamento rígido; a barra reta pede punhos estáveis e carga honesta.",
    startingPosition: "Sentado no Scott, axilas no topo da almofada, barra reta com pegada supinada na largura dos ombros, braços alongados sobre o apoio.",
    instructions: steps(
      "Ajuste a altura para não encolher os ombros.",
      "Suba a barra até quase o ombro.",
      "Aperte o bíceps sem levantar os cotovelos.",
      "Desça até alongar, sem travar o cotovelo.",
      "Repita na mesma linha."
    ),
    commonErrors: [
      "Tranco no fundo da repetição.",
      "Levantar o quadril.",
      "Punhos quebrando para trás."
    ],
    importantTips: [
      "Se o punho incomodar, volte para a barra W.",
      "Parceiro só para as últimas reps, não para o tranco inicial."
    ]
  }),
  row({
    id: "rosca-scott-halteres",
    displayName: "Rosca Scott com Halteres",
    sourceName: "dumbbell preacher curl",
    sourceId: "jivWf8n",
    equipment: "Halteres",
    equipmentId: "halteres",
    level: "intermediario",
    secondaryMuscles: FOREARM,
    description: "Scott unilateral ou bilateral com halteres. Corrige diferenças entre os braços e permite giro do pulso.",
    startingPosition: "Sentado no Scott, um ou dois halteres, braço alongado sobre a almofada, palma para cima, axila no topo do apoio.",
    instructions: steps(
      "Estabilize o ombro no apoio.",
      "Flexione o cotovelo e suba o halter.",
      "Aperte no topo.",
      "Desça até alongar, sem girar o tronco.",
      "Se for unilateral, termine o lado antes de trocar."
    ),
    commonErrors: [
      "Deixar o halter cair para o lado de fora da almofada.",
      "Levantar o cotovelo no topo.",
      "Usar o outro braço para empurrar."
    ],
    importantTips: [
      "Unilateral revela o lado mais fraco.",
      "Não estenda o cotovelo até doer."
    ]
  }),
  row({
    id: "rosca-biceps-sentado-alternado-halteres",
    displayName: "Rosca bíceps sentado alternado com Halteres",
    sourceName: "dumbbell alternating seated bicep curl on exercise ball",
    sourceId: "J74XlNf",
    equipment: "Halteres",
    equipmentId: "halteres",
    level: "iniciante",
    secondaryMuscles: FOREARM,
    description: "Rosca sentada alternada. Pode ser no banco ou na bola: um braço de cada vez, com menos impulso.",
    startingPosition: "Sentado, um halter em cada mão ao lado das coxas, palmas começando neutras ou à frente, tronco estável.",
    instructions: steps(
      "Suba um halter até o ombro, supinando o pulso se começou neutro.",
      "Aperte o bíceps e desça esse braço.",
      "Só então suba o outro.",
      "Mantenha o tronco quieto.",
      "Se estiver na bola, contraia o abdômen o tempo todo."
    ),
    commonErrors: [
      "Balançar para os lados a cada troca.",
      "Subir o segundo braço antes de terminar o primeiro.",
      "Perder o equilíbrio na bola."
    ],
    importantTips: [
      "No banco fixo o foco é o bíceps; na bola, o core também trabalha.",
      "Ritmo cadenciado, sem pressa."
    ]
  }),
  row({
    id: "biceps-unilateral-polia-alta",
    displayName: "Bíceps unilateral na Polia Alta",
    sourceName: "cable pulldown bicep curl",
    sourceId: "QTXKWPh",
    equipment: "Polia",
    equipmentId: "polia",
    level: "intermediario",
    secondaryMuscles: FOREARM,
    description: "Rosca puxando de cima com um braço. O cabo alto muda o ângulo e pede controle do cotovelo no espaço.",
    startingPosition: "De frente ou de lado para a polia alta, cabo na mão, cotovelo elevado à frente ou ao lado da cabeça, tronco estável.",
    instructions: steps(
      "Trave o ombro para o cotovelo não cair.",
      "Flexione o cotovelo e leve a mão em direção à têmpora ou ao ombro.",
      "Aperte o bíceps no ponto curto.",
      "Estenda até alongar, cabo tenso.",
      "Troque o braço ao fim da série."
    ),
    commonErrors: [
      "Transformar em puxada de costas, descendo o cotovelo.",
      "Inclinar o tronco para o lado.",
      "Carga que impede a flexão completa."
    ],
    importantTips: [
      "O úmero fica parado; só o antebraço viaja.",
      "Comece leve para achar o ângulo."
    ]
  }),
  row({
    id: "rosca-biceps-drag-barra",
    displayName: "Rosca Bíceps Drag com Barra",
    sourceName: "barbell drag curl",
    sourceId: "IENzBdA",
    equipment: "Barra",
    equipmentId: "barra",
    level: "intermediario",
    secondaryMuscles: FOREARM,
    description: "A barra 'arrasta' junto ao tronco, cotovelos indo para trás. Enfatiza a cabeça longa e reduz trapaça frontal.",
    startingPosition: "Em pé, barra reta à frente das coxas, pegada supinada, cotovelos um pouco atrás da linha do tronco, peito aberto.",
    instructions: steps(
      "Puxe a barra para cima colada ao corpo, como se a arrastasse na camisa.",
      "Os cotovelos recuam, não avançam.",
      "Pare na altura do peito baixo / abdomen alto.",
      "Desça a barra colada ao corpo.",
      "Não transforme em remada alta de ombro."
    ),
    commonErrors: [
      "Afastar a barra do corpo, voltando à rosca comum.",
      "Encolher os ombros até as orelhas.",
      "Usar o quadril."
    ],
    importantTips: [
      "Amplitude é menor que a rosca direta: isso é o padrão.",
      "Carga moderada."
    ]
  }),
  row({
    id: "rosca-biceps-alternada-elastico",
    displayName: "Rosca Bíceps alternada com Elástico",
    sourceName: "band alternating biceps curl",
    sourceId: "3omWx6P",
    equipment: "Elástico",
    equipmentId: "elastico",
    level: "iniciante",
    secondaryMuscles: FOREARM,
    description: "Rosca alternada com faixa elástica. A resistência cresce no topo, boa para casa ou aquecimento.",
    startingPosition: "Em pé sobre o meio da faixa, uma ponta em cada mão, palmas à frente, cotovelos junto ao tronco, faixa já com leve tensão.",
    instructions: steps(
      "Pise firme no elástico para ele não escapar.",
      "Suba uma mão até o ombro contra a faixa.",
      "Aperte o bíceps no topo, onde a faixa puxa mais.",
      "Desça controlando a volta.",
      "Alterne o outro braço."
    ),
    commonErrors: [
      "Pisar torto e deixar um lado mais frouxo.",
      "Balançar o tronco.",
      "Soltar a faixa no fundo."
    ],
    importantTips: [
      "Afaste os pés para aumentar a resistência.",
      "Útil em viagem ou no fim da série."
    ]
  }),
  row({
    id: "rosca-inclinada-polia",
    displayName: "Rosca Inclinada na Polia",
    sourceName: "cable two arm curl on incline bench",
    sourceId: "H9y3Dkr",
    equipment: "Polia",
    equipmentId: "polia",
    level: "intermediario",
    secondaryMuscles: FOREARM,
    description: "Rosca de dois braços na polia com o banco inclinado. Combina alongamento do inclinado com tensão do cabo.",
    startingPosition: "Banco inclinado de frente para a polia baixa, costas no encosto, um cabo em cada mão ou barra, braços alongados para trás e para baixo.",
    instructions: steps(
      "Ajuste o banco e a distância para o cabo nascer tenso.",
      "Flexione os cotovelos sem sair do encosto.",
      "Aperte o bíceps no topo.",
      "Desça até alongar os braços.",
      "Não deixe os ombros avançarem."
    ),
    commonErrors: [
      "Sair do banco na subida.",
      "Folga no cabo embaixo.",
      "Cotovelos viajando para a frente."
    ],
    importantTips: [
      "Mesma lógica da rosca inclinada com halter, com cabo que não descansa.",
      "Carga moderada."
    ]
  }),
  row({
    id: "rosca-biceps-inversa-barra-reta",
    displayName: "Rosca bíceps inversa com Barra Reta",
    sourceName: "barbell reverse curl",
    sourceId: "xNrS20v",
    equipment: "Barra",
    equipmentId: "barra",
    level: "intermediario",
    secondaryMuscles: REV_SEC,
    description: "Rosca em pé com pegada pronada na barra reta. Antebraço e braquiorradial como foco, bíceps como assistente.",
    startingPosition: "Em pé, barra à frente das coxas, pegada pronada na largura dos ombros, cotovelos junto ao tronco, punhos firmes.",
    instructions: steps(
      "Trave o core e os punhos.",
      "Flexione os cotovelos e suba a barra até a altura do peito.",
      "Aperte antebraço e bíceps.",
      "Desça até alongar.",
      "Não deixe a barra rolar nos dedos."
    ),
    commonErrors: [
      "Quebrar o pulso para cima.",
      "Usar o tronco.",
      "Pegada larga demais e perder o controle."
    ],
    importantTips: [
      "Pode usar barra W se o punho reclamar.",
      "Carga menor que a rosca direta."
    ]
  })
];

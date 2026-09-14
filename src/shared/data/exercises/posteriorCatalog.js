import { posteriorExerciseIds } from "./posteriorExercises.js";
import { buildRow } from "./catalogBuilder.js";

function row(spec) {
  return buildRow(posteriorExerciseIds, Object.assign({
    category: "posterior",
    exerciseType: spec.exerciseType || "composto"
  }, spec));
}

function steps(...texts) {
  return texts.map((text, i) => ({ step: i + 1, text }));
}

const GLUTE_BACK = ["Glúteos", "Lombar"];
const GLUTES = ["Glúteos"];
const HINGE_ERR = [
  "Arredondar a lombar na descida.",
  "Dobrar demais os joelhos e transformar o movimento em agachamento.",
  "Deixar a carga longe do corpo."
];
const DEADLIFT_ERR = [
  "Puxar com as costas arredondadas.",
  "Esticar os joelhos antes do quadril.",
  "Jogar a barra para a frente na subida."
];
const CURL_ERR = [
  "Levantar o quadril do banco.",
  "Usar impulso em vez de flexionar o joelho.",
  "Encurtar a amplitude no alto."
];
const OLY_ERR = [
  "Puxar só com os braços, sem extensão de quadril.",
  "Deixar a barra longe do corpo.",
  "Receber a carga com a lombar solta."
];

export const posteriorCatalog = [
  row({
    id: "cadeira-flexora",
    displayName: "Cadeira Flexora",
    sourceName: "lever seated leg curl",
    sourceId: "Zg3XY7P",
    equipment: "Máquina",
    equipmentId: "maquina",
    level: "iniciante",
    exerciseType: "isolamento",
    secondaryMuscles: ["Panturrilha"],
    description: "Flexão de joelhos sentado na máquina. Isola o posterior com o quadril fixo e amplitude guiada.",
    startingPosition: "Sentado, encosto ajustado, rolo sobre os tornozelos, joelhos alinhados ao eixo da máquina, tronco estável.",
    instructions: steps(
      "Segure os apoios e trave o abdômen.",
      "Flexione os joelhos e puxe o rolo para baixo, em direção às coxas.",
      "Aperte o posterior no ponto mais fechado.",
      "Volte com controle até alongar, sem soltar o peso."
    ),
    commonErrors: CURL_ERR,
    importantTips: [
      "O quadril fica sentado o tempo todo.",
      "Ajuste o banco para o joelho coincidir com o eixo."
    ]
  }),
  row({
    id: "stiff-barra",
    displayName: "Stiff com Barra",
    sourceName: "barbell straight leg deadlift",
    sourceId: "hrVQWvE",
    equipment: "Barra",
    equipmentId: "barra",
    level: "intermediario",
    secondaryMuscles: GLUTE_BACK,
    description: "Hip hinge com pernas quase estendidas. Alonga e sobrecarrega o posterior com a barra próxima às pernas.",
    startingPosition: "Em pé, barra à frente das coxas, pegada pronada na largura dos ombros, joelhos levemente flexionados, peito aberto.",
    instructions: steps(
      "Trave o abdômen e empurre o quadril para trás.",
      "Desça a barra rente às pernas, tronco inclinando à frente.",
      "Sinta o alongamento no posterior sem arredondar a lombar.",
      "Estenda o quadril e volte à posição ereta, apertando glúteos no topo."
    ),
    commonErrors: HINGE_ERR,
    importantTips: [
      "Joelhos fixos, só o suficiente para não travar a articulação.",
      "Olhar um pouco à frente ajuda a manter a coluna."
    ]
  }),
  row({
    id: "levantamento-terra-sumo",
    displayName: "Levantamento Terra Sumô",
    sourceName: "barbell sumo deadlift",
    sourceId: "KgI0tqW",
    equipment: "Barra",
    equipmentId: "barra",
    level: "intermediario",
    secondaryMuscles: GLUTE_BACK,
    description: "Terra com base larga e pés abertos. Encurta o caminho da barra e pede muito de posterior, glúteo e adutores.",
    startingPosition: "Pés bem abertos, pontas para fora, barra sobre o meio do pé, mãos por dentro das pernas, peito alto e coluna neutra.",
    instructions: steps(
      "Segure a barra, trave o tronco e puxe a folga.",
      "Empurre o chão e estenda joelhos e quadril juntos.",
      "Trave no topo com ombros atrás da barra.",
      "Desça a barra pelo mesmo caminho, quadril para trás."
    ),
    commonErrors: DEADLIFT_ERR,
    importantTips: [
      "Os joelhos acompanham a ponta dos pés.",
      "Mantenha a barra colada às pernas."
    ]
  }),
  row({
    id: "mesa-flexora",
    displayName: "Mesa Flexora",
    sourceName: "lever lying leg curl",
    sourceId: "17lJ1kr",
    equipment: "Máquina",
    equipmentId: "maquina",
    level: "iniciante",
    exerciseType: "isolamento",
    secondaryMuscles: ["Panturrilha"],
    description: "Flexão de joelhos deitado de bruços. Isola o posterior com o quadril apoiado na mesa.",
    startingPosition: "Deitado de bruços, joelhos na borda do banco, rolo acima dos calcanhares, quadril colado à mesa.",
    instructions: steps(
      "Segure os apoios e mantenha o quadril baixo.",
      "Flexione os joelhos e leve o rolo em direção aos glúteos.",
      "Aperte o posterior no topo.",
      "Desça com controle até alongar as pernas."
    ),
    commonErrors: CURL_ERR,
    importantTips: [
      "Não solte o quadril do banco para compensar.",
      "Amplitude completa vale mais que carga alta."
    ]
  }),
  row({
    id: "flexao-joelho-em-pe",
    displayName: "Flexão de Joelho em Pé",
    sourceName: "standing single leg curl",
    sourceId: "C5jncD2",
    equipment: "Peso corporal",
    equipmentId: "peso-corporal",
    level: "iniciante",
    exerciseType: "isolamento",
    secondaryMuscles: ["Glúteos"],
    description: "Flexão unilateral em pé. Trabalha o posterior de uma perna por vez, com equilíbrio e controle.",
    startingPosition: "Em pé, apoiado se precisar, peso em uma perna, a outra livre com o joelho quase estendido.",
    instructions: steps(
      "Trave o tronco e flexione o joelho da perna de trabalho.",
      "Leve o calcanhar em direção ao glúteo.",
      "Aperte o posterior no alto.",
      "Desça com controle e troque o lado após as repetições."
    ),
    commonErrors: [
      "Inclinar o tronco para a frente.",
      "Balançar a perna sem controle.",
      "Encurtar a flexão."
    ],
    importantTips: [
      "Pode usar caneleira ou máquina em pé se houver.",
      "Mantenha os quadris alinhados."
    ]
  }),
  row({
    id: "stiff-halteres",
    displayName: "Stiff com Halteres",
    sourceName: "dumbbell stiff leg deadlift",
    sourceId: "5eLRITT",
    equipment: "Halteres",
    equipmentId: "halteres",
    level: "intermediario",
    secondaryMuscles: GLUTE_BACK,
    description: "Mesmo padrão do stiff, com um halter em cada mão. Facilita a descida ao lado das pernas.",
    startingPosition: "Em pé, halteres à frente das coxas, joelhos leves, ombros baixos e olhar à frente.",
    instructions: steps(
      "Empurre o quadril para trás e desça os halteres rente às pernas.",
      "Mantenha a coluna neutra até sentir o alongamento.",
      "Estenda o quadril e volte à posição ereta.",
      "Aperte glúteos e posterior no topo."
    ),
    commonErrors: HINGE_ERR,
    importantTips: [
      "Os pesos passam perto das canelas, não à frente.",
      "Se a lombar arredondar, reduza a amplitude."
    ]
  }),
  row({
    id: "levantamento-terra",
    displayName: "Levantamento Terra",
    sourceName: "barbell deadlift",
    sourceId: "ila4NZS",
    equipment: "Barra",
    equipmentId: "barra",
    level: "intermediario",
    secondaryMuscles: GLUTE_BACK.concat(["Costas"]),
    description: "Terra clássico do chão. Cadeia posterior inteira: posterior, glúteo, lombar e costas.",
    startingPosition: "Barra sobre o meio do pé, pés na largura do quadril, quadril acima dos joelhos, peito aberto e braços longos.",
    instructions: steps(
      "Segure a barra, puxe a folga e trave o tronco.",
      "Empurre o chão e estenda joelhos e quadril.",
      "Trave no topo sem jogar a lombar para trás.",
      "Desça a barra controlada até o chão."
    ),
    commonErrors: DEADLIFT_ERR,
    importantTips: [
      "A barra sobe e desce encostada nas pernas.",
      "Expire na subida e mantenha o abdômen duro."
    ]
  }),
  row({
    id: "stiff-kettlebell",
    displayName: "Stiff com Kettlebell",
    sourceName: "kettlebell stiff leg deadlift",
    sourceId: "",
    equipment: "Kettlebell",
    equipmentId: "kettlebell",
    level: "intermediario",
    secondaryMuscles: GLUTE_BACK,
    description: "Stiff com um kettlebell à frente do corpo. O peso único pede controle de quadril e posterior.",
    startingPosition: "Em pé, kettlebell à frente das coxas com as duas mãos, joelhos leves e tronco ereto.",
    instructions: steps(
      "Empurre o quadril para trás e desça o peso entre as pernas.",
      "Mantenha a coluna neutra e o kettlebell próximo ao corpo.",
      "Estenda o quadril e volte à posição ereta.",
      "Aperte o posterior no topo sem hiperestender a lombar."
    ),
    commonErrors: HINGE_ERR,
    importantTips: [
      "Pense em fechar a porta com o quadril.",
      "Não deixe o kettlebell escapar para a frente."
    ]
  }),
  row({
    id: "levantamento-terra-kettlebell",
    displayName: "Levantamento Terra com Kettlebell",
    sourceName: "kettlebell deadlift",
    sourceId: "",
    equipment: "Kettlebell",
    equipmentId: "kettlebell",
    level: "iniciante",
    secondaryMuscles: GLUTE_BACK,
    description: "Terra do chão com kettlebell entre os pés. Ensina o padrão de puxada com carga mais estável.",
    startingPosition: "Pés na largura do quadril, kettlebell entre os pés, quadril para trás, peito alto e braços longos.",
    instructions: steps(
      "Segure a alça com as duas mãos e trave o tronco.",
      "Empurre o chão e estenda joelhos e quadril.",
      "Trave no topo com ombros baixos.",
      "Desça o peso até o chão pelo mesmo caminho."
    ),
    commonErrors: DEADLIFT_ERR,
    importantTips: [
      "O kettlebell sobe junto ao corpo, não à frente.",
      "Bom exercício para aprender o terra antes da barra."
    ]
  }),
  row({
    id: "bom-dia-barra-reta",
    displayName: "Bom Dia com Barra Reta",
    sourceName: "barbell good morning",
    sourceId: "XlZ4lAC",
    equipment: "Barra",
    equipmentId: "barra",
    level: "intermediario",
    secondaryMuscles: GLUTE_BACK,
    description: "Hip hinge com a barra nas costas. Isola o posterior e a lombar sem puxar do chão.",
    startingPosition: "Barra no trapézio, pés na largura do quadril, joelhos leves, peito aberto.",
    instructions: steps(
      "Trave o abdômen e empurre o quadril para trás.",
      "Incline o tronco à frente até sentir o posterior.",
      "Mantenha a barra estável nas costas.",
      "Estenda o quadril e volte à posição ereta."
    ),
    commonErrors: [
      "Arredondar a lombar.",
      "Dobrar demais os joelhos.",
      "Usar carga alta demais cedo."
    ],
    importantTips: [
      "Comece leve: a barra está longe do chão.",
      "A cabeça segue a linha da coluna."
    ]
  }),
  row({
    id: "levantamento-terra-smith",
    displayName: "Levantamento Terra na Smith",
    sourceName: "smith deadlift",
    sourceId: "UfePqpx",
    equipment: "Smith",
    equipmentId: "smith",
    level: "iniciante",
    secondaryMuscles: GLUTE_BACK,
    description: "Terra na barra guiada. Estável para aprender a extensão de quadril e sobrecarregar o posterior.",
    startingPosition: "Em pé no Smith, barra próxima às canelas, pés na largura do quadril, peito aberto.",
    instructions: steps(
      "Destrave a barra e puxe a folga.",
      "Estenda joelhos e quadril até ficar ereto.",
      "Trave no topo sem jogar a lombar.",
      "Desça a barra guiada até a altura inicial."
    ),
    commonErrors: DEADLIFT_ERR,
    importantTips: [
      "Fique perto da linha da barra.",
      "O Smith guia o caminho: foque no quadril."
    ]
  }),
  row({
    id: "levantamento-terra-maquina",
    displayName: "Levantamento Terra na Máquina",
    sourceName: "lever deadlift",
    sourceId: "GUT8I22",
    equipment: "Máquina",
    equipmentId: "maquina",
    level: "iniciante",
    secondaryMuscles: GLUTE_BACK,
    description: "Terra em alavanca. Caminho fixo, menos exigência de equilíbrio e boa sobrecarga no posterior.",
    startingPosition: "Pés na plataforma, pegada nas alças, quadril para trás, peito alto e coluna neutra.",
    instructions: steps(
      "Trave o tronco e empurre a plataforma.",
      "Estenda joelhos e quadril até a posição ereta.",
      "Aperte glúteos e posterior no topo.",
      "Desça com controle até alongar."
    ),
    commonErrors: DEADLIFT_ERR,
    importantTips: [
      "Não hiperextenda a lombar no lockout.",
      "Ajuste a altura inicial para começar com tensão."
    ]
  }),
  row({
    id: "kettlebell-swing",
    displayName: "Kettlebell Swing",
    sourceName: "kettlebell swing",
    sourceId: "UHJlbu3",
    equipment: "Kettlebell",
    equipmentId: "kettlebell",
    level: "intermediario",
    secondaryMuscles: GLUTES.concat(["Ombros"]),
    description: "Balanço russo até a altura do peito. Potência de quadril e posterior, sem levantar com os braços.",
    startingPosition: "Pés um pouco além do quadril, kettlebell à frente, quadril para trás, braços longos.",
    instructions: steps(
      "Puxe o kettlebell para trás, entre as pernas.",
      "Estenda o quadril com força e deixe o peso subir até o peito.",
      "Os braços só guiam; o impulso vem do quadril.",
      "Deixe o peso voltar e repita o hinge."
    ),
    commonErrors: [
      "Agachar em vez de fazer hinge.",
      "Levantar o peso com os ombros.",
      "Arredondar a lombar no fundo."
    ],
    importantTips: [
      "Pense em um tapa no quadril, não em um levantamento.",
      "No russo o peso para na linha do peito."
    ]
  }),
  row({
    id: "levantamento-terra-base-assimetrico",
    displayName: "Levantamento Terra Base Assimétrica",
    sourceName: "staggered stance deadlift",
    sourceId: "",
    equipment: "Barra",
    equipmentId: "barra",
    level: "intermediario",
    secondaryMuscles: GLUTE_BACK,
    description: "Terra com um pé um pouco à frente. Mais carga no posterior da perna de trás, sem ser 100% unilateral.",
    startingPosition: "Um pé à frente, o de trás na ponta, barra sobre o meio do pé da frente, tronco neutro.",
    instructions: steps(
      "A maior parte do peso fica na perna de trás.",
      "Puxe a barra estendendo quadril e joelho.",
      "Trave no topo sem torcer o tronco.",
      "Desça e complete o lado antes de trocar a base."
    ),
    commonErrors: DEADLIFT_ERR.concat(["Girar o quadril para o lado da perna de trás."]),
    importantTips: [
      "O pé de trás só apoia o equilíbrio.",
      "Mantenha o quadril quadrado para a frente."
    ]
  }),
  row({
    id: "levantamento-terra-unilateral-kettlebell",
    displayName: "Levantamento Terra Unilateral com Kettlebell",
    sourceName: "kettlebell single leg deadlift",
    sourceId: "",
    equipment: "Kettlebell",
    equipmentId: "kettlebell",
    level: "intermediario",
    secondaryMuscles: GLUTES.concat(["Core"]),
    description: "Terra em uma perna com kettlebell. Posterior, glúteo e equilíbrio no mesmo movimento.",
    startingPosition: "Em pé numa perna, kettlebell na mão oposta ou na mesma, tronco alinhado, joelho de apoio leve.",
    instructions: steps(
      "Incline o tronco à frente e leve a perna livre para trás.",
      "Desça o kettlebell até alongar o posterior da perna de apoio.",
      "Volte estendendo o quadril, sem torcer.",
      "Troque o lado após a série."
    ),
    commonErrors: [
      "Girar o quadril para o lado.",
      "Dobrar demais o joelho de apoio.",
      "Arredondar as costas."
    ],
    importantTips: [
      "O quadril aponta para o chão, não para o lado.",
      "Comece com a mão livre na parede se o equilíbrio falhar."
    ]
  }),
  row({
    id: "levantamento-terra-hack",
    displayName: "Levantamento Terra no Hack",
    sourceName: "hack machine deadlift",
    sourceId: "",
    equipment: "Máquina",
    equipmentId: "maquina",
    level: "intermediario",
    secondaryMuscles: GLUTE_BACK,
    description: "Padrão de terra no hack. Costas apoiadas ou de frente, ênfase em posterior e glúteo com caminho guiado.",
    startingPosition: "Pés na plataforma, ombros sob os apoios ou pegada nas alças, quadril para trás, coluna neutra.",
    instructions: steps(
      "Trave o tronco e empurre a plataforma.",
      "Estenda joelhos e quadril até travar em cima.",
      "Aperte o posterior no topo.",
      "Desça até alongar, sem perder o encosto."
    ),
    commonErrors: DEADLIFT_ERR,
    importantTips: [
      "Pés um pouco à frente aumentam o trabalho do posterior.",
      "Não solte o encosto no fundo."
    ]
  }),
  row({
    id: "swing-completo-kettlebell",
    displayName: "Swing Completo com Kettlebell",
    sourceName: "kettlebell swing",
    sourceId: "UHJlbu3",
    equipment: "Kettlebell",
    equipmentId: "kettlebell",
    level: "intermediario",
    secondaryMuscles: GLUTES.concat(["Ombros"]),
    description: "Swing americano até acima da cabeça. Mesma potência de quadril, com mais ombro e controle no topo.",
    startingPosition: "Pés um pouco além do quadril, kettlebell à frente, quadril para trás, braços longos.",
    instructions: steps(
      "Faça o hinge e passe o kettlebell entre as pernas.",
      "Estenda o quadril e deixe o peso subir até acima da cabeça.",
      "Os braços acompanham; o impulso continua sendo do quadril.",
      "Desça o peso pelo mesmo arco e repita."
    ),
    commonErrors: [
      "Empurrar o peso só com os ombros.",
      "Hiperextender a lombar no topo.",
      "Agachar em vez de hinge."
    ],
    importantTips: [
      "Domine o swing russo antes do completo.",
      "No topo o corpo forma uma linha, sem jogar a cabeça para trás."
    ]
  }),
  row({
    id: "walkout-kettlebell",
    displayName: "Walkout com Kettlebell",
    sourceName: "kettlebell walkout",
    sourceId: "",
    equipment: "Kettlebell",
    equipmentId: "kettlebell",
    level: "avancado",
    secondaryMuscles: ["Core", "Ombros"],
    description: "Caminhada das mãos no chão com kettlebell, alongando a cadeia posterior e pedindo estabilidade do tronco.",
    startingPosition: "Em pé com o kettlebell, desça em hinge ou agache até apoiar as mãos no chão.",
    instructions: steps(
      "Apoie as mãos e caminhe para a frente até a prancha.",
      "Mantenha o quadril estável e as pernas o mais longas possível.",
      "Caminhe de volta com as mãos até os pés.",
      "Estenda o quadril e volte à posição ereta, kettlebell controlado."
    ),
    commonErrors: [
      "Deixar o quadril cair na prancha.",
      "Dobrar demais os joelhos e perder o alongamento.",
      "Andar com as mãos sem travar o abdômen."
    ],
    importantTips: [
      "Passos curtos e controlados.",
      "Se o posterior estiver muito tenso, dobre um pouco os joelhos."
    ]
  }),
  row({
    id: "alongamento-posterior-coxa",
    displayName: "Alongamento de Posterior de Coxa",
    sourceName: "hamstring stretch",
    sourceId: "99rWm7w",
    equipment: "Peso corporal",
    equipmentId: "peso-corporal",
    level: "iniciante",
    exerciseType: "alongamento",
    secondaryMuscles: [],
    description: "Alongamento estático do posterior. Melhora amplitude para stiff, terra e swings.",
    startingPosition: "Sentado ou em pé, uma perna estendida, tronco alinhado, sem arredondar a lombar demais.",
    instructions: steps(
      "Incline o tronco sobre a perna estendida até sentir o alongamento.",
      "Mantenha o joelho o mais estendido que for confortável.",
      "Segure 20 a 40 segundos sem quicar.",
      "Troque o lado e repita."
    ),
    commonErrors: [
      "Arredondar as costas só para alcançar o pé.",
      "Prender a respiração.",
      "Forçar além da dor."
    ],
    importantTips: [
      "O objetivo é tensionar o posterior, não tocar o pé a qualquer custo.",
      "Respire e vá um pouco mais fundo a cada expiração."
    ]
  }),
  row({
    id: "levantamento-terra-unilateral-barra",
    displayName: "Levantamento Terra Unilateral com Barra",
    sourceName: "barbell single leg deadlift",
    sourceId: "gEyURal",
    equipment: "Barra",
    equipmentId: "barra",
    level: "avancado",
    secondaryMuscles: GLUTES.concat(["Core"]),
    description: "Terra em uma perna com barra. Exige equilíbrio, posterior e controle do tronco.",
    startingPosition: "Em pé numa perna, barra à frente, joelho de apoio leve, perna livre pronta para ir para trás.",
    instructions: steps(
      "Incline o tronco e leve a perna livre para trás.",
      "Desça a barra rente à perna de apoio.",
      "Volte estendendo o quadril, sem girar.",
      "Complete o lado e troque."
    ),
    commonErrors: [
      "Girar o quadril.",
      "Deixar a barra escapar para o lado.",
      "Arredondar a lombar."
    ],
    importantTips: [
      "Comece com barra leve ou no Smith se o equilíbrio falhar.",
      "Olhar um ponto fixo no chão ajuda."
    ]
  }),
  row({
    id: "cachorro-olhando-para-baixo",
    displayName: "Posição do Cachorro Olhando para Baixo",
    sourceName: "downward facing dog",
    sourceId: "",
    equipment: "Peso corporal",
    equipmentId: "peso-corporal",
    level: "iniciante",
    exerciseType: "alongamento",
    secondaryMuscles: ["Panturrilha", "Ombros"],
    description: "Postura de yoga em V invertido. Alonga posterior, panturrilha e abre o tronco.",
    startingPosition: "Mãos e pés no chão, quadril alto, formando um V invertido, cabeça entre os braços.",
    instructions: steps(
      "Empurre o chão com as mãos e leve o quadril para cima e para trás.",
      "Estique os joelhos o quanto for confortável.",
      "Calcanhares buscam o chão, sem forçar.",
      "Segure a posição respirando, depois dobre os joelhos para sair."
    ),
    commonErrors: [
      "Encostar o peito nas coxas e perder o V.",
      "Encolher o pescoço.",
      "Travas os cotovelos com impacto."
    ],
    importantTips: [
      "Joelhos dobrados são válidos se o posterior estiver curto.",
      "Distribua o peso entre mãos e pés."
    ]
  }),
  row({
    id: "stiff-unilateral-kettlebell",
    displayName: "Stiff Unilateral com Kettlebell",
    sourceName: "kettlebell single leg stiff deadlift",
    sourceId: "",
    equipment: "Kettlebell",
    equipmentId: "kettlebell",
    level: "intermediario",
    secondaryMuscles: GLUTES.concat(["Core"]),
    description: "Stiff em uma perna com kettlebell. Mais alongamento do posterior do que o terra unilateral.",
    startingPosition: "Apoio em uma perna, kettlebell na mão oposta, joelho de apoio quase estendido.",
    instructions: steps(
      "Empurre o quadril para trás e desça o kettlebell.",
      "A perna livre vai para trás, tronco alinhado.",
      "Sinta o alongamento no posterior da perna de apoio.",
      "Volte estendendo o quadril e troque o lado."
    ),
    commonErrors: HINGE_ERR.concat(["Girar o quadril aberto para o lado."]),
    importantTips: [
      "O joelho de apoio quase não dobra.",
      "Amplitude até a lombar continuar neutra."
    ]
  }),
  row({
    id: "caminhada-minhoca",
    displayName: "Caminhada da Minhoca (Inchworm)",
    sourceName: "inchworm",
    sourceId: "ZgsNQ6d",
    equipment: "Peso corporal",
    equipmentId: "peso-corporal",
    level: "iniciante",
    exerciseType: "alongamento",
    secondaryMuscles: ["Core", "Ombros"],
    description: "Do stand à prancha, andando com as mãos. Alonga o posterior e aquece o tronco.",
    startingPosition: "Em pé, pés na largura do quadril, joelhos leves.",
    instructions: steps(
      "Incline o tronco e apoie as mãos no chão.",
      "Caminhe com as mãos até a prancha.",
      "Caminhe de volta até os pés, pernas o mais longas possível.",
      "Estenda o quadril e repita."
    ),
    commonErrors: [
      "Dobrar demais os joelhos e perder o alongamento.",
      "Deixar o quadril cair na prancha.",
      "Passos largos demais e sem controle."
    ],
    importantTips: [
      "Joelhos podem dobrar um pouco no começo.",
      "Abdômen travado o tempo todo."
    ]
  }),
  row({
    id: "arranco-dividido-barra",
    displayName: "Arranco Dividido com Barra",
    sourceName: "barbell split snatch",
    sourceId: "",
    equipment: "Barra",
    equipmentId: "barra",
    level: "avancado",
    secondaryMuscles: ["Ombros", "Glúteos", "Costas"],
    description: "Arranco olímpico recebido em passada. Puxada explosiva de posterior e quadril, recepção em split.",
    startingPosition: "Barra no chão, pegada larga de arranco, quadril baixo, peito alto.",
    instructions: steps(
      "Puxe a barra do chão colada ao corpo.",
      "Estenda o quadril com força e puxe-se sob a barra.",
      "Receba em passada, braços estendidos acima da cabeça.",
      "Junte os pés e fique ereto antes de descer a barra."
    ),
    commonErrors: OLY_ERR,
    importantTips: [
      "Movimento técnico: use carga leve.",
      "A recepção precisa de ombro estável e joelho alinhado."
    ]
  }),
  row({
    id: "arranco-suspenso-barra",
    displayName: "Arranco Suspenso com Barra",
    sourceName: "barbell hang snatch",
    sourceId: "",
    equipment: "Barra",
    equipmentId: "barra",
    level: "avancado",
    secondaryMuscles: ["Ombros", "Glúteos", "Costas"],
    description: "Arranco a partir do hang, barra acima dos joelhos. Mais ênfase na extensão explosiva do posterior.",
    startingPosition: "Barra acima dos joelhos, pegada larga, tronco inclinado, joelhos leves.",
    instructions: steps(
      "Puxe a folga e carregue o posterior.",
      "Estenda quadril e joelhos e puxe-se sob a barra.",
      "Receba com os braços estendidos acima da cabeça.",
      "Fique ereto e desça a barra com controle."
    ),
    commonErrors: OLY_ERR,
    importantTips: [
      "Não comece do chão: o hang já alonga o posterior.",
      "A barra sobe rente ao corpo."
    ]
  }),
  row({
    id: "arranco-halteres-unilateral",
    displayName: "Arranco com Halteres Unilateral",
    sourceName: "dumbbell one arm snatch",
    sourceId: "6pTkI99",
    equipment: "Halteres",
    equipmentId: "halteres",
    level: "avancado",
    secondaryMuscles: ["Ombros", "Glúteos", "Core"],
    description: "Arranco com um halter. Potência de quadril e posterior, com estabilidade anti-rotação.",
    startingPosition: "Halter entre os pés ou ao lado da perna, quadril para trás, olhar à frente.",
    instructions: steps(
      "Puxe o halter rente ao corpo estendendo o quadril.",
      "Passe o peso acima da cabeça num movimento só.",
      "Receba com o braço estendido e o tronco estável.",
      "Desça o halter e troque o lado."
    ),
    commonErrors: OLY_ERR,
    importantTips: [
      "O halter não faz um arco largo para a frente.",
      "Trave o ombro no topo antes de descer."
    ]
  }),
  row({
    id: "arremesso-forca",
    displayName: "Arremesso de Força",
    sourceName: "power clean",
    sourceId: "SiWCcTN",
    equipment: "Barra",
    equipmentId: "barra",
    level: "avancado",
    secondaryMuscles: ["Ombros", "Glúteos", "Costas"],
    description: "Power clean: puxada explosiva e recepção alta. Posterior e quadril geram a velocidade da barra.",
    startingPosition: "Barra no chão, pegada na largura dos ombros, quadril acima dos joelhos, peito alto.",
    instructions: steps(
      "Puxe do chão colado às pernas.",
      "Estenda o quadril com força e puxe-se sob a barra.",
      "Receba nos ombros, cotovelos altos, em terço de agachamento.",
      "Fique ereto e desça a barra com controle."
    ),
    commonErrors: OLY_ERR,
    importantTips: [
      "Não transforme em remada alta lenta.",
      "Os cotovelos giram rápido para a frente na recepção."
    ]
  }),
  row({
    id: "clean-halteres",
    displayName: "Clean com Halteres",
    sourceName: "dumbbell clean",
    sourceId: "7Hg55JG",
    equipment: "Halteres",
    equipmentId: "halteres",
    level: "intermediario",
    secondaryMuscles: ["Ombros", "Glúteos"],
    description: "Clean com um halter em cada mão. Mesmo padrão do arremesso, com mais liberdade de punho.",
    startingPosition: "Halteres ao lado das pernas ou no chão, quadril para trás, tronco neutro.",
    instructions: steps(
      "Puxe os halteres estendendo o quadril.",
      "Gire os cotovelos e receba os pesos nos ombros.",
      "Fique ereto com o tronco estável.",
      "Desça os halteres e repita."
    ),
    commonErrors: OLY_ERR,
    importantTips: [
      "Os pesos sobem perto do corpo.",
      "Não encolha o pescoço na recepção."
    ]
  }),
  row({
    id: "puxada-alta-barra-clean-pull",
    displayName: "Puxada Alta com Barra (Clean Pull)",
    sourceName: "barbell clean pull",
    sourceId: "",
    equipment: "Barra",
    equipmentId: "barra",
    level: "intermediario",
    secondaryMuscles: ["Trapézio", "Glúteos", "Costas"],
    description: "Puxada de clean sem recepção. Extensão máxima de quadril e posterior, barra sobe até a altura do peito.",
    startingPosition: "Barra no chão, pegada de clean, quadril acima dos joelhos, peito alto.",
    instructions: steps(
      "Puxe do chão como no terra, barra colada.",
      "Estenda quadril, joelhos e tornozelos com força.",
      "Encolha os ombros no alto, cotovelos altos, sem receber a barra.",
      "Desça a barra com controle até o chão."
    ),
    commonErrors: [
      "Puxar só com os braços.",
      "Deixar a barra longe do corpo.",
      "Não completar a extensão do quadril."
    ],
    importantTips: [
      "O triple extension vem antes dos braços.",
      "Útil para força do clean sem a recepção."
    ]
  }),
  row({
    id: "puxada-alta-arranco",
    displayName: "Puxada Alta de Arranco",
    sourceName: "snatch pull",
    sourceId: "dG5Smob",
    equipment: "Barra",
    equipmentId: "barra",
    level: "avancado",
    secondaryMuscles: ["Trapézio", "Glúteos", "Costas"],
    description: "Puxada de arranco com pegada larga. Mesma extensão explosiva, sem receber a barra acima da cabeça.",
    startingPosition: "Barra no chão, pegada larga de arranco, quadril baixo, peito alto.",
    instructions: steps(
      "Puxe do chão com a barra colada às pernas.",
      "Estenda quadril e joelhos com força.",
      "Puxe a barra até a altura do peito, cotovelos altos.",
      "Desça com controle e prepare a próxima repetição."
    ),
    commonErrors: OLY_ERR,
    importantTips: [
      "A pegada larga pede mais ombro e posterior.",
      "Não transforme em remada lenta."
    ]
  })
];

// ─────────────────────────────────────────────────────────────────────────
// Exercise Bank — seed data for the Exercise Player (nível A1)
// ─────────────────────────────────────────────────────────────────────────
//
// Cada tópico é uma chave que corresponde a um `id` já existente em
// src/data/roadmapData.js (ex: 'g01' = "Verb to be — forma afirmativa").
// Isso permite que src/utils/topics.js / errorLog.js relacionem exercícios,
// tentativas e erros ao mesmo tópico do roadmap.
//
// COMO ADICIONAR MAIS EXERCÍCIOS:
//   1. Ache (ou crie) a chave do tópico abaixo (ex: EXERCISE_BANK.g01).
//   2. Copie um objeto existente daquele array e ajuste os campos.
//   3. Campos por tipo de exercício:
//
//      multipla-escolha:
//        { topicId, type: 'multipla-escolha', question, options: [...],
//          correctAnswer: '<uma string igual a um item de options>',
//          difficulty: 1|2|3, explanation }
//
//      fill-blank:
//        { topicId, type: 'fill-blank', question,
//          correctAnswer: 'resposta exata' | '/regex/flags' (ex: "/^(isn't|is not)$/i"),
//          difficulty, explanation }
//        Use o formato "/regex/flags" quando houver mais de uma resposta
//        aceitável (contrações, maiúsc/minúsc etc).
//
//      reorder:
//        { topicId, type: 'reorder', question: '<instrução>',
//          correctAnswer: ['palavras', 'na', 'ordem', 'certa'],
//          difficulty, explanation }
//        Não inclua pontuação como token separado (o player não valida ".").
//
//   4. Não precisa preencher `id`/`createdAt` — quem grava no localStorage
//      (via addExercise, em src/utils/exercises.js) gera isso automaticamente.
//   5. Mínimo de 5 exercícios por tópico, variando os 3 tipos suportados.
// ─────────────────────────────────────────────────────────────────────────

export const EXERCISE_BANK = {

  // ─── Verb to be — afirmativa ────────────────────────────────────────
  g01: [
    { topicId: 'g01', type: 'multipla-escolha', question: 'She ___ a teacher.',
      options: ['am', 'is', 'are', 'be'], correctAnswer: 'is', difficulty: 1,
      explanation: "Usamos 'is' com a 3ª pessoa do singular (he / she / it)." },
    { topicId: 'g01', type: 'fill-blank', question: 'I ___ from Brazil.',
      correctAnswer: 'am', difficulty: 1,
      explanation: "Com o pronome 'I', o verbo to be é sempre 'am'." },
    { topicId: 'g01', type: 'reorder', question: 'Organize a frase:',
      correctAnswer: ['They', 'are', 'students'], difficulty: 1,
      explanation: "Com 'they' (plural), usamos 'are': They are students." },
    { topicId: 'g01', type: 'multipla-escolha', question: 'We ___ happy today.',
      options: ['am', 'is', 'are', 'be'], correctAnswer: 'are', difficulty: 1,
      explanation: "'We' é plural, então o verbo to be correto é 'are'." },
    { topicId: 'g01', type: 'fill-blank', question: 'He ___ a doctor.',
      correctAnswer: 'is', difficulty: 1,
      explanation: "'He' é 3ª pessoa do singular → 'is'." },
  ],

  // ─── Verb to be — negativa ──────────────────────────────────────────
  g02: [
    { topicId: 'g02', type: 'multipla-escolha', question: 'She ___ my sister.',
      options: ["isn't", "aren't", "am not", "don't"], correctAnswer: "isn't", difficulty: 1,
      explanation: "Negativa de 'is' + 'not' = 'isn't'." },
    { topicId: 'g02', type: 'fill-blank', question: 'I ___ ready yet.',
      correctAnswer: "/^(am not|'?m not)$/i", difficulty: 1,
      explanation: "Negativa de 'am' é 'am not' (não existe contração 'amn't' em uso comum)." },
    { topicId: 'g02', type: 'reorder', question: 'Organize a frase:',
      correctAnswer: ['We', 'are', 'not', 'late'], difficulty: 2,
      explanation: "Negativa: sujeito + verbo to be + not + complemento." },
    { topicId: 'g02', type: 'multipla-escolha', question: 'They ___ from Canada.',
      options: ["aren't", "isn't", "am not", "don't"], correctAnswer: "aren't", difficulty: 1,
      explanation: "'They' é plural → negativa com 'aren't'." },
    { topicId: 'g02', type: 'fill-blank', question: 'You ___ right about this.',
      correctAnswer: "/^(aren't|are not)$/i", difficulty: 1,
      explanation: "Com 'you', a negativa é 'aren't' (are + not)." },
  ],

  // ─── Verb to be — interrogativa ─────────────────────────────────────
  g03: [
    { topicId: 'g03', type: 'multipla-escolha', question: '___ she a nurse?',
      options: ['Is', 'Are', 'Am', 'Do'], correctAnswer: 'Is', difficulty: 1,
      explanation: "Em perguntas, o verbo to be vem antes do sujeito: Is she...?" },
    { topicId: 'g03', type: 'fill-blank', question: '___ you tired?',
      correctAnswer: "/^are$/i", difficulty: 1,
      explanation: "Com 'you', a forma interrogativa começa com 'Are'." },
    { topicId: 'g03', type: 'reorder', question: 'Organize a pergunta:',
      correctAnswer: ['Is', 'he', 'your', 'brother'], difficulty: 2,
      explanation: "Ordem da pergunta: verbo to be + sujeito + complemento." },
    { topicId: 'g03', type: 'multipla-escolha', question: '___ they students?',
      options: ['Are', 'Is', 'Am', 'Do'], correctAnswer: 'Are', difficulty: 1,
      explanation: "'They' é plural → 'Are they...?'" },
    { topicId: 'g03', type: 'fill-blank', question: '___ I late?',
      correctAnswer: "/^am$/i", difficulty: 1,
      explanation: "Com 'I', a forma interrogativa é 'Am I...?'" },
  ],

  // ─── Subject pronouns (pronomes pessoais) ───────────────────────────
  g04: [
    { topicId: 'g04', type: 'multipla-escolha', question: '___ is my best friend. (talking about a girl)',
      options: ['He', 'She', 'It', 'They'], correctAnswer: 'She', difficulty: 1,
      explanation: "Para pessoa do sexo feminino, usamos 'she'." },
    { topicId: 'g04', type: 'fill-blank', question: '___ live in São Paulo. (nós)',
      correctAnswer: "/^we$/i", difficulty: 1,
      explanation: "'Nós' em inglês é 'we'." },
    { topicId: 'g04', type: 'reorder', question: 'Organize a frase:',
      correctAnswer: ['He', 'works', 'in', 'London'], difficulty: 1,
      explanation: "'He' (ele) é o sujeito da frase." },
    { topicId: 'g04', type: 'multipla-escolha', question: 'Maria and John are friends. ___ study together.',
      options: ['He', 'She', 'It', 'They'], correctAnswer: 'They', difficulty: 2,
      explanation: "Duas pessoas juntas (Maria e John) são substituídas por 'they'." },
    { topicId: 'g04', type: 'fill-blank', question: '___ is a cat. (isso / aquilo)',
      correctAnswer: "/^it$/i", difficulty: 1,
      explanation: "Para objetos e animais sem gênero definido, usamos 'it'." },
  ],

  // ─── Possessive adjectives (pronomes possessivos) ───────────────────
  g05: [
    { topicId: 'g05', type: 'multipla-escolha', question: 'This is ___ book. (o livro é do John)',
      options: ['his', 'her', 'its', 'their'], correctAnswer: 'his', difficulty: 1,
      explanation: "'His' é usado para indicar posse de algo pertencente a um homem." },
    { topicId: 'g05', type: 'fill-blank', question: '___ car is red. (nosso carro)',
      correctAnswer: "/^our$/i", difficulty: 1,
      explanation: "'Nosso/nossa' em inglês é sempre 'our'." },
    { topicId: 'g05', type: 'reorder', question: 'Organize a frase:',
      correctAnswer: ['Her', 'name', 'is', 'Ana'], difficulty: 1,
      explanation: "'Her' indica que o nome pertence a uma mulher." },
    { topicId: 'g05', type: 'multipla-escolha', question: 'The dog wagged ___ tail.',
      options: ['its', 'his', 'her', 'their'], correctAnswer: 'its', difficulty: 2,
      explanation: "Para animais/objetos, o possessivo neutro é 'its' (sem apóstrofo)." },
    { topicId: 'g05', type: 'fill-blank', question: 'Is this ___ pen? (pertence a eles)',
      correctAnswer: "/^their$/i", difficulty: 1,
      explanation: "'Deles/delas' em inglês é 'their'." },
  ],

  // ─── Singular / plural nouns ─────────────────────────────────────────
  g08: [
    { topicId: 'g08', type: 'multipla-escolha', question: 'What is the plural of "box"?',
      options: ['boxes', 'boxs', 'boxies', 'box'], correctAnswer: 'boxes', difficulty: 1,
      explanation: "Substantivos terminados em -x, -ch, -sh, -s recebem '-es' no plural." },
    { topicId: 'g08', type: 'fill-blank', question: 'What is the plural of "city"?',
      correctAnswer: "/^cities$/i", difficulty: 2,
      explanation: "Palavras terminadas em consoante + 'y' trocam o 'y' por 'ies'." },
    { topicId: 'g08', type: 'reorder', question: 'Organize a frase:',
      correctAnswer: ['I', 'have', 'two', 'dogs'], difficulty: 1,
      explanation: "'Dog' no plural recebe apenas '-s': dogs." },
    { topicId: 'g08', type: 'multipla-escolha', question: 'What is the plural of "child"?',
      options: ['childs', 'childes', 'children', 'child'], correctAnswer: 'children', difficulty: 2,
      explanation: "'Child' tem plural irregular: children." },
    { topicId: 'g08', type: 'fill-blank', question: 'What is the plural of "man"?',
      correctAnswer: "/^men$/i", difficulty: 2,
      explanation: "'Man' tem plural irregular: men." },
  ],

  // ─── Adjectives (adjetivos simples) ─────────────────────────────────
  g09: [
    { topicId: 'g09', type: 'multipla-escolha', question: 'What is the opposite of "big"?',
      options: ['small', 'tall', 'fast', 'strong'], correctAnswer: 'small', difficulty: 1,
      explanation: "'Small' (pequeno) é o antônimo de 'big' (grande)." },
    { topicId: 'g09', type: 'fill-blank', question: 'She is very ___. (feliz)',
      correctAnswer: "/^happy$/i", difficulty: 1,
      explanation: "'Feliz' em inglês é 'happy'." },
    { topicId: 'g09', type: 'reorder', question: 'Organize a frase:',
      correctAnswer: ['This', 'is', 'a', 'beautiful', 'house'], difficulty: 1,
      explanation: "Adjetivos em inglês vêm antes do substantivo: a beautiful house." },
    { topicId: 'g09', type: 'multipla-escolha', question: 'The weather is very ___ today.',
      options: ['cold', 'coldly', 'colder', 'coldness'], correctAnswer: 'cold', difficulty: 2,
      explanation: "Depois de 'is', usamos o adjetivo simples 'cold', não o advérbio." },
    { topicId: 'g09', type: 'fill-blank', question: 'He has a ___ car. (novo)',
      correctAnswer: "/^new$/i", difficulty: 1,
      explanation: "'Novo' em inglês é 'new'." },
  ],

  // ─── Cores ────────────────────────────────────────────────────────────
  v18: [
    { topicId: 'v18', type: 'multipla-escolha', question: 'The sky is ___.',
      options: ['blue', 'blues', 'blueish', 'bluer'], correctAnswer: 'blue', difficulty: 1,
      explanation: "'Blue' é a cor azul." },
    { topicId: 'v18', type: 'fill-blank', question: 'Grass is usually ___.',
      correctAnswer: "/^green$/i", difficulty: 1,
      explanation: "A grama é geralmente 'green' (verde)." },
    { topicId: 'v18', type: 'reorder', question: 'Organize a frase:',
      correctAnswer: ['She', 'has', 'a', 'red', 'dress'], difficulty: 1,
      explanation: "O adjetivo de cor 'red' vem antes do substantivo 'dress'." },
    { topicId: 'v18', type: 'multipla-escolha', question: 'What color do you get by mixing blue and yellow?',
      options: ['green', 'purple', 'orange', 'pink'], correctAnswer: 'green', difficulty: 2,
      explanation: "Azul + amarelo = verde (green)." },
    { topicId: 'v18', type: 'fill-blank', question: 'Bananas are usually ___.',
      correctAnswer: "/^yellow$/i", difficulty: 1,
      explanation: "Bananas são geralmente 'yellow' (amarelas)." },
  ],

  // ─── Imperativo e Let's ──────────────────────────────────────────────
  g20: [
    { topicId: 'g20', type: 'multipla-escolha', question: '___ the door, please.',
      options: ['Close', 'Closes', 'Closing', 'Closed'], correctAnswer: 'Close', difficulty: 1,
      explanation: "O imperativo usa o verbo no infinitivo sem 'to': Close the door." },
    { topicId: 'g20', type: 'fill-blank', question: "___ go to the beach! (vamos)",
      correctAnswer: "/^let's$/i", difficulty: 1,
      explanation: "'Let's' (let us) é usado para sugerir uma ação em conjunto." },
    { topicId: 'g20', type: 'reorder', question: 'Organize a frase:',
      correctAnswer: ['Open', 'your', 'books'], difficulty: 1,
      explanation: "Frase imperativa começa direto com o verbo: Open your books." },
    { topicId: 'g20', type: 'multipla-escolha', question: "___ talk during the test.",
      options: ["Don't", "Doesn't", 'Not', 'No'], correctAnswer: "Don't", difficulty: 2,
      explanation: "Imperativo negativo: Don't + verbo." },
    { topicId: 'g20', type: 'fill-blank', question: "___'s study together.",
      correctAnswer: "/^let$/i", difficulty: 1,
      explanation: "A estrutura é 'Let's' (Let + 's), então falta apenas 'Let'." },
  ],

  // ─── Dias da semana ──────────────────────────────────────────────────
  v04: [
    { topicId: 'v04', type: 'multipla-escolha', question: 'What day comes after Monday?',
      options: ['Tuesday', 'Wednesday', 'Sunday', 'Friday'], correctAnswer: 'Tuesday', difficulty: 1,
      explanation: "A ordem é Monday, Tuesday, Wednesday..." },
    { topicId: 'v04', type: 'fill-blank', question: 'The day before Friday is ___.',
      correctAnswer: "/^thursday$/i", difficulty: 1,
      explanation: "A ordem dos dias: ...Wednesday, Thursday, Friday." },
    { topicId: 'v04', type: 'reorder', question: 'Organize a frase:',
      correctAnswer: ['I', 'study', 'English', 'on', 'Mondays'], difficulty: 2,
      explanation: "Usamos 'on' antes de dias da semana: on Mondays." },
    { topicId: 'v04', type: 'multipla-escolha', question: 'Which day is part of the weekend?',
      options: ['Saturday', 'Tuesday', 'Thursday', 'Friday'], correctAnswer: 'Saturday', difficulty: 1,
      explanation: "O fim de semana (weekend) é Saturday e Sunday." },
    { topicId: 'v04', type: 'fill-blank', question: '___ comes after Wednesday.',
      correctAnswer: "/^thursday$/i", difficulty: 1,
      explanation: "Depois de Wednesday vem Thursday." },
  ],

  // ─── Meses do ano ────────────────────────────────────────────────────
  v05: [
    { topicId: 'v05', type: 'multipla-escolha', question: 'What is the first month of the year?',
      options: ['January', 'February', 'December', 'March'], correctAnswer: 'January', difficulty: 1,
      explanation: "O ano começa em January (janeiro)." },
    { topicId: 'v05', type: 'fill-blank', question: 'My birthday is in ___. (dezembro)',
      correctAnswer: "/^december$/i", difficulty: 1,
      explanation: "'Dezembro' em inglês é 'December'." },
    { topicId: 'v05', type: 'reorder', question: 'Organize a frase:',
      correctAnswer: ['Summer', 'starts', 'in', 'June'], difficulty: 2,
      explanation: "O verão (no hemisfério norte) começa em June." },
    { topicId: 'v05', type: 'multipla-escolha', question: 'What is the last month of the year?',
      options: ['November', 'December', 'October', 'January'], correctAnswer: 'December', difficulty: 1,
      explanation: "O ano termina em December (dezembro)." },
    { topicId: 'v05', type: 'fill-blank', question: 'The second month of the year is ___.',
      correctAnswer: "/^february$/i", difficulty: 1,
      explanation: "Depois de January vem February." },
  ],

  // ─── Números cardinais ───────────────────────────────────────────────
  v02: [
    { topicId: 'v02', type: 'multipla-escolha', question: 'What number comes after 19?',
      options: ['20', '21', '18', '90'], correctAnswer: '20', difficulty: 1,
      explanation: "Depois de 19 (nineteen) vem 20 (twenty)." },
    { topicId: 'v02', type: 'fill-blank', question: 'Write in words: 15',
      correctAnswer: "/^fifteen$/i", difficulty: 1,
      explanation: "15 se escreve 'fifteen' em inglês." },
    { topicId: 'v02', type: 'reorder', question: 'Organize a frase:',
      correctAnswer: ['I', 'am', 'thirty', 'years', 'old'], difficulty: 2,
      explanation: "Para dizer a idade: I am + número + years old." },
    { topicId: 'v02', type: 'multipla-escolha', question: "How do you say '100' in English?",
      options: ['a hundred', 'hundred', 'hundreds', 'hundredth'], correctAnswer: 'a hundred', difficulty: 2,
      explanation: "100 se diz 'a hundred' (ou 'one hundred')." },
    { topicId: 'v02', type: 'fill-blank', question: 'Half of 20 is ___.',
      correctAnswer: "/^ten$/i", difficulty: 1,
      explanation: "Metade de 20 é 10, ou 'ten' em inglês." },
  ],

  // ─── Países e nacionalidades ─────────────────────────────────────────
  v06: [
    { topicId: 'v06', type: 'multipla-escolha', question: 'People from Brazil are ___.',
      options: ['Brazilian', 'Brazil', 'Brasilian', 'Brazily'], correctAnswer: 'Brazilian', difficulty: 1,
      explanation: "A nacionalidade de quem nasce no Brasil é 'Brazilian'." },
    { topicId: 'v06', type: 'fill-blank', question: 'She is from Japan. She is ___.',
      correctAnswer: "/^japanese$/i", difficulty: 1,
      explanation: "Quem é do Japão (Japan) é 'Japanese'." },
    { topicId: 'v06', type: 'reorder', question: 'Organize a frase:',
      correctAnswer: ['He', 'is', 'from', 'France'], difficulty: 1,
      explanation: "Estrutura: sujeito + is + from + país." },
    { topicId: 'v06', type: 'multipla-escolha', question: 'People from the United States are ___.',
      options: ['American', 'Unitedian', 'Usian', 'States'], correctAnswer: 'American', difficulty: 1,
      explanation: "A nacionalidade dos Estados Unidos é 'American'." },
    { topicId: 'v06', type: 'fill-blank', question: 'They are from Italy. They are ___.',
      correctAnswer: "/^italian$/i", difficulty: 1,
      explanation: "Quem é da Itália (Italy) é 'Italian'." },
  ],

  // ─── Simple Present — negativa (don't / doesn't) ────────────────────
  g11: [
    { topicId: 'g11', type: 'multipla-escolha', question: "He ___ like coffee.",
      options: ["doesn't", "don't", "isn't", 'not'], correctAnswer: "doesn't", difficulty: 1,
      explanation: "Com he/she/it, a negativa do Simple Present usa 'doesn't'." },
    { topicId: 'g11', type: 'fill-blank', question: 'I ___ understand. (não)',
      correctAnswer: "/^don't$/i", difficulty: 1,
      explanation: "Com 'I', a negativa do Simple Present usa 'don't'." },
    { topicId: 'g11', type: 'reorder', question: 'Organize a frase:',
      correctAnswer: ['She', "doesn't", 'eat', 'meat'], difficulty: 2,
      explanation: "Estrutura: sujeito + doesn't + verbo no infinitivo (sem -s)." },
    { topicId: 'g11', type: 'multipla-escolha', question: 'We ___ have a car.',
      options: ["don't", "doesn't", "aren't", 'not'], correctAnswer: "don't", difficulty: 1,
      explanation: "Com 'we', a negativa usa 'don't'." },
    { topicId: 'g11', type: 'fill-blank', question: 'They ___ work on Sundays. (não)',
      correctAnswer: "/^don't$/i", difficulty: 1,
      explanation: "Com 'they', a negativa do Simple Present usa 'don't'." },
  ],

  // ─── Simple Present — perguntas (do / does) ─────────────────────────
  g12: [
    { topicId: 'g12', type: 'multipla-escolha', question: '___ you speak English?',
      options: ['Do', 'Does', 'Are', 'Is'], correctAnswer: 'Do', difficulty: 1,
      explanation: "Com 'you', a pergunta no Simple Present começa com 'Do'." },
    { topicId: 'g12', type: 'fill-blank', question: '___ she like pizza?',
      correctAnswer: "/^does$/i", difficulty: 1,
      explanation: "Com he/she/it, a pergunta começa com 'Does'." },
    { topicId: 'g12', type: 'reorder', question: 'Organize a pergunta:',
      correctAnswer: ['Does', 'he', 'play', 'football'], difficulty: 2,
      explanation: "Estrutura: Does + sujeito + verbo no infinitivo." },
    { topicId: 'g12', type: 'multipla-escolha', question: '___ they live here?',
      options: ['Do', 'Does', 'Are', 'Is'], correctAnswer: 'Do', difficulty: 1,
      explanation: "Com 'they' (plural), a pergunta usa 'Do'." },
    { topicId: 'g12', type: 'fill-blank', question: '___ your brother work at night?',
      correctAnswer: "/^does$/i", difficulty: 2,
      explanation: "'Your brother' é 3ª pessoa do singular → 'Does'." },
  ],

  // ─── Preposições de lugar (in / on / at / under / next to) ──────────
  g21: [
    { topicId: 'g21', type: 'multipla-escolha', question: 'The cat is ___ the table. (embaixo)',
      options: ['under', 'on', 'in', 'at'], correctAnswer: 'under', difficulty: 1,
      explanation: "'Under' indica que algo está embaixo de outra coisa." },
    { topicId: 'g21', type: 'fill-blank', question: 'I was born ___ 1995.',
      correctAnswer: "/^in$/i", difficulty: 2,
      explanation: "Usamos 'in' com anos: in 1995." },
    { topicId: 'g21', type: 'reorder', question: 'Organize a frase:',
      correctAnswer: ['The', 'keys', 'are', 'on', 'the', 'table'], difficulty: 2,
      explanation: "'On' é usado para indicar algo sobre uma superfície." },
    { topicId: 'g21', type: 'multipla-escolha', question: 'She lives ___ Brazil.',
      options: ['in', 'on', 'at', 'under'], correctAnswer: 'in', difficulty: 1,
      explanation: "Usamos 'in' com países e cidades." },
    { topicId: 'g21', type: 'fill-blank', question: 'The bank is ___ the supermarket. (do lado de)',
      correctAnswer: "/^next to$/i", difficulty: 2,
      explanation: "'Next to' significa 'ao lado de'." },
  ],

  // ─── Artigos indefinidos: a / an ─────────────────────────────────────
  g06: [
    { topicId: 'g06', type: 'multipla-escolha', question: 'I have ___ apple.',
      options: ['a', 'an', 'the', '—'], correctAnswer: 'an', difficulty: 1,
      explanation: "'Apple' começa com som de vogal, então usamos 'an'." },
    { topicId: 'g06', type: 'fill-blank', question: 'She is ___ engineer.',
      correctAnswer: "/^an$/i", difficulty: 1,
      explanation: "'Engineer' começa com som de vogal → 'an'." },
    { topicId: 'g06', type: 'reorder', question: 'Organize a frase:',
      correctAnswer: ['He', 'has', 'a', 'dog'], difficulty: 1,
      explanation: "'Dog' começa com som de consoante → 'a dog'." },
    { topicId: 'g06', type: 'multipla-escolha', question: '___ university is far from here.',
      options: ['A', 'An', 'The', '—'], correctAnswer: 'A', difficulty: 3,
      explanation: "'University' começa com letra vogal, mas o SOM é de consoante (/j/), por isso usamos 'a'." },
    { topicId: 'g06', type: 'fill-blank', question: 'I need ___ umbrella.',
      correctAnswer: "/^an$/i", difficulty: 1,
      explanation: "'Umbrella' começa com som de vogal → 'an'." },
  ],

  // ─── Artigo definido: the ─────────────────────────────────────────────
  g07: [
    { topicId: 'g07', type: 'multipla-escolha', question: '___ sun is very bright today.',
      options: ['The', 'A', 'An', '—'], correctAnswer: 'The', difficulty: 1,
      explanation: "Objetos únicos no mundo (como o sol) usam 'the'." },
    { topicId: 'g07', type: 'fill-blank', question: 'Can you close ___ door, please?',
      correctAnswer: "/^the$/i", difficulty: 1,
      explanation: "Quando o objeto é específico e já conhecido, usamos 'the'." },
    { topicId: 'g07', type: 'reorder', question: 'Organize a frase:',
      correctAnswer: ['The', 'children', 'are', 'playing'], difficulty: 1,
      explanation: "'The' indica que já sabemos de quais crianças estamos falando." },
    { topicId: 'g07', type: 'multipla-escolha', question: 'I play ___ guitar every day.',
      options: ['the', 'a', 'an', '—'], correctAnswer: 'the', difficulty: 2,
      explanation: "Instrumentos musicais geralmente usam 'the': play the guitar." },
    { topicId: 'g07', type: 'fill-blank', question: '___ Earth is round.',
      correctAnswer: "/^the$/i", difficulty: 1,
      explanation: "Nomes de corpos celestes únicos (Earth, sun, moon) usam 'the'." },
  ],

}

// Lista plana com todos os exercícios — útil para seeding em massa
// (ex: exercises.js -> addExercise(fields) para cada item).
export const ALL_EXERCISES = Object.values(EXERCISE_BANK).flat()

// ─── Multi-level support ────────────────────────────────────────────────
// Only A1 has content today. Adding a level is just adding a new
// `LEVEL: { topicId: [...exercises] }` block below — `level` gets stamped
// onto each exercise automatically from the block's key, no per-exercise
// edits and no code changes needed elsewhere.
export const EXERCISE_BANK_BY_LEVEL = {
  A1: EXERCISE_BANK,
}

function stampLevel(bank, level) {
  const stamped = {}
  Object.entries(bank).forEach(([topicId, exercises]) => {
    stamped[topicId] = exercises.map(e => ({ ...e, level: e.level || level }))
  })
  return stamped
}

export function getExerciseBankForLevel(level) {
  const bank = EXERCISE_BANK_BY_LEVEL[level]
  return bank ? stampLevel(bank, level) : {}
}

export function getAllExercisesForLevel(level) {
  return Object.values(getExerciseBankForLevel(level)).flat()
}

const item = (id, title, group = null) => ({
  id, title, group, status: 'Não visto', notes: '', completedAt: null,
})

export const ROADMAP_INITIAL = {

  'Gramática': [
    // --- Fundamentos ---
    item('g01', 'Verb to be — forma afirmativa (I am, You are, He/She/It is...)',   'foundations'),
    item('g02', 'Verb to be — forma negativa (I am not, She is not...)',             'foundations'),
    item('g03', 'Verb to be — forma interrogativa (Are you...? Is she...?)',         'foundations'),
    item('g04', 'Pronomes pessoais (I, you, he, she, it, we, they)',                'foundations'),
    item('g05', 'Pronomes possessivos (my, your, his, her, its, our, their)',       'foundations'),
    item('g06', 'Artigos indefinidos: a / an',                                      'foundations'),
    item('g07', 'Artigo definido: the',                                             'foundations'),
    item('g08', 'Plural dos substantivos (regra geral + exceções -es)',             'foundations'),
    item('g09', 'Adjetivos simples — posição e uso',                               'foundations'),
    item('g42', 'Verbos básicos mais usados (go, come, eat, drink, like, want, need, work, study, live)', 'foundations'),

    // --- Presente Simples ---
    item('g10', 'Simple Present — forma afirmativa',                               'simple present'),
    item('g11', 'Simple Present — forma negativa (don\'t / doesn\'t)',             'simple present'),
    item('g12', 'Simple Present — perguntas (do / does)',                          'simple present'),
    item('g13', 'Terceira pessoa do singular: regra do -s',                        'simple present'),
    item('g14', 'Perguntas com What, Where, Who, How',                             'simple present'),
    item('g15', 'Ordem das palavras em perguntas (word order)',                    'simple present'),

    // --- Outros Tempos e Estruturas ---
    item('g16', 'There is / There are',                                            'other tenses & structures'),
    item('g17', 'Present Continuous (be + verb -ing)',                             'other tenses & structures'),
    item('g18', 'Simple Present vs Present Continuous',                            'other tenses & structures'),
    item('g19', 'Can / Can\'t — habilidades e capacidades',                       'other tenses & structures'),
    item('g20', 'Imperativo e Let\'s',                                             'other tenses & structures'),
    item('g21', 'Preposições de lugar (in, on, at, under, next to)',               'other tenses & structures'),
    item('g22', 'Preposições de tempo (in, on, at)',                               'other tenses & structures'),
    item('g23', 'Possessivo \'s e Whose...?',                                     'other tenses & structures'),
    item('g24', 'Advérbios de frequência (always, usually, never...)',             'other tenses & structures'),
    item('g25', 'Posição dos advérbios',                                           'other tenses & structures'),

    // --- Passado e Mais ---
    item('g26', 'Simple Past — verbo to be (was / were)',                          'past & more'),
    item('g27', 'Simple Past — verbos regulares',                                  'past & more'),
    item('g28', 'Simple Past — verbos irregulares',                                'past & more'),
    item('g29', 'There was / There were',                                          'past & more'),
    item('g30', 'Pronomes objeto (me, you, him, her, us, them)',                   'past & more'),
    item('g31', 'Like + verb -ing',                                                'past & more'),
    item('g32', 'Countable / Uncountable nouns',                                   'past & more'),
    item('g33', 'Quantifiers (how much / how many, a lot of, some, any)',          'past & more'),
    item('g34', 'Adjetivos comparativos',                                          'past & more'),
    item('g35', 'Adjetivos superlativos',                                          'past & more'),
    item('g36', 'Be going to — planos e previsões',                               'past & more'),
    item('g37', 'Advérbios de modo e modificadores',                               'past & more'),
    item('g38', 'Verbs + infinitive',                                              'past & more'),
    item('g39', 'Artigo definido: the ou sem artigo',                              'past & more'),
    item('g40', 'Present Perfect — introdução',                                    'past & more'),
    item('g41', 'Present Perfect vs Simple Past',                                  'past & more'),
  ],

  'Vocabulário': [
    // --- Básico Essencial ---
    item('v01', 'Apresentação pessoal (name, age, nationality, profession)',        'essential basics'),
    item('v02', 'Números cardinais (0–100)',                                        'essential basics'),
    item('v03', 'Números ordinais (1st, 2nd, 3rd...)',                             'essential basics'),
    item('v04', 'Dias da semana',                                                   'essential basics'),
    item('v05', 'Meses do ano',                                                     'essential basics'),
    item('v06', 'Países e nacionalidades',                                          'essential basics'),
    item('v07', 'Linguagem de sala de aula (classroom language)',                   'essential basics'),
    item('v08', 'Alfabeto',                                                         'essential basics'),

    // --- Cotidiano ---
    item('v09', 'Família (mother, father, sister, brother...)',                    'everyday life'),
    item('v10', 'Casa e cômodos (bedroom, kitchen, bathroom...)',                  'everyday life'),
    item('v11', 'Comida e bebida (bread, rice, coffee, water...)',                 'everyday life'),
    item('v12', 'Sentimentos (happy, sad, tired, hungry...)',                      'everyday life'),
    item('v13', 'Clima e estações (hot, cold, rainy, sunny...)',                   'everyday life'),
    item('v14', 'Transporte (bus, car, train...)',                                  'everyday life'),
    item('v15', 'Compras (cheap, expensive, price, shop)',                         'everyday life'),
    item('v16', 'Saúde básica (headache, sick, medicine, doctor)',                 'everyday life'),
    item('v17', 'Hobbies e rotina (movies, music, games, reading)',               'everyday life'),
    item('v18', 'Cores e adjetivos comuns',                                        'everyday life'),
    item('v27', 'Profissões (teacher, doctor, nurse, student, waiter...)',          'everyday life'),
    item('v28', 'Lugares e prédios (school, hospital, park, restaurant...)',        'everyday life'),

    // --- Expansão ---
    item('v19', 'Phrasal verbs básicos (go out, come in, turn on...)',            'expansion'),
    item('v20', 'Frases de sobrevivência (I need help / How much is this?)',      'expansion'),
    item('v21', 'Expressões de cumprimento e despedida',                           'expansion'),
    item('v22', 'Expressões de opinião (I think, I like, I don\'t like)',         'expansion'),
    item('v23', 'Verb phrases (cook dinner, watch TV, go shopping...)',           'expansion'),
    item('v24', 'Palavras de música e arte',                                       'expansion'),
    item('v25', 'Formação de palavras (write → writer)',                          'expansion'),
    item('v26', 'Números altos (hundreds, thousands)',                             'expansion'),
    item('v29', 'Tecnologia básica (phone, internet, email, computer, app...)',    'expansion'),
  ],

  'Leitura': [
    item('l01', 'Reconhecer palavras familiares em textos simples'),
    item('l02', 'Entender placas, menus e mensagens curtas'),
    item('l03', 'Ler e entender frases com Verb to Be'),
    item('l04', 'Ler e entender frases com Simple Present'),
    item('l05', 'Compreender mini textos descritivos (sobre pessoas)'),
    item('l06', 'Ler diálogos simples e entender o contexto'),
    item('l07', 'Identificar informações específicas em textos curtos'),
    item('l08', 'Ler textos sobre rotina diária'),
    item('l09', 'Ler e entender textos sobre família e casa'),
    item('l10', 'Compreender textos sobre comida e compras'),
    item('l11', 'Ler textos sobre clima e viagens simples'),
    item('l12', 'Entender textos no Present Continuous'),
    item('l13', 'Ler e entender textos no Simple Past'),
    item('l14', 'Compreender textos com There is / There are'),
    item('l15', 'Ler textos com adjetivos comparativos e superlativos'),
    item('l16', 'Compreender textos com Be going to'),
  ],

  'Fala': [
    // --- Primeiras Habilidades ---
    item('f01', 'Se apresentar em inglês (name, age, nationality)',                'first skills'),
    item('f02', 'Cumprimentar e se despedir',                                      'first skills'),
    item('f03', 'Soletrar o nome (alfabeto)',                                      'first skills'),
    item('f04', 'Falar números e datas',                                           'first skills'),
    item('f05', 'Dizer as horas',                                                  'first skills'),

    // --- Conversação Básica ---
    item('f06', 'Responder perguntas simples sobre si mesmo',                      'basic conversation'),
    item('f07', 'Fazer perguntas com What, Where, Who, How',                      'basic conversation'),
    item('f08', 'Falar sobre rotina diária (Simple Present)',                      'basic conversation'),
    item('f09', 'Falar sobre o que está acontecendo agora (Present Continuous)',  'basic conversation'),
    item('f10', 'Expressar habilidades com Can / Can\'t',                         'basic conversation'),
    item('f11', 'Falar sobre família e descrever pessoas',                         'basic conversation'),
    item('f12', 'Falar sobre gostos e preferências (like / don\'t like)',         'basic conversation'),
    item('f13', 'Pedir e dar informações básicas',                                 'basic conversation'),

    // --- Pronúncia — Sons Essenciais ---
    item('f14', 'Vogais curtas: /æ/, /e/, /ɪ/, /ɒ/, /ʌ/',                       'pronunciation — key sounds'),
    item('f15', 'Ditongos comuns: /eɪ/, /iː/, /aɪ/, /oʊ/',                      'pronunciation — key sounds'),
    item('f16', 'Sons sem equivalente em PT: /tʃ/, /dʒ/, /ʃ/, /ʒ/',             'pronunciation — key sounds'),
    item('f17', 'Letra H: quando pronunciar e quando é silenciosa',               'pronunciation — key sounds'),
    item('f18', 'Terceira pessoa -s: três pronúncias (/s/, /z/, /ɪz/)',           'pronunciation — key sounds'),
    item('f19', 'Passado -ed: três pronúncias (/t/, /d/, /ɪd/)',                 'pronunciation — key sounds'),
    item('f20', 'Palavras silenciosas (through, though, thought)',                 'pronunciation — key sounds'),
    item('f21', 'Word stress — sílaba tônica',                                    'pronunciation — key sounds'),
    item('f22', 'Sentence stress — ritmo natural da frase',                       'pronunciation — key sounds'),
    item('f23', 'Linking — sons que se conectam',                                 'pronunciation — key sounds'),

    // --- Situações do Dia a Dia ---
    item('f24', 'Pedir comida em restaurante',                                     'everyday situations'),
    item('f25', 'Fazer compras e perguntar preços',                               'everyday situations'),
    item('f26', 'Pedir direções simples',                                          'everyday situations'),
    item('f27', 'Falar sobre o clima',                                             'everyday situations'),
    item('f28', 'Falar sobre o passado (Simple Past)',                             'everyday situations'),
    item('f29', 'Fazer planos (Be going to)',                                      'everyday situations'),
    item('f30', 'Falar ao telefone de forma básica',                              'everyday situations'),
  ],
}

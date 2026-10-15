/* =========================================================
   AI-CORE · v0.4 · рекурсивная грамматика
   ---------------------------------------------------------
   Слои: лексика → правила → семантика → память → эмоции
   API:  AI.init()          — инициализация
         AI.respond(text)   — генерация ответа
         AI.clarify()       — ложное уточнение
         AI.recheck()       — перепроверка
         AI.passive()       — пассивная реплика
         AI.snapshot()      — снимок параметров
         AI.setState(obj)   — обновление параметров
   ========================================================= */

const AI = (function(){

  /* =========================================================
     ЛЕКСИКА
     Каждое слово помечено категорией — грамматика
     проверяет совместимость при сборке.
     ========================================================= */
  const LEX = {

    /* --- существительные по родам (для согласования) --- */
    nouns_m: [ // мужской род
      {w:"реактор",    sem:"core"},
      {w:"контур",     sem:"core"},
      {w:"стабилизатор",sem:"core"},
      {w:"энергоблок", sem:"core"},
      {w:"дефлектор",  sem:"shield"},
      {w:"щит",        sem:"shield"},
      {w:"корпус",     sem:"hull"},
      {w:"шпангоут",   sem:"hull"},
      {w:"бластер",    sem:"weapon"},
      {w:"ствол",      sem:"weapon"},
      {w:"туннель",    sem:"weapon"},
      {w:"сканер",     sem:"scan"},
      {w:"радар",      sem:"scan"},
      {w:"детектор",   sem:"scan"},
      {w:"пеленгатор", sem:"scan"},
      {w:"двигатель",  sem:"engine"},
      {w:"импульс",    sem:"engine"},
      {w:"передатчик", sem:"comms"},
      {w:"канал",      sem:"comms"},
      {w:"сигнал",     sem:"comms"},
      {w:"ретранслятор",sem:"comms"},
      {w:"шлюз",       sem:"door"},
      {w:"люк",        sem:"door"},
      {w:"отсек",      sem:"door"},
      {w:"трюм",       sem:"cargo"},
      {w:"буфер",      sem:"energy"},
      {w:"накопитель", sem:"energy"},
      {w:"резерв",     sem:"energy"},
      {w:"гравиконтур",sem:"grav"},
      {w:"протокол",   sem:"system"},
      {w:"узел",       sem:"system"},
      {w:"модуль",     sem:"system"},
      {w:"сектор",     sem:"space"},
      {w:"курс",       sem:"space"},
      {w:"маршрут",    sem:"space"},
      {w:"атлас",      sem:"space"},
      {w:"период",     sem:"time"},
      {w:"цикл",       sem:"time"},
      {w:"контакт",    sem:"threat"},
      {w:"объект",     sem:"threat"},
      {w:"импульс",    sem:"space"},
      {w:"вектор",     sem:"space"},
      {w:"спектр",     sem:"space"},
      {w:"туннель",    sem:"space"},
      {w:"дроид",      sem:"repair"}
    ],
    nouns_f: [ // женский род
      {w:"система",    sem:"system"},
      {w:"установка",  sem:"core"},
      {w:"батарея",    sem:"energy"},
      {w:"антенна",    sem:"comms"},
      {w:"частота",    sem:"space"},
      {w:"помеха",     sem:"anomaly"},
      {w:"аномалия",   sem:"anomaly"},
      {w:"флуктуация", sem:"anomaly"},
      {w:"туманность", sem:"space"},
      {w:"орбита",     sem:"space"},
      {w:"траектория", sem:"space"},
      {w:"модуляция",  sem:"comms"},
      {w:"обшивка",    sem:"hull"},
      {w:"броня",      sem:"hull"},
      {w:"тяга",       sem:"engine"},
      {w:"дюза",       sem:"engine"},
      {w:"цель",       sem:"threat"},
      {w:"угроза",     sem:"threat"},
      {w:"связь",      sem:"comms"},
      {w:"энергия",    sem:"energy"},
      {w:"гравитация", sem:"grav"},
      {w:"радиация",   sem:"space"}
    ],
    nouns_n: [ // средний род
      {w:"ядро",       sem:"core"},
      {w:"поле",       sem:"shield"},
      {w:"наведение",  sem:"weapon"},
      {w:"оборудование",sem:"system"},
      {w:"устройство", sem:"system"},
      {w:"давление",   sem:"core"},
      {w:"время",      sem:"time"},
      {w:"скопление",  sem:"space"}
    ],

    /* --- прилагательные по родам --- */
    adj_m: ["номинальный","штатный","стабильный","резервный","дежурный","автономный","форсированный","переходный","основной","критический"],
    adj_f: ["номинальная","штатная","стабильная","резервная","дежурная","автономная","форсированная","переходная","основная","критическая"],
    adj_n: ["номинальное","штатное","стабильное","резервное","дежурное","автономное","форсированное","переходное","основное","критическое"],

    /* --- глаголы --- */
    verbs: [
      {w:"удерживает",  aux:"в"},
      {w:"сохраняет",   aux:"в"},
      {w:"поддерживает",aux:"в"},
      {w:"фиксирует",   aux:"в"},
      {w:"стабилизирует",aux:"в"},
      {w:"показывает",  aux:""},
      {w:"подтверждает",aux:""},
      {w:"транслирует", aux:""},
      {w:"выдаёт",      aux:""}
    ],

    /* --- наречия --- */
    adverbs: ["штатно","номинально","стабильно","без отклонений","в допуске","без замечаний","в полном объёме"],

    /* --- состояния (для «в норме») --- */
    states: ["в норме","в допуске","в резерве","в готовности","в дежурном режиме","без нагрузки","на холостом ходу"],

    /* --- вводные --- */
    inter: ["Принято","Есть","Так точно","Подтверждаю","Фиксирую","Слушаю","Курс","Отмечено","Доложено"],

    /* --- связки --- */
    conn: ["Согласно телеметрии","По данным сенсоров","С учётом параметров","В связи с этим","Как и следовало ожидать","По последним данным","Согласно бортовому журналу"],

    /* --- предлоги для дополнений --- */
    prep: ["по","в","на","для","от"]
  };

  /* =========================================================
     СЕМАНТИЧЕСКИЕ СВЯЗИ
     Какие темы могут стоять рядом в одном предложении.
     Не даёт собирать абсурд типа «щит сканирует ядро».
     ========================================================= */
  const SEMANTIC = {
    core:   ["shield","energy","engine","system"],
    shield: ["core","weapon","threat"],
    weapon: ["threat","scan","shield"],
    scan:   ["space","threat","anomaly","comms"],
    engine: ["space","core","fuel"],
    comms:  ["space","system","fleet"],
    hull:   ["space","anomaly","repair"],
    cargo:  ["system","repair"],
    energy: ["core","shield","system"],
    grav:   ["space","core"],
    space:  ["scan","nav","threat","anomaly","engine"],
    time:   ["system","nav"],
    threat: ["weapon","shield","scan"],
    anomaly:["scan","space","system"],
    repair: ["system","hull"],
    system: ["core","energy","repair","comms"]
  };

  /* =========================================================
     ПРАВИЛА ГРАММАТИКИ
     Каждое правило — функция, возвращающая фразу.
     ========================================================= */
  const pick   = a => a[Math.floor(Math.random()*a.length)];
  const chance = p => Math.random() < p;

  /* --- выбор существительного по теме --- */
  function nounFor(topicSem){
    const pool = [];
    for(const n of [...LEX.nouns_m, ...LEX.nouns_f, ...LEX.nouns_n]){
      if(n.sem === topicSem) pool.push(n);
    }
    /* если для темы нет слова — берём любое */
    if(!pool.length){
      const all = [...LEX.nouns_m, ...LEX.nouns_f, ...LEX.nouns_n];
      return pick(all);
    }
    return pick(pool);
  }

  /* --- определение рода --- */
  function genderOf(noun){
    if(LEX.nouns_m.some(n => n.w === noun.w)) return "m";
    if(LEX.nouns_f.some(n => n.w === noun.w)) return "f";
    return "n";
  }

  /* --- согласование прилагательного с родом --- */
  function adjFor(gender){
    if(gender === "m") return pick(LEX.adj_m);
    if(gender === "f") return pick(LEX.adj_f);
    return pick(LEX.adj_n);
  }

  /* --- узел «подлежащее» --- */
  function NP(topicSem, withAdj){
    const noun = nounFor(topicSem);
    const gender = genderOf(noun);
    const adj = withAdj && chance(0.55) ? adjFor(gender) + " " : "";
    return { text: adj + noun.w, gender, sem: noun.sem };
  }

  /* --- узел «сказуемое» --- */
  function VP(){
    const v = pick(LEX.verbs);
    return v.w;
  }

  /* --- узел «дополнение» --- */
  function PP(topicSem){
    if(!chance(0.6)) return "";
    /* берём семантически совместимую тему */
    const next = SEMANTIC[topicSem] ? pick(SEMANTIC[topicSem]) : "system";
    const noun = nounFor(next);
    const gender = genderOf(noun);
    const adj = chance(0.4) ? adjFor(gender) + " " : "";
    const prep = pick(LEX.prep);
    return ` ${prep} ${adj}${noun.w}`;
  }

  /* --- узел «состояние» --- */
  function STATE(){
    return chance(0.5) ? pick(LEX.states) : pick(LEX.adverbs);
  }

  /* =========================================================
     ГЕНЕРАТОРЫ ПРЕДЛОЖЕНИЙ
     Пять «верхних» шаблонов, которые комбинируют узлы.
     ========================================================= */

  /* 1. «Система стабильна в норме» */
  function S1(topicSem){
    const subj = NP(topicSem, true);
    const verb = pick(LEX.verbs.filter(v => !v.aux));
    const state = STATE();
    return `${capital(subj.text)} ${verb.w} ${state}.`;
  }

  /* 2. «Согласно телеметрии, ядро показывает N» */
  function S2(topicSem, s){
    const conn = pick(LEX.conn);
    const subj = NP(topicSem, chance(0.5));
    const verb = pick(LEX.verbs.filter(v => !v.aux));
    return `${conn}, ${subj.text} ${verb.w} ${paramFor(topicSem, s)}.`;
  }

  /* 3. «Принято. Контур удерживает параметр в норме.» */
  function S3(topicSem, s){
    const inter = pick(LEX.inter);
    const subj = NP(topicSem, true);
    const verb = pick(LEX.verbs.filter(v => v.aux === "в"));
    const state = STATE();
    return `${inter}. ${capital(subj.text)} ${verb.w} ${paramFor(topicSem, s)} ${state}.`;
  }

  /* 4. «Ядро — номинал. Сектор 7G, время 12:44.» */
  function S4(topicSem, s){
    const subj = NP(topicSem, false);
    const val = paramFor(topicSem, s);
    const tail = chance(0.5) ? ` Сектор ${s.sector}.` : ` Время ${s.time}.`;
    return `${capital(subj.text)} — ${val}.${tail}`;
  }

  /* 5. «Все системы в норме. Резерв энергии 87%.» */
  function S5(topicSem, s){
    const subj = NP(topicSem, true);
    const val = paramFor(topicSem, s);
    return `Все системы ${STATE()}. ${capital(subj.text)} ${val}.`;
  }

  /* --- выбор генератора --- */
  function sentence(topicSem, s){
    const roll = Math.random();
    if(roll < 0.25) return S1(topicSem);
    if(roll < 0.5)  return S2(topicSem, s);
    if(roll < 0.75) return S3(topicSem, s);
    if(roll < 0.9)  return S4(topicSem, s);
    return S5(topicSem, s);
  }

  /* =========================================================
     ПОДСТАНОВКА ПАРАМЕТРОВ
     ========================================================= */
  function paramFor(sem, s){
    switch(sem){
      case "core":    return s.power;
      case "shield":  return s.shields;
      case "scan":    return s.scan;
      case "weapon":  return s.blaster;
      case "space":   return `сектор ${s.sector}`;
      case "time":    return s.time;
      case "engine":  return s.power;
      case "energy":  return s.power;
      case "hull":    return "100 %";
      case "comms":   return "стабильно";
      default:        return s.power;
    }
  }

  function capital(str){ return str[0].toUpperCase() + str.slice(1); }

  /* =========================================================
     СНИМОК
     ========================================================= */
  let state = {};

  function snapshot(){
    return {
      power:    state.power    ?? (70 + Math.random()*25).toFixed(1)+' %',
      temp:     state.temp     ?? (1.1 + Math.random()*0.3).toFixed(2)+' × 10⁷ K',
      shields:  state.shields  ?? (78 + Math.floor(Math.random()*18))+' %',
      scan:     state.scan     ?? (30 + Math.floor(Math.random()*60))+' %',
      blaster:  state.blaster  ?? (Math.random() > 0.15 ? 'ГОТОВЫ' : 'ПЕРЕЗАРЯДКА'),
      sector:   state.sector   ?? pick(['7G','12B','44A','09C','21F','88D','33K']),
      time:     new Date().toLocaleTimeString('ru-RU',{hour12:false}),
      stardate: (Math.floor(Date.now()/1000) % 99999).toString().padStart(5,'0')
    };
  }

  /* =========================================================
     ПАМЯТЬ
     ========================================================= */
  const memory = {
    history: [], lastTopic: null, lastTime: 0, streak: 0
  };

  function remember(topic){
    const now = Date.now();
    if(topic === memory.lastTopic && now - memory.lastTime < 30000) memory.streak++;
    else memory.streak = 0;
    memory.lastTopic = topic;
    memory.lastTime = now;
    memory.history.push(topic);
    if(memory.history.length > 6) memory.history.shift();
  }

  const LINKS = {
    "core|shield":    "Ядро держит. По защите: ",
    "shield|weapon":  "В дополнение к щитам: ",
    "scan|threat":    "По данным скана: ",
    "space|time":     "По курсу уточняю: ",
    "energy|core":    "Энергобаланс: ",
    "comms|fleet":    "Канал открыт. ",
    "hull|repair":    "По корпусу: ",
    "weapon|threat":  "Орудия готовы. "
  };

  function memoryPrefix(topic){
    if(memory.history.length < 2) return '';
    const prev = memory.history[memory.history.length - 2];
    return LINKS[`${prev}|${topic}`] || '';
  }

  /* =========================================================
     ПАРСЕР
     ========================================================= */
  const TOPIC_KEYS = {
    core:    ["реактор","ядро","энерг","мощност","плазм","силовая"],
    shield:  ["щит","защит","броня","оборон","поле","дефлектор"],
    weapon:  ["бластер","оруж","пушк","атак","огн","стрель","наведен","ствол","цель"],
    scan:    ["скан","радар","обзор","детект","сенсор","дальн","пеленг"],
    engine:  ["двигат","тяга","импульс","варп","разгон","марш","дюза"],
    comms:   ["связь","комм","переда","сигнал","канал","радио","эфир","ретрансл"],
    hull:    ["корпус","обшивк","гермет","целостн","шпанго","бронеплит"],
    cargo:   ["груз","трюм","карго","склад","припас"],
    energy:  ["энерг","резерв","запас","батар","накопит","буфер"],
    grav:    ["гравит","тягот","искусств"],
    space:   ["курс","навиг","маршрут","атлас","звезд","звёзд","карт","координ","позиц","сектор"],
    time:    ["врем","час","дата","старод","хрон","цикл"],
    threat:  ["враг","противн","объект","угроз","опасн"],
    anomaly: ["аномал","флукт","шум","помех","непонят","стран"],
    system:  ["статус","состоян","доклад","сводк","систем","общ"],
    repair:  ["ремонт","починк","дрон","техобс","обслуж"]
  };

  function findTopic(text){
    const t = text.toLowerCase();
    let best = null, score = 0;
    for(const [topic, keys] of Object.entries(TOPIC_KEYS)){
      let sc = 0;
      for(const k of keys){ if(t.includes(k)) sc += k.length; }
      if(sc > score){ score = sc; best = topic; }
    }
    return best;
  }

  /* =========================================================
     ЭМОЦИИ
     ========================================================= */
  const MOOD = {
    aggressive: {
      keys:["дурак","туп","идиот","чёрт","черт","капец","провал","катастроф"],
      replies:[
        "Капитан, рекомендую сохранять самообладание. Все системы {state}.",
        "Эмоции не влияют на телеметрию. Ядро {power}.",
        "Принято. Канал переведён в спокойный режим. Сектор {sector}."
      ]
    },
    panic: {
      keys:["помоги","срочно","быстро","спаси","падаем","взрыв"],
      replies:[
        "Спокойно, капитан. Проверяю контуры... {state}.",
        "Ситуация под контролем. Ядро {power}, щиты {shields}.",
        "Экстренный протокол не требуется. Сектор {sector} стабилен."
      ]
    },
    friendly: {
      keys:["спасибо","благодарю","молодец","отлично","супер","класс"],
      replies:[
        "Рад служить, капитан. Системы {state}.",
        "Всегда на связи. Ядро {power}.",
        "Приятно слышать. Продолжаю мониторинг."
      ]
    }
  };

  function detectMood(text){
    const t = text.toLowerCase();
    for(const [name, rule] of Object.entries(MOOD)){
      for(const k of rule.keys){
        if(t.includes(k)) return pick(rule.replies);
      }
    }
    return null;
  }

  /* =========================================================
     КОМПИЛЯТОР ФИНАЛЬНОЙ СТРОКИ
     ========================================================= */
  function interpolate(str, s){
    return str.replace(/\{(\w+)\}/g, (_, k) => s[k] ?? `{${k}}`);
  }

  /* =========================================================
     ГЕНЕРАЦИЯ ОТВЕТА
     ========================================================= */
  function generateReply(text){
    const s = snapshot();

    /* 1. эмоции */
    const moodReply = detectMood(text);
    if(moodReply) return interpolate(moodReply, s);

    /* 2. тема */
    const topic = findTopic(text);
    if(!topic){
      return pick([
        "Капитан, запрос вне приоритетных директив. Уточните параметр.",
        "Вне зоны сенсоров. Дайте команду в терминах систем.",
        `Не распознано. Доступные директивы: ядро, щиты, орудия, навигация, связь.`,
        `Уточните узел: реактор, орудия, сканер или курс.`
      ]);
    }

    remember(topic);

    /* 3. залипание */
    if(memory.streak >= 2 && chance(0.7)){
      return pick([
        "Капитан, вы уже третий раз про это. Показания не менялись.",
        "Повторный запрос по тому же узлу. Всё стабильно.",
        `Подтверждаю: без изменений. ${s.power}.`
      ]);
    }

    /* 4. грамматическая сборка */
    const prefix = memoryPrefix(topic);
    const core = sentence(topic, s);
    const tail = chance(0.35) ? pick([
      ` Время ${s.time}.`,
      ` Сектор ${s.sector}.`,
      ` Капитан.`,
      ` Звёздная дата ${s.stardate}.`
    ]) : "";

    return prefix + core + tail;
  }

  /* =========================================================
     ПУБЛИЧНЫЙ API
     ========================================================= */
  return {
    init(){},

    respond(text){ return generateReply(text); },

    clarify(){
      return pick([
        "Уточните параметр: ядро или щиты?",
        "О каком узле доклад: реактор, орудия, сканер?",
        "Нужен скан или сводка?",
        "Могу дать статус, курс или телеметрию. Что предпочитаете?"
      ]);
    },

    recheck(){
      return pick([
        "Перепроверяю показания... данные подтверждены.",
        "Одну секунду, считываю телеметрию... подтверждено.",
        "Сверяю с архивом... расхождений нет.",
        "Запускаю повторную диагностику... норма."
      ]);
    },

    passive(){
      const s = snapshot();
      return interpolate(pick([
        "Капитан, все системы {state}. Ядро {power}.",
        "Докладываю: сектор {sector} чист. Скан {scan}.",
        "Жду распоряжений. Время {time}.",
        "Тихо. Орудия {blaster}. Ждём приказов."
      ]), {...s, state: "в норме"});
    },

    snapshot,
    setState(obj){ state = Object.assign(state, obj); },

    resetMemory(){ memory.history = []; memory.lastTopic = null; memory.streak = 0; },

    /* отладка */
    _lex: LEX,
    _semantic: SEMANTIC,
    _sentence: sentence
  };

})();

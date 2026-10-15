/* =========================================================
   AI-CORE · v0.5 · грамматика + марковская цепь
   ---------------------------------------------------------
   Режимы: grammar | markov | hybrid
   API:  AI.init()             — инициализация
         AI.respond(text)      — генерация ответа
         AI.setMode('hybrid')  — переключение режима
         AI.clarify()          — ложное уточнение
         AI.recheck()          — перепроверка
         AI.passive()          — пассивная реплика
         AI.snapshot()         — снимок
         AI.setState(obj)      — обновление параметров
   ========================================================= */

const AI = (function(){

  /* =========================================================
     РЕЖИМ РАБОТЫ
     ========================================================= */
  let MODE = 'hybrid';   // 'grammar' | 'markov' | 'hybrid'

  /* =========================================================
     КОРПУС ДЛЯ ОБУЧЕНИЯ МАРКОВСКОЙ ЦЕПИ
     ~600 коротких фраз в стиле борткомпьютера.
     ========================================================= */
  const CORPUS = [
    "ядро стабильно","ядро в норме","ядро номинально","ядро удерживает мощность",
    "контур в норме","контур стабилен","контур удерживает параметр",
    "энергоблок работает штатно","силовая установка в норме","реактор выдаёт мощность",
    "система стабильна","система работает","система в дежурном режиме",
    "щиты в норме","щиты номинальны","щиты держат нагрузку","дефлекторы активны",
    "защитное поле стабильно","защита в допуске","броня без отклонений",
    "бластеры готовы","орудия к бою готовы","наведение в норме","стволы заряжены",
    "орудийные порты активны","бластеры в готовности","заряды номинальны",
    "сканер активен","радар работает","сенсоры в норме","детекция стабильна",
    "обзор чист","сектор просканирован","пеленгатор в норме",
    "двигатели готовы","тяга номинал","импульсный блок активен","варп-контур в резерве",
    "маршевый двигатель в норме","дюзы стабильны",
    "связь стабильна","канал открыт","сигнал в норме","ретранслятор активен",
    "передача идёт","эфир тих","модуляция стабильна",
    "корпус цел","обшивка в норме","герметичность полная","шпангоуты стабильны",
    "бронеплиты без повреждений","целостность номинальна",
    "трюм герметичен","груз закреплён","карго в норме","склад полон",
    "резерв энергии полный","батареи заряжены","буферы активны","накопители в норме",
    "гравитация стабильна","гравиконтур в норме","тяготение номинально",
    "курс удерживается","маршрут проложен","атлас синхронизирован","координаты зафиксированы",
    "навигация активна","сектор чист","позиция стабильна",
    "время идёт","хронометр в норме","звёздная дата обновлена","цикл завершён",
    "угроз нет","контактов не зафиксировано","сектор безопасен","опасности нет",
    "аномалий нет","помехи в допуске","флуктуаций не выявлено","сигнал чист",
    "статус номинальный","все системы в норме","доклад готов","телеметрия стабильна",
    "сводка обновлена","протоколы активны","директивы выполнены",
    "ремонт не требуется","дроны в резерве","техобслуживание по графику",
    "отказов нет","неисправностей не выявлено","системы синхронизированы",
    "экипаж на местах","команда в норме","готовность полная","смена активна",
    "мостик на связи","посты заняты","жизнеобеспечение стабильно",
    "кислород в норме","атмосфера стабильна","биосистемы активны","медотсек пуст",
    "здоровье экипажа в норме","травм нет",
    "топливо в норме","дейтерий стабилен","антиматерия удерживается","запас полный",
    "заправка не требуется","бункер в норме",
    "шлюзы задраены","люки закрыты","переходы герметичны","давление стабильно",
    "отсек в норме","двери активны",
    "ядро держит мощность","контур выдаёт параметр","щиты держат удар",
    "орудия готовы к залпу","сканер даёт картинку","связь не прерывается",
    "система стабильна и надёжна","все узлы работают штатно","параметры в допуске",
    "показания номинальные","значения стабильны","индекс в норме",
    "уровень мощности номинальный","частота стабильна","амплитуда в допуске",
    "плотность потока в норме","нагрузка номинальна","давление в норме",
    "температура стабильна","резерв достаточен","баланс сохранён",
    "скорость номинальна","угол в допуске","вектор зафиксирован",
    "контакт не обнаружен","объект не идентифицирован","цель вне зоны",
    "траектория стабильна","орбита удерживается","туманность в стороне",
    "астероидов нет","пояс обойдён","скопление в секторе",
    "бортовой журнал обновлён","телеметрия передана","протокол зафиксирован",
    "директива выполнена","устав соблюдён","приказ принят",
    "капитан на мостике","командование активно","экипаж готов","пост занят",
    "ждём распоряжений","в готовности","в дежурном режиме","без нагрузки",
    "на холостом ходу","в переходном режиме","в основном режиме",
    "работает штатно","функционирует нормально","выполняет задачу",
    "удерживает параметр","сохраняет стабильность","поддерживает режим",
    "фиксирует показания","отслеживает состояние","контролирует узел",
    "стабилизирует поток","регулирует мощность","оптимизирует баланс",
    "передаёт данные","принимает сигнал","обрабатывает запрос",
    "проверяет контур","диагностирует систему","сканирует сектор",
    "обнаруживает сигнал","идентифицирует объект","классифицирует контакт",
    "производит расчёт","выполняет манёвр","держит курс",
    "в норме","номинально","штатно","без отклонений","в допуске","без замечаний",
    "стабильно","активно","в резерве","в готовности","в дежурном режиме",
    "готово к работе","система в порядке","узел функционирует","блок активен"
  ];

  /* =========================================================
     ОБУЧЕНИЕ МАРКОВСКОЙ ЦЕПИ
     Строит таблицу: слово → список слов, которые шли после него.
     ========================================================= */
  const MARKOV = {
    table: {},      // { слово: [следующие слова] }
    starters: [],   // с каких слов начинать фразу
    order: 2        // порядок цепи (2 = по двум предыдущим словам)
  };

  function tokenize(str){
    return str.toLowerCase()
      .replace(/([.,!?;:])/g, ' $1 ')
      .split(/\s+/)
      .filter(Boolean);
  }

  function train(){
    MARKOV.table = {};
    MARKOV.starters = [];
    for(const line of CORPUS){
      const tokens = tokenize(line);
      if(tokens.length < 2) continue;
      MARKOV.starters.push(tokens[0]);

      /* порядок 2: ключ — пара слов, значение — следующее */
      for(let i = 0; i < tokens.length - MARKOV.order; i++){
        const key = tokens.slice(i, i + MARKOV.order).join(' ');
        const next = tokens[i + MARKOV.order];
        if(!MARKOV.table[key]) MARKOV.table[key] = [];
        MARKOV.table[key].push(next);
      }
      /* хвост: последнее слово без продолжения */
      const lastKey = tokens.slice(-MARKOV.order).join(' ');
      if(!MARKOV.table[lastKey]) MARKOV.table[lastKey] = [];
    }
  }

  /* =========================================================
     ГЕНЕРАЦИЯ МАРКОВСКОЙ ФРАЗЫ
     ========================================================= */
  function markovGenerate(maxWords = 12, seed = null){
    const pick2 = a => a[Math.floor(Math.random()*a.length)];

    /* стартовое слово — либо seed (для связности с темой), либо случайное */
    let start = seed && MARKOV.starters.includes(seed)
      ? seed
      : pick2(MARKOV.starters);

    /* ищем стартовую пару */
    let startKey = null;
    for(const k of Object.keys(MARKOV.table)){
      if(k.startsWith(start + ' ')){
        startKey = k;
        break;
      }
    }
    if(!startKey){
      startKey = pick2(Object.keys(MARKOV.table));
    }

    let words = startKey.split(' ');
    for(let i = 0; i < maxWords; i++){
      const key = words.slice(-MARKOV.order).join(' ');
      const nexts = MARKOV.table[key];
      if(!nexts || !nexts.length) break;
      const next = pick2(nexts);
      words.push(next);

      /* шанс остановиться раньше, чтобы не тянуть бесконечно */
      if(chance(0.2) && words.length >= 5) break;
    }

    return polish(words.join(' '));
  }

  /* --- чистка и капитализация --- */
  function polish(str){
    str = str.replace(/\s+([.,!?;:])/g, '$1');
    str = str.replace(/\s+/g, ' ').trim();
    if(!str) return '';
    str = str[0].toUpperCase() + str.slice(1);
    if(!/[.!?]$/.test(str)) str += '.';
    return str;
  }

  /* --- подстановка параметров в марковский текст --- */
  function injectParams(str, s){
    /* если в тексте есть «мощность», «сектор», «время» — подмешиваем реальные значения */
    if(/\bмощность\b/i.test(str) && chance(0.7)){
      str = str.replace(/\bмощность\b/i, `мощность ${s.power}`);
    }
    if(/\bсектор\b/i.test(str) && chance(0.7)){
      str = str.replace(/\bсектор\b/i, `сектор ${s.sector}`);
    }
    if(/\bвремя\b/i.test(str) && chance(0.6)){
      str = str.replace(/\bвремя\b/i, `время ${s.time}`);
    }
    return str;
  }

  /* =========================================================
     ЛЕКСИКА ДЛЯ ГРАММАТИКИ (из v0.4)
     ========================================================= */
  const LEX = {
    nouns_m: [
      {w:"реактор",sem:"core"},{w:"контур",sem:"core"},{w:"стабилизатор",sem:"core"},
      {w:"энергоблок",sem:"core"},{w:"дефлектор",sem:"shield"},{w:"щит",sem:"shield"},
      {w:"корпус",sem:"hull"},{w:"шпангоут",sem:"hull"},{w:"бластер",sem:"weapon"},
      {w:"ствол",sem:"weapon"},{w:"сканер",sem:"scan"},{w:"радар",sem:"scan"},
      {w:"детектор",sem:"scan"},{w:"двигатель",sem:"engine"},{w:"импульс",sem:"engine"},
      {w:"передатчик",sem:"comms"},{w:"канал",sem:"comms"},{w:"сигнал",sem:"comms"},
      {w:"шлюз",sem:"door"},{w:"люк",sem:"door"},{w:"отсек",sem:"door"},
      {w:"трюм",sem:"cargo"},{w:"буфер",sem:"energy"},{w:"накопитель",sem:"energy"},
      {w:"гравиконтур",sem:"grav"},{w:"протокол",sem:"system"},{w:"узел",sem:"system"},
      {w:"модуль",sem:"system"},{w:"контакт",sem:"threat"},{w:"объект",sem:"threat"},
      {w:"дроид",sem:"repair"}
    ],
    nouns_f: [
      {w:"система",sem:"system"},{w:"установка",sem:"core"},{w:"батарея",sem:"energy"},
      {w:"антенна",sem:"comms"},{w:"частота",sem:"space"},{w:"помеха",sem:"anomaly"},
      {w:"аномалия",sem:"anomaly"},{w:"туманность",sem:"space"},{w:"орбита",sem:"space"},
      {w:"траектория",sem:"space"},{w:"обшивка",sem:"hull"},{w:"броня",sem:"hull"},
      {w:"тяга",sem:"engine"},{w:"цель",sem:"threat"},{w:"угроза",sem:"threat"},
      {w:"связь",sem:"comms"},{w:"энергия",sem:"energy"},{w:"гравитация",sem:"grav"}
    ],
    nouns_n: [
      {w:"ядро",sem:"core"},{w:"поле",sem:"shield"},{w:"наведение",sem:"weapon"},
      {w:"оборудование",sem:"system"},{w:"устройство",sem:"system"},
      {w:"время",sem:"time"},{w:"скопление",sem:"space"}
    ],
    adj_m: ["номинальный","штатный","стабильный","резервный","дежурный","автономный","форсированный","переходный"],
    adj_f: ["номинальная","штатная","стабильная","резервная","дежурная","автономная","форсированная","переходная"],
    adj_n: ["номинальное","штатное","стабильное","резервное","дежурное","автономное","форсированное","переходное"],
    verbs: [
      {w:"удерживает",aux:"в"},{w:"сохраняет",aux:"в"},{w:"поддерживает",aux:"в"},
      {w:"фиксирует",aux:"в"},{w:"стабилизирует",aux:"в"},{w:"показывает",aux:""},
      {w:"подтверждает",aux:""},{w:"транслирует",aux:""},{w:"выдаёт",aux:""}
    ],
    adverbs: ["штатно","номинально","стабильно","без отклонений","в допуске","без замечаний"],
    states: ["в норме","в допуске","в резерве","в готовности","в дежурном режиме","без нагрузки"],
    inter: ["Принято","Есть","Так точно","Подтверждаю","Фиксирую","Слушаю","Курс"],
    conn: ["Согласно телеметрии","По данным сенсоров","С учётом параметров","В связи с этим"],
    prep: ["по","в","на","для","от"]
  };

  const SEMANTIC = {
    core:["shield","energy","engine","system"],
    shield:["core","weapon","threat"],
    weapon:["threat","scan","shield"],
    scan:["space","threat","anomaly","comms"],
    engine:["space","core"],
    comms:["space","system"],
    hull:["space","anomaly","repair"],
    cargo:["system","repair"],
    energy:["core","shield","system"],
    grav:["space","core"],
    space:["scan","threat","anomaly","engine"],
    time:["system"],
    threat:["weapon","shield","scan"],
    anomaly:["scan","space","system"],
    repair:["system","hull"],
    system:["core","energy","repair","comms"]
  };

  const pick   = a => a[Math.floor(Math.random()*a.length)];
  const chance = p => Math.random() < p;

  /* --- грамматика (из v0.4, компактно) --- */
  function nounFor(sem){
    const pool = [...LEX.nouns_m, ...LEX.nouns_f, ...LEX.nouns_n].filter(n => n.sem === sem);
    if(!pool.length) return pick([...LEX.nouns_m, ...LEX.nouns_f, ...LEX.nouns_n]);
    return pick(pool);
  }
  function genderOf(noun){
    if(LEX.nouns_m.some(n => n.w === noun.w)) return "m";
    if(LEX.nouns_f.some(n => n.w === noun.w)) return "f";
    return "n";
  }
  function adjFor(g){
    if(g === "m") return pick(LEX.adj_m);
    if(g === "f") return pick(LEX.adj_f);
    return pick(LEX.adj_n);
  }
  function NP(sem, withAdj){
    const n = nounFor(sem);
    const g = genderOf(n);
    const adj = withAdj && chance(0.55) ? adjFor(g) + " " : "";
    return { text: adj + n.w, sem: n.sem };
  }
  function PP(sem){
    if(!chance(0.6)) return "";
    const next = SEMANTIC[sem] ? pick(SEMANTIC[sem]) : "system";
    const n = nounFor(next);
    const g = genderOf(n);
    const adj = chance(0.4) ? adjFor(g) + " " : "";
    return ` ${pick(LEX.prep)} ${adj}${n.w}`;
  }
  function STATE(){ return chance(0.5) ? pick(LEX.states) : pick(LEX.adverbs); }

  function paramFor(sem, s){
    switch(sem){
      case "core":   return s.power;
      case "shield": return s.shields;
      case "scan":   return s.scan;
      case "weapon": return s.blaster;
      case "space":  return `сектор ${s.sector}`;
      case "time":   return s.time;
      case "engine": return s.power;
      case "energy": return s.power;
      default:       return s.power;
    }
  }

  function cap(str){ return str[0].toUpperCase() + str.slice(1); }

  function grammarSentence(sem, s){
    const roll = Math.random();
    const subj = NP(sem, true);
    const v = pick(LEX.verbs);
    if(roll < 0.35){
      return `${cap(subj.text)} ${v.w} ${paramFor(sem, s)} ${STATE()}.`;
    }
    if(roll < 0.65){
      return `${pick(LEX.conn)}, ${subj.text} ${v.w} ${paramFor(sem, s)}${PP(sem)}.`;
    }
    if(roll < 0.85){
      return `${pick(LEX.inter)}. ${cap(subj.text)} ${STATE()}.`;
    }
    return `${cap(subj.text)} — ${paramFor(sem, s)}. Сектор ${s.sector}.`;
  }

  /* =========================================================
     ГИБРИДНАЯ СБОРКА
     ========================================================= */
  function hybridSentence(sem, s){
    /* 60% — грамматика, 40% — марковский хвост */
    if(chance(0.6)){
      return grammarSentence(sem, s);
    }
    /* марковский фрагмент + грамматический старт */
    const seedMap = {
      core:"ядро", shield:"щиты", weapon:"бластеры", scan:"сканер",
      engine:"двигатели", comms:"связь", hull:"корпус", energy:"резерв",
      space:"курс", time:"время", threat:"угроза", anomaly:"аномалия",
      system:"система", repair:"ремонт"
    };
    const seed = seedMap[sem] || "система";
    let mk = markovGenerate(10, seed);
    mk = injectParams(mk, s);
    return cap(mk);
  }

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
  function remember(t){
    const now = Date.now();
    if(t === memory.lastTopic && now - memory.lastTime < 30000) memory.streak++;
    else memory.streak = 0;
    memory.lastTopic = t;
    memory.lastTime = now;
    memory.history.push(t);
    if(memory.history.length > 6) memory.history.shift();
  }
  const LINKS = {
    "core|shield":"Ядро держит. По защите: ",
    "shield|weapon":"В дополнение к щитам: ",
    "scan|threat":"По данным скана: ",
    "space|time":"По курсу уточняю: ",
    "energy|core":"Энергобаланс: ",
    "hull|repair":"По корпусу: "
  };
  function memoryPrefix(t){
    if(memory.history.length < 2) return '';
    const prev = memory.history[memory.history.length - 2];
    return LINKS[`${prev}|${t}`] || '';
  }

  /* =========================================================
     ПАРСЕР
     ========================================================= */
  const TOPIC_KEYS = {
    core:["реактор","ядро","энерг","мощност","плазм","силовая"],
    shield:["щит","защит","броня","оборон","поле","дефлектор"],
    weapon:["бластер","оруж","пушк","атак","огн","стрель","наведен","ствол","цель"],
    scan:["скан","радар","обзор","детект","сенсор","дальн","пеленг"],
    engine:["двигат","тяга","импульс","варп","разгон","марш","дюза"],
    comms:["связь","комм","переда","сигнал","канал","радио","эфир"],
    hull:["корпус","обшивк","гермет","целостн","шпанго"],
    cargo:["груз","трюм","карго","склад"],
    energy:["энерг","резерв","запас","батар","накопит","буфер"],
    grav:["гравит","тягот"],
    space:["курс","навиг","маршрут","атлас","звезд","звёзд","карт","координ","позиц","сектор"],
    time:["врем","час","дата","старод","хрон"],
    threat:["враг","противн","объект","угроз","опасн"],
    anomaly:["аномал","флукт","шум","помех"],
    system:["статус","состоян","доклад","сводк","систем","общ"],
    repair:["ремонт","починк","дрон","техобс","обслуж"]
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
    aggressive:{
      keys:["дурак","туп","идиот","чёрт","черт","капец","провал","катастроф"],
      replies:[
        "Капитан, рекомендую сохранять самообладание. Все системы {state}.",
        "Эмоции не влияют на телеметрию. Ядро {power}.",
        "Принято. Канал переведён в спокойный режим. Сектор {sector}."
      ]
    },
    panic:{
      keys:["помоги","срочно","быстро","спаси","падаем","взрыв"],
      replies:[
        "Спокойно, капитан. Проверяю контуры... {state}.",
        "Ситуация под контролем. Ядро {power}, щиты {shields}.",
        "Экстренный протокол не требуется. Сектор {sector} стабилен."
      ]
    },
    friendly:{
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
    for(const rule of Object.values(MOOD)){
      for(const k of rule.keys){
        if(t.includes(k)) return pick(rule.replies);
      }
    }
    return null;
  }

  function interpolate(str, s){
    return str.replace(/\{(\w+)\}/g, (_, k) => s[k] ?? `{${k}}`);
  }

  /* =========================================================
     ГЛАВНЫЙ ГЕНЕРАТОР
     ========================================================= */
  function generateReply(text){
    const s = snapshot();

    /* эмоции */
    const mood = detectMood(text);
    if(mood) return interpolate(mood, s);

    /* тема */
    const topic = findTopic(text);
    if(!topic){
      return pick([
        "Капитан, запрос вне приоритетных директив. Уточните параметр.",
        "Вне зоны сенсоров. Дайте команду в терминах систем.",
        "Не распознано. Доступные директивы: ядро, щиты, орудия, навигация, связь.",
        "Уточните узел: реактор, орудия, сканер или курс."
      ]);
    }

    remember(topic);

    /* залипание */
    if(memory.streak >= 2 && chance(0.7)){
      return pick([
        "Капитан, вы уже третий раз про это. Показания не менялись.",
        "Повторный запрос по тому же узлу. Всё стабильно.",
        `Подтверждаю: без изменений. ${s.power}.`
      ]);
    }

    /* выбор режима */
    let core;
    if(MODE === 'grammar') core = grammarSentence(topic, s);
    else if(MODE === 'markov') core = cap(injectParams(markovGenerate(12), s));
    else core = hybridSentence(topic, s);

    const prefix = memoryPrefix(topic);
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
  /* обучение при первом обращении */
  let trained = false;
  function ensureTrained(){ if(!trained){ train(); trained = true; } }

  return {
    init(){ ensureTrained(); },

    respond(text){ ensureTrained(); return generateReply(text); },

    setMode(mode){
      if(['grammar','markov','hybrid'].includes(mode)) MODE = mode;
    },
    getMode(){ return MODE; },

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
      ensureTrained();
      const s = snapshot();
      /* пассивная реплика — гибрид: грамматика + марковский хвост */
      if(chance(0.5)){
        let mk = markovGenerate(8);
        return cap(injectParams(mk, s));
      }
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
    _corpus: CORPUS,
    _table: () => MARKOV.table,
    _markov: markovGenerate,
    _grammar: grammarSentence
  };

})();

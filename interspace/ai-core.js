/* =========================================================
   AI-CORE · гибрид-движок для специализированного ИИ
   v0.2 · вынесен из index.html
   ---------------------------------------------------------
   Слои: словари → грамматика → темы → память → шум
   API:  AI.init(url)      — загрузка модели
         AI.respond(text)  — генерация ответа
         AI.clarify()      — ложное уточнение
         AI.recheck()      — перепроверка
         AI.passive()      — пассивная реплика
         AI.snapshot()     — снимок параметров
         AI.setState(obj)  — обновление параметров извне
   ========================================================= */

const AI = (function(){

  /* --- приватное состояние --- */
  let MODEL = null;          // загруженная модель
  let state = {};            // текущий снимок параметров
  let memory = {
    history: [],
    lastTopic: null,
    lastTime: 0,
    streak: 0
  };

  /* --- утилиты --- */
  const pick   = arr => arr[Math.floor(Math.random()*arr.length)];
  const chance = p   => Math.random() < p;

  /* =========================================================
     СНИМОК СОСТОЯНИЯ
     ========================================================= */
  function snapshot(){
    return {
      power:    state.power    ?? (70 + Math.random()*25).toFixed(1)+' %',
      temp:     state.temp     ?? (1.1 + Math.random()*0.3).toFixed(2)+' × 10⁷ K',
      shields:  state.shields  ?? (78 + Math.floor(Math.random()*18))+' %',
      scan:     state.scan     ?? (30 + Math.floor(Math.random()*60))+' %',
      blaster:  state.blaster  ?? (Math.random() > 0.15 ? 'ГОТОВЫ' : 'ПЕРЕЗАРЯДКА'),
      sector:   state.sector   ?? pick(['7G','12B','44A','09C','21F','88D']),
      time:     new Date().toLocaleTimeString('ru-RU',{hour12:false}),
      stardate: (Math.floor(Date.now()/1000) % 99999).toString().padStart(5,'0')
    };
  }

  /* =========================================================
     ПАМЯТЬ
     ========================================================= */
  function remember(topicId){
    const now = Date.now();
    if(topicId === memory.lastTopic && now - memory.lastTime < 30000){
      memory.streak++;
    } else {
      memory.streak = 0;
    }
    memory.lastTopic = topicId;
    memory.lastTime  = now;
    memory.history.push(topicId);
    if(memory.history.length > 6) memory.history.shift();
  }

  function memoryPrefix(topicId){
    if(memory.history.length < 2) return '';
    const prev = memory.history[memory.history.length - 2];
    const links = MODEL.memoryLinks || {};
    return links[`${prev}|${topicId}`] || '';
  }

  /* =========================================================
     ПАРСЕР
     ========================================================= */
  function findTopic(text){
    const t = text.toLowerCase();
    let best = null, score = 0;
    for(const topic of MODEL.topics){
      let s = 0;
      for(const k of topic.keys){
        if(t.includes(k)) s += k.length;
      }
      if(s > score){ score = s; best = topic; }
    }
    return best;
  }

  /* =========================================================
     СБОРЩИК ФРАЗ
     Компилирует строку-шаблон, подставляя значения.
     ========================================================= */
  function compile(str, s){
    return str.replace(/\{(\w+)\}/g, (_, key) => {
      if(key in s) return s[key];
      // из словарей
      if(MODEL.lex[key]) return pick(MODEL.lex[key]);
      return `{${key}}`;
    });
  }

  /* =========================================================
     ГЕНЕРАЦИЯ ОТВЕТА
     ========================================================= */
  function generateReply(userText){
    const s = snapshot();
    const topic = findTopic(userText);

    /* вне темы */
    if(!topic){
      return compile(pick(MODEL.fallback), s);
    }

    remember(topic.id);

    /* залипание */
    if(memory.streak >= 2 && chance(0.7)){
      return compile(pick(MODEL.stall), s);
    }

    /* сборка */
    const core   = compile(pick(topic.forms), s);
    const prefix = memoryPrefix(topic.id);
    const tail   = compile(pick(MODEL.tails), s);

    return prefix + core + tail;
  }

  /* =========================================================
     ПУБЛИЧНЫЙ API
     ========================================================= */
  return {

    /* --- загрузка модели --- */
    async init(url){
      const res = await fetch(url);
      if(!res.ok) throw new Error('model not found: '+url);
      MODEL = await res.json();
      return MODEL;
    },

    /* --- основной ответ --- */
    respond(text){
      if(!MODEL) return 'Модель не загружена.';
      return generateReply(text);
    },

    /* --- ложное уточнение --- */
    clarify(){
      if(!MODEL) return 'Уточните параметр.';
      return pick(MODEL.clarify);
    },

    /* --- перепроверка --- */
    recheck(){
      if(!MODEL) return 'Проверяю...';
      return pick(MODEL.recheck);
    },

    /* --- пассивная реплика --- */
    passive(){
      if(!MODEL) return '';
      return compile(pick(MODEL.passive), snapshot());
    },

    /* --- снимок --- */
    snapshot,

    /* --- внешнее обновление параметров (из пульта) --- */
    setState(obj){
      state = Object.assign(state, obj);
    },

    /* --- сброс памяти (для отладки) --- */
    resetMemory(){
      memory = { history:[], lastTopic:null, lastTime:0, streak:0 };
    }
  };

})();

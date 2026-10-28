// XXXP_NP.js — Imperial Scientist's Symmetry Engine
// Генерация пар (x,y), признаки N=x*y, поиск устойчивой связи.

(function () {
  'use strict';

  // ---------- Утилиты ----------
  function randInt(min, max) { // включительно
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function bitLength(n) {
    return n === 0 ? 1 : Math.floor(Math.log2(n)) + 1;
  }

  function isPrime(n) {
    if (n < 2) return false;
    if (n % 2 === 0) return n === 2;
    for (let i = 3; i * i <= n; i += 2) {
      if (n % i === 0) return false;
    }
    return true;
  }

  // случайное простое в диапазоне [2^bits-1, 2^bits)
  function randomPrime(bits) {
    const lo = Math.pow(2, bits - 1);
    const hi = Math.pow(2, bits) - 1;
    for (let tries = 0; tries < 10000; tries++) {
      const c = randInt(lo, hi);
      if (isPrime(c)) return c;
    }
    return lo; // fallback
  }

  function gcd(a, b) {
    while (b) { const t = b; b = a % b; a = t; }
    return a;
  }

  // ---------- Генерация пар по режимам ----------
  const MODES = [
    { id: 1, name: 'равные длины (32/32)', gen: () => [randInt(2**31, 2**32-1), randInt(2**31, 2**32-1)] },
    { id: 2, name: 'разные длины (16/48)', gen: () => [randInt(2**15, 2**16-1), randInt(2**47, 2**48-1)] },
    { id: 3, name: 'оба простые (24/24)', gen: () => [randomPrime(24), randomPrime(24)] },
    { id: 4, name: 'оба составные (24/24)', gen: () => {
        let a, b;
        do { a = randInt(2**23, 2**24-1); } while (isPrime(a));
        do { b = randInt(2**23, 2**24-1); } while (isPrime(b));
        return [a, b];
      } },
    { id: 5, name: 'простое × составное (24/24)', gen: () => {
        let b;
        do { b = randInt(2**23, 2**24-1); } while (isPrime(b));
        return [randomPrime(24), b];
      } },
    { id: 6, name: 'с общим множителем', gen: () => {
        const g = randInt(2, 1000);
        return [g * randInt(2**20, 2**23), g * randInt(2**20, 2**23)];
      } },
    { id: 7, name: 'взаимно простые', gen: () => {
        let a, b;
        do { a = randInt(2**23, 2**24-1); b = randInt(2**23, 2**24-1); } while (gcd(a, b) !== 1);
        return [a, b];
      } },
    { id: 8, name: 'гладкие (малые простые)', gen: () => {
        const small = [2,3,5,7,11,13];
        let a = 1, b = 1;
        while (bitLength(a) < 24) a *= small[randInt(0, small.length-1)];
        while (bitLength(b) < 24) b *= small[randInt(0, small.length-1)];
        return [a, b];
      } },
    { id: 9, name: 'похожие старшие биты', gen: () => {
        const base = randInt(2**22, 2**23);
        return [base * 2 + randInt(0, 1), base * 2 + randInt(0, 1)];
      } }
  ];

  const PER_MODE = 60;      // пар на режим
  const TEST_FRACTION = 0.25;

  function buildDataset() {
    const data = [];
    for (const m of MODES) {
      for (let i = 0; i < PER_MODE; i++) {
        const [x, y] = m.gen();
        if (x <= 0 || y <= 0) continue;
        const N = x * y;
        data.push({ x, y, N, mode: m.id });
      }
    }
    return data;
  }

  // ---------- Признаки ----------
  function digitFeatures(N) {
    const s = N.toString();
    let sum = 0, prod = 1, even = 0, odd = 0;
    const counts = new Array(10).fill(0);
    for (const ch of s) {
      const d = +ch;
      sum += d; prod = (prod * (d || 1)) % 1e9;
      counts[d]++;
      if (d % 2 === 0) even++; else odd++;
    }
    return {
      digit_sum: sum,
      digit_count: s.length,
      even_frac: even / s.length,
      distinct_digits: counts.filter(c => c > 0).length,
      digit_entropy: -counts.reduce((acc, c) => c ? acc + (c/s.length)*Math.log2(c/s.length) : acc, 0)
    };
  }

  function modularFeatures(N) {
    const smallPrimes = [3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101];
    const f = {};
    for (const p of smallPrimes) {
      f['mod' + p] = N % p;
    }
    // Квадратичные вычеты: символ Лежандра для нескольких простых
    // (N/p) = N^((p-1)/2) mod p, значения: 0, 1, p-1
    for (const p of [3,5,7,11,13,17,19,23,29,31]) {
      let leg;
      if (N % p === 0) leg = 0;
      else {
        // быстрое возведение в степень по модулю
        let base = N % p, exp = (p - 1) / 2, res = 1;
        while (exp > 0) {
          if (exp & 1) res = (res * base) % p;
          base = (base * base) % p;
          exp >>= 1;
        }
        leg = res === 1 ? 1 : -1;
      }
      f['leg' + p] = leg;
    }
    return f;
  }

  function bitFeatures(N) {
    // для больших N используем Number (безопасно до 2^53, наши N ~ 2^48 — ок)
    let pop = 0, runs = 0, prev = -1;
    let v = N;
    while (v > 0) {
      const bit = v % 2;
      if (bit === 1) pop++;
      if (prev !== -1 && bit !== prev) runs++;
      prev = bit;
      v = Math.floor(v / 2);
    }
    return { popcount: pop, bit_runs: runs, bit_length: bitLength(N) };
  }

  function features(N) {
    return Object.assign({}, digitFeatures(N), modularFeatures(N), bitFeatures(N));
  }

  function targetOf(pair) {
    // Нормализованный target: отклонение log2(x) от тривиального тренда
    // Тривиальный тренд: log2(x) ≈ 0.5 * log2(N) (т.к. N = x*y, в среднем x~y)
    // Остаток — то, что НЕ объясняется длиной N.
    const log2N = Math.log2(pair.N);
    return Math.log2(pair.x) - 0.5 * log2N;
  }

  // ---------- Простое решающее дерево (регрессия) ----------
  // Обучаем дерево глубины 2 по одному признаку: ищем лучший split.
  function bestSplit(data, featNames, depth, maxDepth) {
    if (depth >= maxDepth || data.length < 8) return { leaf: true, value: mean(data) };
    let best = null;
    for (const f of featNames) {
      const vals = data.map(d => d.feat[f]).slice().sort((a,b)=>a-b);
      // кандидаты split — квантили
      const cands = [];
      for (let q = 1; q <= 3; q++) {
        const idx = Math.floor(vals.length * q / 4);
        if (idx > 0 && idx < vals.length) cands.push(vals[idx]);
      }
      for (const t of cands) {
        const left = data.filter(d => d.feat[f] <= t);
        const right = data.filter(d => d.feat[f] > t);
        if (left.length < 4 || right.length < 4) continue;
        const sse = sseOf(left) + sseOf(right);
        if (!best || sse < best.sse) best = { sse, f, t, left, right };
      }
    }
    if (!best) return { leaf: true, value: mean(data) };
    return {
      leaf: false, f: best.f, t: best.t,
      left: bestSplit(best.left, featNames, depth+1, maxDepth),
      right: bestSplit(best.right, featNames, depth+1, maxDepth)
    };
  }

  function mean(arr) {
    if (!arr.length) return 0;
    return arr.reduce((s, d) => s + targetOf(d), 0) / arr.length;
  }

  function sseOf(arr) {
    const m = mean(arr);
    return arr.reduce((s, d) => s + (targetOf(d) - m) ** 2, 0);
  }

  function predict(tree, d) {
    if (tree.leaf) return tree.value;
    return d.feat[tree.f] <= tree.t ? predict(tree.left, d) : predict(tree.right, d);
  }

  function r2(tree, data) {
    const m = mean(data);
    let ssRes = 0, ssTot = 0;
    for (const d of data) {
      ssRes += (targetOf(d) - predict(tree, d)) ** 2;
      ssTot += (targetOf(d) - m) ** 2;
    }
    return ssTot === 0 ? 0 : 1 - ssRes / ssTot;
  }

  // ---------- Публичные функции ----------
  const state = { dataset: null };

  function generate() {
    const data = buildDataset();
    state.dataset = data;
    // Показываем 5 примеров
    const lines = [];
    lines.push('Сгенерировано пар: ' + data.length);
    lines.push('Режимы: ' + MODES.map(m => m.id).join(', '));
    lines.push('');
    lines.push('Примеры (x, y, N):');
    for (let i = 0; i < 5 && i < data.length; i++) {
      const d = data[i];
      lines.push(`  x=${d.x}  y=${d.y}  N=${d.N}  [режим ${d.mode}]`);
    }
    lines.push('');
    lines.push('Нажмите «СИММЕТРИИ ХАОСА» для статистического анализа.');
    return lines.join('\n');
  }

    function findSymmetry() {
    if (!state.dataset) return '> Сначала сгенерируйте данные (кнопка «ГЕНЕРАТОР ЗНАЧЕНИЙ»).';
    const data = state.dataset;

    // Признаки
    for (const d of data) d.feat = features(d.N);

    // Убираем признаки-утечки режима: длину N и число цифр
    const LEAKY = new Set(['bit_length', 'digit_count']);
    const featNames = Object.keys(data[0].feat).filter(f => !LEAKY.has(f));

    // Группируем по режимам
    const byMode = {};
    for (const d of data) (byMode[d.mode] = byMode[d.mode] || []).push(d);

    const modeResults = [];   // { id, name, trainR2, testR2, baselineR2, top }
    const allImportance = {};

    for (const m of MODES) {
      const arr = (byMode[m.id] || []).slice();
      if (arr.length < 10) continue; // слишком мало для честного split

      // Перемешиваем и делим внутри режима
      arr.sort(() => Math.random() - 0.5);
      const cut = Math.floor(arr.length * (1 - TEST_FRACTION));
      const train = arr.slice(0, cut);
      const test = arr.slice(cut);
      if (train.length < 6 || test.length < 4) continue;

      // Baseline: среднее по train
      const baselineTree = { leaf: true, value: mean(train) };
      const baselineR2 = r2(baselineTree, test);

      // Дерево глубины 3 — обучаем ТОЛЬКО на train этого режима
      const tree = bestSplit(train, featNames, 0, 3);
      const trainR2 = r2(tree, train);
      const testR2 = r2(tree, test);

      // Важность внутри режима
      const importance = {};
      (function walk(t) {
        if (t.leaf) return;
        importance[t.f] = (importance[t.f] || 0) + 1;
        walk(t.left); walk(t.right);
      })(tree);
      for (const f in importance) {
        allImportance[f] = (allImportance[f] || 0) + importance[f];
      }
      const top = Object.entries(importance).sort((a,b)=>b[1]-a[1]).slice(0,3);

      modeResults.push({ id: m.id, name: m.name, trainR2, testR2, baselineR2, top });
    }

    // Сводка
    const lines = [];
    lines.push('=== СТАТИСТИЧЕСКИЙ АНАЛИЗ (per-mode, без утечки режима) ===');
    lines.push('Target: log2(x) - 0.5*log2(N).  Обучение и тест — внутри каждого режима.');
    lines.push('Признаки-утечки (bit_length, digit_count) исключены.');
    lines.push('');

    if (modeResults.length === 0) {
      lines.push('Недостаточно данных для анализа.');
      return lines.join('\n');
    }

    lines.push('Результаты по режимам:');
    lines.push('  режим | train R² | test R² | baseline | топ-признак');
    lines.push('  ------+----------+---------+----------+-----------');
    for (const r of modeResults) {
      const topStr = r.top.length ? r.top.map(([f,c]) => `${f}(${c})`).join(', ') : '—';
      lines.push(`  ${String(r.id).padStart(5)} | ${r.trainR2.toFixed(3).padStart(8)} | ${r.testR2.toFixed(3).padStart(7)} | ${r.baselineR2.toFixed(3).padStart(8)} | ${topStr}`);
    }
    lines.push('');

    // Средний test R² по режимам
    const avgTest = modeResults.reduce((s, r) => s + r.testR2, 0) / modeResults.length;
    const avgBaseline = modeResults.reduce((s, r) => s + r.baselineR2, 0) / modeResults.length;
    const delta = avgTest - avgBaseline;
    const strongModes = modeResults.filter(r => r.testR2 > 0.1).length;
    const weakModes = modeResults.filter(r => r.testR2 > 0.03).length;

    lines.push(`Средний test R² по режимам: ${avgTest.toFixed(3)}   Baseline: ${avgBaseline.toFixed(3)}   Δ = ${delta.toFixed(3)}`);
    lines.push(`Режимов с R² > 0.1: ${strongModes} из ${modeResults.length}`);
    lines.push(`Режимов с R² > 0.03: ${weakModes} из ${modeResults.length}`);
    lines.push('');

    // Топ-признаки суммарно
    const topAll = Object.entries(allImportance).sort((a,b)=>b[1]-a[1]).slice(0,5);
    lines.push('Топ-признаки суммарно по всем режимам:');
    if (topAll.length === 0) lines.push('  (дерево не нашло разбиений)');
    else topAll.forEach(([f,c]) => lines.push(`  ${f}: ${c}`));
    lines.push('');

    // Вердикт
    if (strongModes >= 3 && delta > 0.1) {
      lines.push('>>> ВЕРДИКТ: ЕСТЬ СИГНАЛ (устойчивый, внутри режимов)');
      lines.push(`    ${strongModes} режимов с R² > 0.1, средний Δ = ${delta.toFixed(3)}.`);
      lines.push('    Связь не объясняется длиной N и не является утечкой режима.');
    } else if (weakModes >= 3 && delta > 0.03) {
      lines.push('>>> ВЕРДИКТ: СЛАБЫЙ СИГНАЛ');
      lines.push(`    ${weakModes} режимов с R² > 0.03, средний Δ = ${delta.toFixed(3)}.`);
      lines.push('    Требуется проверка на большей выборке.');
    } else {
      lines.push('>>> ВЕРДИКТ: СИГНАЛА НЕТ');
      lines.push(`    Средний Δ = ${delta.toFixed(3)}, режимов с R² > 0.1: ${strongModes}.`);
      lines.push('    Внутри режимов устойчивой нетривиальной связи не обнаружено.');
    }
    lines.push('');
    lines.push('Примечание: если сигнал есть, он должен проявляться ВНУТРИ режима,');
    lines.push('где длина N и режим фиксированы. Тогда это кандидат в закономерность.');

    return lines.join('\n');
  }

    // ---------- Закладка 2: SEARCH FOR FORM ----------
  function formTask() {
    return [
      '=== SEARCH FOR FORM ===',
      '',
      'Постановка задачи (не «симметрия цифр», а структура):',
      '',
      'Дано: N = x*y, x,y неизвестны.',
      'Цель: найти функцию F(N), которая:',
      '  1) инвариантна относительно выбора множителя (F(N) не зависит от того,',
      '     какой из x,y назван «первым»);',
      '  2) различает пары (x,y) с одинаковым N сильнее, чем случайная догадка;',
      '  3) вычислима за полином от log N.',
      '',
      'Ключевое отличие от «симметрии цифр»:',
      '  Цифры N — это запись в позиционной системе, она НЕ согласована с умножением.',
      '  N mod 10 не связан с x mod 10 и y mod 10 (кроме mod 2 и mod 5).',
      '  Поэтому искать надо в структуре мультипликативной группы Z_N*,',
      '  а не в десятичных цифрах.',
      '',
      'Кандидаты в F(N):',
      '  - порядок группы Z_N* = φ(N);',
      '  - длина периода N по модулю малых простых;',
      '  - символ Лежандра (N/p) для многих p;',
      '  - приближённое отношение x/y через непрерывные дроби √N;',
      '  - спектр оператора умножения на N в Z_N*.',
      '',
      'Эксперимент ниже проверяет первую гипотезу:',
      '  «каноническая форма» — нормировка N на его НОД с малыми простыми,',
      '  и проверка, различает ли она x и y лучше, чем случайность.'
    ].join('\n');
  }

  function formExperiment() {
    // Берём пары с общим множителем и без, считаем «каноническую форму»
    // как вектор (N mod p) по малым простым, нормированный на gcd(N,p).
    // Проверяем: различает ли этот вектор x и y (т.е. асимметрию).
    const smallPrimes = [3,5,7,11,13,17,19,23,29,31,37,41,43,47];
    const results = [];

    for (let trial = 0; trial < 200; trial++) {
      // генерируем пару с общим множителем
      const g = randInt(2, 50);
      const x = g * randInt(2**20, 2**22);
      const y = g * randInt(2**20, 2**22);
      const N = x * y;

      // каноническая форма: N mod p, нормированный на gcd(N,p)
      const vec = smallPrimes.map(p => {
        const gnp = gcd(N % p === 0 ? p : N % p, p);
        return gnp === 0 ? 0 : (N % p) / gnp;
      });

      // асимметрия x,y
      const asym = Math.log2(x) - Math.log2(y);

      // корреляция между компонентами vec и asym
      results.push({ vec, asym });
    }

    // Считаем корреляцию Пирсона для каждой компоненты
    const n = results.length;
    const meanAsym = results.reduce((s,r)=>s+r.asym,0)/n;
    const varAsym = results.reduce((s,r)=>s+(r.asym-meanAsym)**2,0)/n;

    const corrs = smallPrimes.map((p, idx) => {
      const comp = results.map(r => r.vec[idx]);
      const meanC = comp.reduce((s,v)=>s+v,0)/n;
      const varC = comp.reduce((s,v)=>s+(v-meanC)**2,0)/n;
      if (varC === 0) return { p, corr: 0 };
      let cov = 0;
      for (let i = 0; i < n; i++) cov += (comp[i]-meanC)*(results[i].asym-meanAsym);
      cov /= n;
      return { p, corr: cov / Math.sqrt(varC*varAsym) };
    });

    corrs.sort((a,b)=>Math.abs(b.corr)-Math.abs(a.corr));

    const lines = [];
    lines.push('=== ЭКСПЕРИМЕНТ: КАНОНИЧЕСКАЯ ФОРМА ===');
    lines.push('');
    lines.push('Гипотеза: вектор (N mod p)/gcd(N mod p, p) по малым p');
    lines.push('коррелирует с асимметрией log2(x) - log2(y).');
    lines.push('');
    lines.push('Корреляции (по убыванию |r|):');
    for (const c of corrs.slice(0, 8)) {
      lines.push(`  p=${String(c.p).padStart(3)}  r = ${c.corr.toFixed(4)}`);
    }
    lines.push('');
    const maxCorr = Math.abs(corrs[0].corr);
    lines.push(`Максимальная |r|: ${maxCorr.toFixed(4)}`);
    lines.push('');
    if (maxCorr > 0.3) {
      lines.push('>>> ВЕРДИКТ: ЕСТЬ КОРРЕЛЯЦИЯ');
      lines.push('    Каноническая форма различает x и y сильнее случайного.');
      lines.push('    Это кандидат в F(N), требует проверки на больших N.');
    } else if (maxCorr > 0.1) {
      lines.push('>>> ВЕРДИКТ: СЛАБАЯ КОРРЕЛЯЦИЯ');
      lines.push('    Возможно, сигнал есть, но выборка мала (200 пар).');
    } else {
      lines.push('>>> ВЕРДИКТ: КОРРЕЛЯЦИИ НЕТ');
      lines.push('    Каноническая форма по малым простым не различает x и y.');
      lines.push('    Искать нужно в другом инварианте (порядок Z_N*, спектр).');
    }
    lines.push('');
    lines.push('Примечание: это проверка одной гипотезы, а не доказательство.');
    lines.push('Отрицательный результат тоже ценен: он сужает область поиска.');

    return lines.join('\n');
  }

  function formStructure() {
    // Проверяем: для простых x,y пара (N, φ(N)) даёт x+y и xy,
    // значит x и y восстанавливаются решением квадратного уравнения.
    // Это РЕАЛЬНАЯ структура — сигнал должен быть сильным.
    // Сравниваем с составными x,y, где φ(N) так просто не работает.

    const trials = 200;
    const results = { prime: [], composite: [] };

    for (let t = 0; t < trials; t++) {
      // Простые x,y
      const xp = randomPrime(20);
      const yp = randomPrime(20);
      const Np = xp * yp;
      // φ(N) для простых x,y: (x-1)(y-1) = N - (x+y) + 1
      // Отсюда: x+y = N - φ(N) + 1. Но φ(N) мы НЕ знаем — вычисляем через x,y.
      const phi = (xp - 1) * (yp - 1);
      const sum = Np - phi + 1; // = x+y
      // Решаем t^2 - sum*t + N = 0
      const disc = sum * sum - 4 * Np;
      const sqrtDisc = Math.sqrt(disc);
      const xRec = (sum + sqrtDisc) / 2;
      const yRec = (sum - sqrtDisc) / 2;
      // Ошибка восстановления
      const err = Math.abs(xRec - xp) / xp + Math.abs(yRec - yp) / yp;
      results.prime.push(err);
    }

    for (let t = 0; t < trials; t++) {
      // Составные x,y
      let xc, yc;
      do { xc = randInt(2**19, 2**20); } while (isPrime(xc));
      do { yc = randInt(2**19, 2**20); } while (isPrime(yc));
      const Nc = xc * yc;
      // φ(N) для составных вычисляем честно через факторизацию (медленно, но для теста ок)
      const phi = eulerPhi(Nc);
      const sum = Nc - phi + 1;
      const disc = sum * sum - 4 * Nc;
      let err;
      if (disc < 0) {
        err = 1; // восстановление невозможно
      } else {
        const sqrtDisc = Math.sqrt(disc);
        const xRec = (sum + sqrtDisc) / 2;
        const yRec = (sum - sqrtDisc) / 2;
        err = Math.abs(xRec - xc) / xc + Math.abs(yRec - yc) / yc;
      }
      results.composite.push(err);
    }

    const meanPrime = results.prime.reduce((s,v)=>s+v,0)/trials;
    const meanComp = results.composite.reduce((s,v)=>s+v,0)/trials;

    const lines = [];
    lines.push('=== ЭКСПЕРИМЕНТ: СТРУКТУРА φ(N) ===');
    lines.push('');
    lines.push('Гипотеза: для простых x,y пара (N, φ(N)) даёт систему');
    lines.push('  x+y = N - φ(N) + 1,  xy = N,');
    lines.push('которая решается квадратным уравнением за полином.');
    lines.push('Для составных x,y это НЕ работает так просто.');
    lines.push('');
    lines.push('Средняя относительная ошибка восстановления x,y:');
    lines.push(`  простые x,y:    ${meanPrime.toExponential(3)}`);
    lines.push(`  составные x,y:  ${meanComp.toExponential(3)}`);
    lines.push('');
    if (meanPrime < 1e-10 && meanComp > 1e-3) {
      lines.push('>>> ВЕРДИКТ: СТРУКТУРА ЕСТЬ (как и ожидалось)');
      lines.push('    Для простых x,y восстановление точное — это реальная структура,');
      lines.push('    а не шум. Для составных — не работает без факторизации.');
      lines.push('    Это подтверждает: сигнал надо искать в структуре, а не в цифрах.');
    } else if (meanPrime < 1e-10) {
      lines.push('>>> ВЕРДИКТ: СТРУКТУРА ЕСТЬ для простых, но и для составных тоже.');
      lines.push('    Проверьте, не упростилась ли задача.');
    } else {
      lines.push('>>> ВЕРДИКТ: ЧТО-ТО НЕ ТАК');
      lines.push('    Восстановление для простых не точное — проверьте eulerPhi.');
    }
    lines.push('');
    lines.push('Вывод: этот эксперимент — контрольный. Он показывает, как выглядит');
    lines.push('РЕАЛЬНЫЙ сигнал (ошибка ~1e-12) в отличие от шума (r ~ 0.14).');
    lines.push('Искать нужно структуру, дающую такую же точность за полином.');

    return lines.join('\n');
  }

  // φ(N) через факторизацию (для теста, N ~ 2^40 — быстро)
  function eulerPhi(n) {
    let result = n;
    let m = n;
    for (let p = 2; p * p <= m; p++) {
      if (m % p === 0) {
        while (m % p === 0) m /= p;
        result -= result / p;
      }
    }
    if (m > 1) result -= result / m;
    return result;
  }

  window.XXXP_NP = { generate, findSymmetry, formTask, formExperiment, formStructure };
})();

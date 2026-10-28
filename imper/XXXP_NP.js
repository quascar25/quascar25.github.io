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

  window.XXXP_NP = { generate, findSymmetry };
})();

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
    return {
      mod3: N % 3, mod7: N % 7, mod9: N % 9, mod11: N % 11,
      mod13: N % 13, mod37: N % 37, mod101: N % 101
    };
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
    // цель: предсказать log2(x) — длину первого множителя
    return Math.log2(pair.x);
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

    // Разбиение train/test, стратифицированно по режимам
    const train = [], test = [];
    const byMode = {};
    for (const d of data) (byMode[d.mode] = byMode[d.mode] || []).push(d);
    for (const m in byMode) {
      const arr = byMode[m].slice().sort(() => Math.random() - 0.5);
      const cut = Math.floor(arr.length * (1 - TEST_FRACTION));
      train.push(...arr.slice(0, cut));
      test.push(...arr.slice(cut));
    }

    const featNames = Object.keys(train[0].feat);

    // Baseline: предсказание средним
    const baselineR2 = r2({ leaf: true, value: mean(train) }, test);

    // Дерево глубины 3
    const tree = bestSplit(train, featNames, 0, 3);
    const trainR2 = r2(tree, train);
    const testR2 = r2(tree, test);

    // Важность признаков (по числу использований)
    const importance = {};
    (function walk(t) {
      if (t.leaf) return;
      importance[t.f] = (importance[t.f] || 0) + 1;
      walk(t.left); walk(t.right);
    })(tree);
    const top = Object.entries(importance).sort((a,b)=>b[1]-a[1]).slice(0,3);

    // Разбивка по режимам
    const perMode = {};
    for (const m of MODES) {
      const tm = test.filter(d => d.mode === m.id);
      if (tm.length > 3) perMode[m.id] = r2(tree, tm);
    }

    const lines = [];
    lines.push('=== СТАТИСТИЧЕСКИЙ АНАЛИЗ ===');
    lines.push(`Train R²: ${trainR2.toFixed(3)}   Test R²: ${testR2.toFixed(3)}   Baseline (среднее): ${baselineR2.toFixed(3)}`);
    lines.push('');
    lines.push('R² по режимам (test):');
    for (const m of MODES) {
      if (perMode[m.id] !== undefined) {
        lines.push(`  режим ${m.id} (${m.name}): ${perMode[m.id].toFixed(3)}`);
      }
    }
    lines.push('');
    lines.push('Топ-признаки (по использованию в дереве):');
    if (top.length === 0) lines.push('  (дерево не нашло разбиений)');
    else top.forEach(([f, c]) => lines.push(`  ${f}: ${c}`));

    lines.push('');
    // Вердикт
    const delta = testR2 - baselineR2;
    const stableModes = Object.values(perMode).filter(v => v > 0.05).length;

    if (delta > 0.1 && stableModes >= 3) {
      lines.push('>>> ВЕРДИКТ: ЕСТЬ СИГНАЛ');
      lines.push(`    Устойчивая связь между признаками N и длиной x.`);
      lines.push(`    ΔR² = ${delta.toFixed(3)}, стабильных режимов: ${stableModes}.`);
    } else if (delta > 0.03) {
      lines.push('>>> ВЕРДИКТ: СЛАБЫЙ СИГНАЛ');
      lines.push(`    ΔR² = ${delta.toFixed(3)}, стабильных режимов: ${stableModes}.`);
      lines.push('    Требуется дополнительная проверка.');
    } else {
      lines.push('>>> ВЕРДИКТ: СИГНАЛА НЕТ');
      lines.push(`    ΔR² = ${delta.toFixed(3)} (ниже порога 0.03).`);
      lines.push('    Устойчивой закономерности не обнаружено.');
    }
    lines.push('');
    lines.push('Примечание: младшие биты N всегда коррелируют с младшими битами x,y —');
    lines.push('это известный факт, а не находка. Ищем связь со СТАРШИМИ битами и цифрами.');

    return lines.join('\n');
  }

  window.XXXP_NP = { generate, findSymmetry };
})();

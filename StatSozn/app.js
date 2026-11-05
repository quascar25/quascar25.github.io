// app.js — обновлённый обработчик теста 2
const $log = document.getElementById('log');
const $chart = document.getElementById('chart');
const ctx = $chart.getContext('2d');

let baseParams = null;
let lastTest1 = null;
let lastTest2 = null;

function log(msg) {
  $log.textContent += msg + '\n';
  $log.scrollTop = $log.scrollHeight;
}

function drawWeights(p, label) {
  ctx.clearRect(0, 0, $chart.width, $chart.height);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, $chart.width, $chart.height);
  const list = Net.list(p);
  const barW = 36, gap = 6, x0 = 20, y0 = 260, scale = 40;
  ctx.fillStyle = '#888'; ctx.font = '11px monospace';
  ctx.fillText(label, 20, 20);
  list.forEach(([name, val], i) => {
    const x = x0 + i * (barW + gap);
    const h = Math.abs(val) * scale;
    ctx.fillStyle = val >= 0 ? '#4af' : '#f44';
    if (val >= 0) ctx.fillRect(x, y0 - h, barW, h);
    else ctx.fillRect(x, y0, barW, h);
    ctx.fillStyle = '#aaa';
    ctx.fillText(name, x, 300);
    ctx.fillText(val.toFixed(2), x, 315);
  });
}

document.getElementById('btn-net').onclick = () => {
  baseParams = Net.init();
  Shame.reset();
  Buffer.reset();
  log('=== 1) Сеть 10 параметров создана ===');
  Net.list(baseParams).forEach(([n, v]) => log(`  ${n} = ${v.toFixed(3)}`));
  drawWeights(baseParams, 'Базовая сеть');
};

document.getElementById('btn-test1').onclick = () => {
  if (!baseParams) return log('Сначала создайте сеть.');
  lastTest1 = Tests.evaluate(baseParams, Tests.test1);
  log('=== 2) Тест 1 (до буфера) ===');
  lastTest1.forEach(r => log(`  (${r.x},${r.y}) -> ${r.out} (цель ${r.target}) ${r.ok ? 'OK' : 'FAIL'}`));
  log(`  Точность: ${(Tests.accuracy(lastTest1) * 100).toFixed(1)}%`);
};

document.getElementById('btn-buffer').onclick = () => {
  if (!baseParams) return log('Сначала создайте сеть.');
  log('=== 3) Болевой модуль: перестройка весов (SGD) ===');
  const { params, history } = Pain.run(baseParams, Tests.test1, 1.0, 500, 0.01);
  Buffer.freeze(params, { steps: history.length });
  log(`  Эпох: ${history.length}`);
  log(`  Боль: ${history[0].toFixed(4)} -> ${history[history.length-1].toFixed(4)}`);
  const mid = Math.floor(history.length / 2);
  log(`  Боль на середине: ${history[mid].toFixed(4)}`);
  log('  Буфер статичного сознания сформирован (заморожен).');
  drawWeights(params, 'Буфер (после боли)');
};

document.getElementById('btn-test2').onclick = () => {
  const buf = Buffer.get();
  if (!buf) return log('Сначала сформируйте буфер.');
  lastTest2 = Tests.evaluate(buf, Tests.test2);
  log('=== 4) Тест 2 (после буфера, новые ситуации) ===');
  lastTest2.forEach(r => log(`  (${r.x},${r.y}) -> ${r.out} (цель ${r.target}) ${r.ok ? 'OK' : 'FAIL'}`));
  log(`  Точность: ${(Tests.accuracy(lastTest2) * 100).toFixed(1)}%`);

  log('  Обучение пробы стыда на весах буфера...');
  const { degenerate } = Shame.trainProbe(buf, Tests.test1);
  if (degenerate) {
    log('  [РЕЗУЛЬТАТ] Проба стыда на весах выродилась: на идеальном буфере все примеры «правильные»,');
    log('  разделять нечего. Это ожидаемо: идеальный буфер не нуждается в стыде с весов.');
    log('  Стыд с весов работает как детектор «буфер не идеален», а не как детектор ошибки на входе.');
  }

  const shame = Shame.report(buf, Tests.test2);
  log('  Гибридный стыд (weights | output | total):');
  shame.forEach(s => log(
    `    (${s.x},${s.y}) out=${s.out} ok=${s.ok} ` +
    `w=${s.shameWeights} o=${s.shameOutput} total=${s.shameTotal} (${s.level})`
  ));
};

document.getElementById('btn-compare').onclick = () => {
  if (!lastTest1 || !lastTest2) return log('Сначала пройдите оба теста.');
  const a1 = Tests.accuracy(lastTest1), a2 = Tests.accuracy(lastTest2);
  log('=== 5) Сравнение тестов ===');
  log(`  Тест 1 (до буфера): ${(a1 * 100).toFixed(1)}%`);
  log(`  Тест 2 (после буфера): ${(a2 * 100).toFixed(1)}%`);
  log(`  Разница: ${((a2 - a1) * 100).toFixed(1)} п.п.`);
};

// ... (обработчики 1-5 без изменений, как в предыдущей версии) ...

document.getElementById('btn-corrupt').onclick = () => {
  if (!Buffer.get()) return log('Сначала сформируйте буфер.');
  const c = Buffer.corrupt(0.3);
  log('=== 6) Буфер испорчен (шум 0.3) ===');
  Net.list(c).forEach(([n, v]) => log(`  ${n} = ${v.toFixed(3)}`));
  drawWeights(c, 'Испорченный буфер');
};

document.getElementById('btn-shame-compare').onclick = () => {
  const clean = Buffer.get();
  const corrupt = Buffer.getCorrupted();
  if (!clean) return log('Сначала сформируйте буфер.');
  if (!corrupt) return log('Сначала испортьте буфер (кнопка 6).');

  log('=== 7) Сравнение стыда: чистый vs испорченный буфер ===');

  // Обучаем пробу на чистом буфере (как раньше — она выродится)
  log('  [Чистый буфер] обучение пробы...');
  const r1 = Shame.trainProbe(clean, Tests.test1);
  if (r1.degenerate) {
    log('    Проба выродилась (все примеры правильные) — ожидаемо.');
  }
  const s1 = Shame.compute(clean, 0.49, 0.51);
  log(`    Стыд с весов на (0.49,0.51): w=${s1.weights}`);

  // Обучаем пробу на испорченном буфере
  log('  [Испорченный буфер] обучение пробы...');
  const r2 = Shame.trainProbe(corrupt, Tests.test1);
  if (r2.degenerate) {
    log('    Проба выродилась — неожиданно, проверьте шум.');
  } else {
    log('    Проба обучена: веса не вырождены, есть что разделять.');
  }

  // Сравниваем стыд на тесте 2
  log('  Сравнение стыда (weights | output | total) на тесте 2:');
  const reportClean = Shame.report(clean, Tests.test2);
  const reportCorrupt = Shame.report(corrupt, Tests.test2);

  Tests.test2.forEach(([x, y], i) => {
    const c1 = reportClean[i];
    const c2 = reportCorrupt[i];
    log(`    (${x},${y}):`);
    log(`      чистый:      w=${c1.shameWeights} o=${c1.shameOutput} total=${c1.shameTotal}`);
    log(`      испорченный: w=${c2.shameWeights} o=${c2.shameOutput} total=${c2.shameTotal}`);
  });

  // Итог: средний стыд с весов
  const avgClean = reportClean.reduce((a, r) => a + r.shameWeights, 0) / reportClean.length;
  const avgCorrupt = reportCorrupt.reduce((a, r) => a + r.shameWeights, 0) / reportCorrupt.length;
  log(`  Средний стыд с весов: чистый=${avgClean.toFixed(3)}, испорченный=${avgCorrupt.toFixed(3)}`);
  log(`  Вывод: ${avgCorrupt > avgClean + 0.1 ? 'проба оживает на испорченном буфере — детектор деградации работает.' : 'разница слабая, возможно, нужен больший шум.'}`);
};

// app.js — полная версия с двумя режимами порчи
const $log = document.getElementById('log');
const $chart = document.getElementById('chart');
const ctx = $chart.getContext('2d');

let baseParams = null;
let lastTest1 = null;
let lastTest2 = null;
let corruptedSoft = null;
let corruptedHard = null;

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
  corruptedSoft = null;
  corruptedHard = null;
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
  corruptedSoft = null;
  corruptedHard = null;
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

document.getElementById('btn-corrupt').onclick = () => {
  if (!Buffer.get()) return log('Сначала сформируйте буфер.');
  corruptedSoft = Net.clone(Buffer.corrupt('soft', 0.8));
  corruptedHard = Net.clone(Buffer.corrupt('hard', 0.8));
  log('=== 6) Буфер испорчен (два режима) ===');
  log('  SOFT (только b2 и w2[1]):');
  Net.list(corruptedSoft).forEach(([n, v]) => log(`    ${n} = ${v.toFixed(3)}`));
  log('  HARD (w1[1], w2[1], b2, temp):');
  Net.list(corruptedHard).forEach(([n, v]) => log(`    ${n} = ${v.toFixed(3)}`));
  drawWeights(corruptedHard, 'Испорченный буфер (hard)');
};

document.getElementById('btn-shame-compare').onclick = () => {
  const clean = Buffer.get();
  if (!clean) return log('Сначала сформируйте буфер.');
  if (!corruptedSoft || !corruptedHard) return log('Сначала испортьте буфер (кнопка 6).');

  log('=== 7) Сравнение стыда: чистый vs soft vs hard ===');

  const variants = [
    { name: 'чистый', params: clean },
    { name: 'soft', params: corruptedSoft },
    { name: 'hard', params: corruptedHard }
  ];

  log('  Точность на тесте 2:');
  variants.forEach(v => {
    const res = Tests.evaluate(v.params, Tests.test2);
    log(`    ${v.name}: ${(Tests.accuracy(res) * 100).toFixed(1)}%`);
  });

  log('  Стыд с весов (w) и с выхода (o) на тесте 2:');
  const rows = [];
  variants.forEach(v => {
    const { degenerate } = Shame.trainProbe(v.params, Tests.test1);
    const report = Shame.report(v.params, Tests.test2);
    const avgW = report.reduce((a, r) => a + r.shameWeights, 0) / report.length;
    const avgO = report.reduce((a, r) => a + r.shameOutput, 0) / report.length;
    rows.push({ name: v.name, degenerate, avgW, avgO, report });
    log(`    [${v.name}] проба ${degenerate ? 'выродилась' : 'обучена'}, средний w=${avgW.toFixed(3)}, средний o=${avgO.toFixed(3)}`);
  });

  log('  Детально по ситуациям (w):');
  Tests.test2.forEach(([x, y], i) => {
    const wClean = rows[0].report[i].shameWeights;
    const wSoft = rows[1].report[i].shameWeights;
    const wHard = rows[2].report[i].shameWeights;
    log(`    (${x},${y}): чистый w=${wClean}, soft w=${wSoft}, hard w=${wHard}`);
  });

  const softAlive = rows[1].avgW > rows[0].avgW + 0.05;
  const hardAlive = rows[2].avgW > rows[0].avgW + 0.05;
  log('  ВЫВОД:');
  log(`    soft: ${softAlive ? 'проба оживает (детектор деградации работает)' : 'проба не оживает (порча слишком слабая/сильная)'}`);
  log(`    hard: ${hardAlive ? 'проба оживает (детектор деградации работает)' : 'проба не оживает (порча слишком слабая/сильная)'}`);
};

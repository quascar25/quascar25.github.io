// app.js
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
  const { params, history } = Pain.run(baseParams, Tests.test1, 1.0, 300, 0.01);
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

  const shame = Shame.report(buf, Tests.test2);
  log('  Стыд:');
  shame.forEach(s => log(`    (${s.x},${s.y}) shame=${s.shame} (${s.level})`));
};

document.getElementById('btn-compare').onclick = () => {
  if (!lastTest1 || !lastTest2) return log('Сначала пройдите оба теста.');
  const a1 = Tests.accuracy(lastTest1), a2 = Tests.accuracy(lastTest2);
  log('=== 5) Сравнение тестов ===');
  log(`  Тест 1 (до буфера): ${(a1 * 100).toFixed(1)}%`);
  log(`  Тест 2 (после буфера): ${(a2 * 100).toFixed(1)}%`);
  log(`  Разница: ${((a2 - a1) * 100).toFixed(1)} п.п.`);
  log('  Наблюдение: сравните, переносится ли «правильность» на новые ситуации.');
};

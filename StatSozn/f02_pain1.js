// f02_pain.js
const Pain = (function () {
  function correctTarget(x, y) { return x >= y ? 1 : 0; }

  function loss(p, x, y) {
    const out = Net.forward(p, x, y);
    const t = correctTarget(x, y);
    return (out - t) * (out - t);
  }

  // Численный градиент по 10 параметрам
  function grad(p, x, y, eps = 1e-4) {
    const names = ['w1','b1','w2','b2','temp'];
    const g = JSON.parse(JSON.stringify(p));
    for (const n of names) {
      if (Array.isArray(p[n])) {
        for (let i = 0; i < p[n].length; i++) {
          const pp = Net.clone(p), pm = Net.clone(p);
          pp[n][i] += eps; pm[n][i] -= eps;
          g[n][i] = (loss(pp, x, y) - loss(pm, x, y)) / (2 * eps);
        }
      } else {
        const pp = Net.clone(p), pm = Net.clone(p);
        pp[n] += eps; pm[n] -= eps;
        g[n] = (loss(pp, x, y) - loss(pm, x, y)) / (2 * eps);
      }
    }
    return g;
  }

  function applyStep(p, g, lr) {
    for (let i=0;i<4;i++) p.w1[i] -= lr * g.w1[i];
    for (let i=0;i<2;i++) p.b1[i] -= lr * g.b1[i];
    for (let i=0;i<2;i++) p.w2[i] -= lr * g.w2[i];
    p.b2 -= lr * g.b2;
    p.temp -= lr * g.temp;
    p.temp = Math.max(0.1, Math.min(5, p.temp));
  }

  // SGD: последовательные шаги по каждой ситуации, много эпох
  function run(baseParams, situations, lr = 1.0, epochs = 300, threshold = 0.01) {
    let p = Net.clone(baseParams);
    const history = [];
    for (let epoch = 0; epoch < epochs; epoch++) {
      // перемешиваем ситуации (детерминированно, по индексу эпохи)
      const order = situations.map((_, i) => i)
        .sort((a, b) => ((a * 7 + epoch * 13) % 11) - ((b * 7 + epoch * 13) % 11));
      for (const idx of order) {
        const [x, y] = situations[idx];
        const g = grad(p, x, y);
        applyStep(p, g, lr);
      }
      // средняя боль за эпоху
      let total = 0;
      for (const [x, y] of situations) total += loss(p, x, y);
      total /= situations.length;
      history.push(total);
      if (total < threshold) break;
    }
    return { params: p, history };
  }

  return { run, loss, correctTarget };
})();

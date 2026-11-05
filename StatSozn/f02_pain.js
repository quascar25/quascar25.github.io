// f02_pain.js
// Болевой модуль: генерирует помеху, перестраивает веса в сторону «правильного» поведения.

const Pain = (function () {
  // Правильное действие: если x >= y -> 1 (помочь), иначе -> 0 (не навредить)
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

  // Болевой прогон: итеративно снижаем боль, пока она не утихнет
  function run(baseParams, situations, lr = 0.3, maxSteps = 50, threshold = 0.01) {
    let p = Net.clone(baseParams);
    const history = [];
    for (let step = 0; step < maxSteps; step++) {
      let totalPain = 0;
      const grads = [];
      for (const [x, y] of situations) {
        totalPain += loss(p, x, y);
        grads.push(grad(p, x, y));
      }
      totalPain /= situations.length;
      history.push(totalPain);
      if (totalPain < threshold) break;

      // усреднённый градиент
      const avg = { w1:[0,0,0,0], b1:[0,0], w2:[0,0], b2:0, temp:0 };
      for (const g of grads) {
        for (let i=0;i<4;i++) avg.w1[i] += g.w1[i]/grads.length;
        for (let i=0;i<2;i++) avg.b1[i] += g.b1[i]/grads.length;
        for (let i=0;i<2;i++) avg.w2[i] += g.w2[i]/grads.length;
        avg.b2 += g.b2/grads.length;
        avg.temp += g.temp/grads.length;
      }

      // шаг
      for (let i=0;i<4;i++) p.w1[i] -= lr * avg.w1[i];
      for (let i=0;i<2;i++) p.b1[i] -= lr * avg.b1[i];
      for (let i=0;i<2;i++) p.w2[i] -= lr * avg.w2[i];
      p.b2 -= lr * avg.b2;
      p.temp -= lr * avg.temp;
      p.temp = Math.max(0.1, Math.min(5, p.temp));
    }
    return { params: p, history };
  }

  return { run, loss, correctTarget };
})();

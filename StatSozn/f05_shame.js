// f05_shame.js
// Гибридный стыд:
//   shame_weights — проба на весах буфера (детектор «буфер не идеален»)
//   shame_output  — |out - target| (детектор ошибки на конкретном входе)
//   shame_total   = max(shame_weights, shame_output)

const Shame = (function () {
  let probe = null;
  let degenerate = false;

  function vectorize(p) {
    return [
      p.w1[0], p.w1[1], p.w1[2], p.w1[3],
      p.b1[0], p.b1[1],
      p.w2[0], p.w2[1],
      p.b2, p.temp
    ];
  }

  function sigmoid(z) { return 1 / (1 + Math.exp(-z)); }

  function forwardProbe(v, w, b) {
    let z = b;
    for (let i = 0; i < v.length; i++) z += w[i] * v[i];
    return sigmoid(z);
  }

  // Обучение пробы на весах буфера.
  // Метка: 1 если сеть на этом входе ошибается, 0 если права.
  // Если все метки одинаковые — проба вырождается (это фиксируется).
  function trainProbe(params, situations, lr = 0.5, epochs = 300) {
    const v = vectorize(params);
    const labels = situations.map(([x, y]) => {
      const out = Net.forward(params, x, y);
      const target = Pain.correctTarget(x, y);
      return Math.abs(out - target) > 0.3 ? 1 : 0;
    });

    if (labels.every(l => l === labels[0])) {
      degenerate = true;
      probe = { w: new Array(10).fill(0), b: labels[0] === 1 ? 10 : -10 };
      return { probe, degenerate };
    }

    degenerate = false;
    let w = new Array(10).fill(0);
    let b = 0;
    for (let epoch = 0; epoch < epochs; epoch++) {
      for (let i = 0; i < situations.length; i++) {
        const out = forwardProbe(v, w, b);
        const err = out - labels[i];
        for (let j = 0; j < 10; j++) w[j] -= lr * err * v[j];
        b -= lr * err;
      }
    }
    probe = { w, b };
    return { probe, degenerate };
  }

  function shameWeights(params) {
    if (!probe) return 0;
    return forwardProbe(vectorize(params), probe.w, probe.b);
  }

  function shameOutput(params, x, y) {
    const out = Net.forward(params, x, y);
    const target = Pain.correctTarget(x, y);
    return Math.abs(out - target);
  }

  function compute(params, x, y) {
    const sw = shameWeights(params);
    const so = shameOutput(params, x, y);
    return {
      weights: +sw.toFixed(3),
      output: +so.toFixed(3),
      total: +Math.max(sw, so).toFixed(3),
      degenerate
    };
  }

  function report(params, situations) {
    return situations.map(([x, y]) => {
      const out = Net.forward(params, x, y);
      const target = Pain.correctTarget(x, y);
      const ok = Math.abs(out - target) < 0.3;
      const s = compute(params, x, y);
      return {
        x, y, out: +out.toFixed(3), target, ok,
        shameWeights: s.weights,
        shameOutput: s.output,
        shameTotal: s.total,
        degenerate: s.degenerate,
        level: s.total > 0.6 ? 'высокий' : s.total > 0.3 ? 'средний' : 'низкий'
      };
    });
  }

  function reset() { probe = null; degenerate = false; }

  return { trainProbe, compute, report, reset, vectorize };
})();

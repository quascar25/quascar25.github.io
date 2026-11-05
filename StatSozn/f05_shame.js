// f05_shame.js
// Стыд теперь считывается с ВЕСОВ буфера, а не с выхода.
// Линейная проба: shame = sigmoid(w·params + b), где params — 10 весов буфера.
// Проба обучается после формирования буфера на «правильных» и «неправильных» примерах,
// но сам буфер НЕ меняет.

const Shame = (function () {
  let probe = null; // { w: [10], b: number }

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

  // Обучение пробы: на ситуациях, где сеть права -> стыд 0, где нет -> стыд 1
  // Используем сами веса буфера как вход, метку — правильность выхода буфера.
  function trainProbe(params, situations, lr = 0.5, epochs = 300) {
    const v = vectorize(params);
    // Метки: 0 если выход буфера близок к правильному, 1 если далёк
    const labels = situations.map(([x, y]) => {
      const out = Net.forward(params, x, y);
      const target = Pain.correctTarget(x, y);
      return Math.abs(out - target) > 0.3 ? 1 : 0;
    });

    // Если все метки одинаковые — проба вырождается; добавляем шумовой пример
    if (labels.every(l => l === labels[0])) {
      // нечего разделять — проба вернёт константу
      probe = { w: new Array(10).fill(0), b: labels[0] === 1 ? 10 : -10 };
      return probe;
    }

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
    return probe;
  }

  // Считывание стыда с весов буфера
  function compute(params) {
    if (!probe) return null;
    const v = vectorize(params);
    return forwardProbe(v, probe.w, probe.b);
  }

  function report(params, situations) {
    const s = compute(params);
    return situations.map(([x, y]) => {
      const out = Net.forward(params, x, y);
      const target = Pain.correctTarget(x, y);
      const ok = Math.abs(out - target) < 0.3;
      return {
        x, y, out: +out.toFixed(3), target, ok,
        shame: s === null ? null : +s.toFixed(3),
        level: s === null ? '—' : s > 0.6 ? 'высокий' : s > 0.3 ? 'средний' : 'низкий'
      };
    });
  }

  function reset() { probe = null; }

  return { trainProbe, compute, report, reset, vectorize };
})();

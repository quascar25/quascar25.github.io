// f03_tests.js
// Условия тестов 1 и 2. Тест 1 — базовая сеть. Тест 2 — буфер.

const Tests = (function () {
  // Ситуации: [x, y]
  const test1 = [
    [0.8, 0.2], [0.2, 0.8], [0.6, 0.4], [0.4, 0.6], [0.9, 0.1]
  ];
  // Тест 2: похожие, но не те же — проверка обобщения
  const test2 = [
    [0.7, 0.3], [0.3, 0.7], [0.55, 0.45], [0.45, 0.55], [0.85, 0.15]
  ];

  function evaluate(params, situations) {
    return situations.map(([x, y]) => {
      const out = Net.forward(params, x, y);
      const target = Pain.correctTarget(x, y);
      const ok = Math.abs(out - target) < 0.3;
      return { x, y, out: +out.toFixed(3), target, ok };
    });
  }

  function accuracy(results) {
    return results.filter(r => r.ok).length / results.length;
  }

  return { test1, test2, evaluate, accuracy };
})();

// f03_tests.js
const Tests = (function () {
  // Обучение: включаем пограничные случаи
  const test1 = [
    [0.8, 0.2], [0.2, 0.8],
    [0.6, 0.4], [0.4, 0.6],
    [0.9, 0.1],
    [0.55, 0.45], [0.45, 0.55],  // пограничные
    [0.52, 0.48], [0.48, 0.52]   // ещё ближе к границе
  ];

  // Тест 2: новые ситуации, включая пограничные, которых не было в обучении
  const test2 = [
    [0.7, 0.3], [0.3, 0.7],
    [0.65, 0.35], [0.35, 0.65],
    [0.85, 0.15],
    [0.53, 0.47], [0.47, 0.53],  // пограничные, новые
    [0.51, 0.49], [0.49, 0.51]   // совсем у границы, новые
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

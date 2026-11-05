// f05_shame.js
// Функция стыда: считывается с буфера, не участвует в обучении.
// Стыд = мера отклонения выхода от «правильного» на данном входе.

const Shame = (function () {
  function compute(params, x, y) {
    const out = Net.forward(params, x, y);
    const target = Pain.correctTarget(x, y);
    // чем дальше от правильного — тем сильнее стыд
    return Math.abs(out - target);
  }

  function report(params, situations) {
    return situations.map(([x, y]) => {
      const s = compute(params, x, y);
      return { x, y, shame: +s.toFixed(3), level: s > 0.3 ? 'высокий' : s > 0.1 ? 'средний' : 'низкий' };
    });
  }

  return { compute, report };
})();

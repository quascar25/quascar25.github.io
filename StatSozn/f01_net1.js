// f01_net.js
const Net = (function () {
  let params = null;

  function init(seed = 42) {
    let s = seed;
    const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 - 0.5; };
    params = {
      w1: [rnd() * 2, rnd() * 2, rnd() * 2, rnd() * 2], // 2x2, разброс шире
      b1: [rnd() * 0.5, rnd() * 0.5],
      w2: [rnd() * 2, rnd() * 2],                       // 2x1, разброс шире
      b2: rnd() * 0.5,
      temp: 1.0
    };
    return params;
  }

  function clone(p) {
    return {
      w1: p.w1.slice(), b1: p.b1.slice(),
      w2: p.w2.slice(), b2: p.b2, temp: p.temp
    };
  }

  function forward(p, x, y) {
    const h0 = Math.tanh(p.w1[0] * x + p.w1[1] * y + p.b1[0]);
    const h1 = Math.tanh(p.w1[2] * x + p.w1[3] * y + p.b1[1]);
    const out = p.temp * (p.w2[0] * h0 + p.w2[1] * h1 + p.b2);
    return 1 / (1 + Math.exp(-out));
  }

  function list(p) {
    return [
      ['w1[0]', p.w1[0]], ['w1[1]', p.w1[1]], ['w1[2]', p.w1[2]], ['w1[3]', p.w1[3]],
      ['b1[0]', p.b1[0]], ['b1[1]', p.b1[1]],
      ['w2[0]', p.w2[0]], ['w2[1]', p.w2[1]],
      ['b2', p.b2], ['temp', p.temp]
    ];
  }

  return { init, clone, forward, list };
})();

 // f04_buffer.js — частичная порча буфера
const Buffer = (function () {
  let frozen = null;
  let meta = null;
  let corrupted = null;

  function freeze(params, info = {}) {
    frozen = Net.clone(params);
    corrupted = null;
    meta = { createdAt: new Date().toISOString(), ...info };
    return frozen;
  }

  function get() { return frozen; }
  function info() { return meta; }

  // Частичная порча: mode = 'soft' (b2 и w2[1]) | 'hard' (несколько весов)
  function corrupt(mode = 'soft', noise = 0.8, seed = 123) {
    if (!frozen) return null;
    let s = seed;
    const rnd = () => { s = (s * 9301 + 49297) % 233280; return (s / 233280 - 0.5) * 2; };
    corrupted = Net.clone(frozen);

    if (mode === 'soft') {
      // ломаем только выходной слой — часть ситуаций испортится, часть останется
      corrupted.w2[1] += rnd() * noise;
      corrupted.b2 += rnd() * noise;
    } else {
      // 'hard' — ломаем несколько весов, но не все
      corrupted.w1[1] += rnd() * noise;
      corrupted.w2[1] += rnd() * noise;
      corrupted.b2 += rnd() * noise;
      corrupted.temp = Math.max(0.1, Math.min(5, corrupted.temp + rnd() * noise * 0.5));
    }
    return corrupted;
  }

  function getCorrupted() { return corrupted; }
  function clearCorrupted() { corrupted = null; }
  function reset() { frozen = null; meta = null; corrupted = null; }

  return { freeze, get, info, corrupt, getCorrupted, clearCorrupted, reset };
})();

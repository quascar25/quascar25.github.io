// f04_buffer.js — добавляем функцию порчи буфера
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

  // Порча: добавляем шум к весам
  function corrupt(noise = 0.3, seed = 123) {
    if (!frozen) return null;
    let s = seed;
    const rnd = () => { s = (s * 9301 + 49297) % 233280; return (s / 233280 - 0.5) * 2; };
    corrupted = Net.clone(frozen);
    corrupted.w1 = corrupted.w1.map(v => v + rnd() * noise);
    corrupted.b1 = corrupted.b1.map(v => v + rnd() * noise);
    corrupted.w2 = corrupted.w2.map(v => v + rnd() * noise);
    corrupted.b2 = corrupted.b2 + rnd() * noise;
    corrupted.temp = Math.max(0.1, Math.min(5, corrupted.temp + rnd() * noise));
    return corrupted;
  }

  function getCorrupted() { return corrupted; }
  function clearCorrupted() { corrupted = null; }
  function reset() { frozen = null; meta = null; corrupted = null; }

  return { freeze, get, info, corrupt, getCorrupted, clearCorrupted, reset };
})();

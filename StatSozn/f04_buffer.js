// f04_buffer.js
// Буфер статичного сознания: замороженная копия весов после болевого прогона.

const Buffer = (function () {
  let frozen = null;
  let meta = null;

  function freeze(params, info = {}) {
    frozen = Net.clone(params);
    meta = { createdAt: new Date().toISOString(), ...info };
    return frozen;
  }

  function get() { return frozen; }
  function info() { return meta; }
  function reset() { frozen = null; meta = null; }

  return { freeze, get, info, reset };
})();

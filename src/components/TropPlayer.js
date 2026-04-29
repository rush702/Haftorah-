const NOTES = {
  d: 293.66, e: 329.63, f: 349.23, g: 392.00,
  a: 440.00, bb: 466.16, c: 523.25, c5: 523.25, d5: 587.33,
};

const TROP_MELODIES = {
  "sof-pasuk":     [["e", 0.25], ["d", 0.5]],
  "etnachta":      [["a", 0.2], ["g", 0.2], ["e", 0.2], ["d", 0.4]],
  "tipcha":        [["e", 0.2], ["d", 0.2], ["c", 0.3]],
  "mercha":        [["d", 0.2], ["e", 0.3]],
  "munach":        [["e", 0.2], ["d", 0.3]],
  "zakef-katan":   [["g", 0.2], ["a", 0.25], ["g", 0.3]],
  "zakef-gadol":   [["g", 0.25], ["a", 0.3], ["g", 0.4]],
  "segol":         [["e", 0.2], ["g", 0.2], ["e", 0.3]],
  "shalshelet":    [["d", 0.15], ["e", 0.15], ["f", 0.15], ["e", 0.15], ["f", 0.15], ["e", 0.15], ["d", 0.4]],
  "kadma":         [["d", 0.2], ["e", 0.3]],
  "pashta":        [["a", 0.2], ["g", 0.3]],
  "tevir":         [["e", 0.2], ["g", 0.2], ["e", 0.2], ["d", 0.3]],
  "geresh":        [["e", 0.2], ["d", 0.2], ["e", 0.3]],
  "revia":         [["g", 0.2], ["a", 0.2], ["g", 0.2], ["e", 0.3]],
  "darga":         [["d", 0.15], ["e", 0.15], ["f", 0.3]],
  "telisha":       [["a", 0.15], ["g", 0.3]],
  "munach-legarmeih": [["e", 0.2], ["d", 0.3]],

  // Ashkenazic haftarah bracha (prayer/blessing) nusach
  // Baruch: rising arc to the peak
  "tefillah-rise": [["e", 0.1], ["g", 0.15], ["a", 0.15], ["bb", 0.3]],
  // Ata: sustained peak with slight ornament
  "tefillah-high": [["bb", 0.15], ["a", 0.15], ["bb", 0.3]],
  // Adonai / Yy: falling resolution
  "tefillah-drop": [["a", 0.1], ["g", 0.15], ["f", 0.15], ["e", 0.15], ["d", 0.3]],
  // Middle words: gentle reciting-tone motion
  "tefillah-mid":  [["e", 0.12], ["f", 0.12], ["e", 0.22]],
  // Phrase/blessing end: cadential fall
  "tefillah-end":  [["f", 0.15], ["e", 0.15], ["d", 0.45]],
};

let audioCtx = null;
let activeNodes = [];

function getAudioContext() {
  if (audioCtx) return audioCtx;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
    return audioCtx;
  } catch (e) {
    return null;
  }
}

// Call synchronously during a user-gesture event handler so Safari/iOS
// can unlock the AudioContext before any async code runs.
function unlock() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
}

function stop() {
  for (const node of activeNodes) {
    try {
      if (node.osc) {
        try { node.osc.stop(); } catch (e) { /* ignore */ }
        try { node.osc.disconnect(); } catch (e) { /* ignore */ }
      }
      if (node.gain) {
        try { node.gain.disconnect(); } catch (e) { /* ignore */ }
      }
    } catch (e) {
      // ignore
    }
  }
  activeNodes = [];
}

async function play(tropName) {
  if (tropName == null) return;
  const melody = TROP_MELODIES[tropName];
  if (!melody) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  stop();

  try {
    if (ctx.state === 'suspended' && typeof ctx.resume === 'function') {
      try { await ctx.resume(); } catch (e) { /* ignore */ }
    }
  } catch (e) {
    // ignore
  }

  let startTime = ctx.currentTime;
  let totalDuration = 0;

  for (const [note, duration] of melody) {
    const freq = NOTES[note];
    if (!freq) {
      startTime += duration;
      totalDuration += duration;
      continue;
    }

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const attack = 0.02;
      const release = 0.05;
      const peak = 0.15;

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(peak, startTime + attack);
      gain.gain.setValueAtTime(peak, startTime + Math.max(attack, duration - release));
      gain.gain.linearRampToValueAtTime(0, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.02);

      activeNodes.push({ osc, gain });
    } catch (e) {
      // ignore individual note errors
    }

    startTime += duration;
    totalDuration += duration;
  }

  return new Promise((resolve) => {
    setTimeout(resolve, totalDuration * 1000);
  });
}

const TropPlayer = {
  play,
  stop,
  unlock,
};

export default TropPlayer;

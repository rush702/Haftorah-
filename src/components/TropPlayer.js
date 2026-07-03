const NOTES = {
  d: 293.66, e: 329.63, f: 349.23, g: 392.00,
  a: 440.00, bb: 466.16, c: 523.25, c5: 523.25, d5: 587.33,
};

const TROP_MELODIES = {
  "sof-pasuk":     [["e", 0.3], ["d", 0.6]],
  "etnachta":      [["a", 0.25], ["g", 0.25], ["e", 0.25], ["d", 0.5]],
  "tipcha":        [["e", 0.25], ["d", 0.25], ["c", 0.4]],
  "mercha":        [["d", 0.25], ["e", 0.4]],
  "munach":        [["e", 0.25], ["d", 0.4]],
  "zakef-katan":   [["g", 0.25], ["a", 0.3], ["g", 0.4]],
  "zakef-gadol":   [["g", 0.3], ["a", 0.35], ["g", 0.5]],
  "segol":         [["e", 0.25], ["g", 0.25], ["e", 0.4]],
  "shalshelet":    [["d", 0.2], ["e", 0.2], ["f", 0.2], ["e", 0.2], ["f", 0.2], ["e", 0.2], ["d", 0.5]],
  "kadma":         [["d", 0.25], ["e", 0.4]],
  "pashta":        [["a", 0.25], ["g", 0.4]],
  "tevir":         [["e", 0.25], ["g", 0.25], ["e", 0.25], ["d", 0.4]],
  "geresh":        [["e", 0.25], ["d", 0.25], ["e", 0.4]],
  "revia":         [["g", 0.25], ["a", 0.25], ["g", 0.25], ["e", 0.4]],
  "darga":         [["d", 0.2], ["e", 0.2], ["f", 0.4]],
  "telisha":       [["a", 0.2], ["g", 0.4]],
  "munach-legarmeih": [["e", 0.25], ["d", 0.4]],

  // Ashkenazic haftarah bracha nusach
  "tefillah-rise": [["e", 0.15], ["g", 0.2], ["a", 0.2], ["bb", 0.4]],
  "tefillah-high": [["bb", 0.2], ["a", 0.2], ["bb", 0.4]],
  "tefillah-drop": [["a", 0.15], ["g", 0.2], ["f", 0.2], ["e", 0.2], ["d", 0.4]],
  "tefillah-mid":  [["e", 0.18], ["f", 0.18], ["e", 0.3]],
  "tefillah-end":  [["f", 0.2], ["e", 0.2], ["d", 0.55]],
};

let audioCtx = null;
let activeNodes = [];
let voicesLoaded = false;

// Real cantor recordings (downloaded via scripts/fetch-chabad-audio.mjs
// into public/audio/trop/). manifest.json maps trop key → filename.
let recordingsManifest = null;
let manifestPromise = null;
let currentAudioEl = null;
const audioElCache = {};

function loadManifest() {
  if (manifestPromise) return manifestPromise;
  manifestPromise = fetch('/audio/trop/manifest.json')
    .then((r) => (r.ok ? r.json() : null))
    .then((m) => { recordingsManifest = m; return m; })
    .catch(() => { recordingsManifest = null; return null; });
  return manifestPromise;
}

function playRecording(tropName) {
  const file = recordingsManifest?.[tropName];
  if (!file) return null;
  return new Promise((resolve) => {
    try {
      let el = audioElCache[tropName];
      if (!el) {
        el = new Audio(`/audio/trop/${file}`);
        el.preload = 'auto';
        audioElCache[tropName] = el;
      }
      currentAudioEl = el;
      el.currentTime = 0;
      const finish = () => {
        el.removeEventListener('ended', finish);
        el.removeEventListener('error', finish);
        resolve(true);
      };
      el.addEventListener('ended', finish);
      el.addEventListener('error', finish);
      el.play().catch(() => finish());
    } catch (_) {
      resolve(false);
    }
  });
}

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

// Call synchronously during a user-gesture so Safari unlocks AudioContext.
function unlock() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  // Pre-load speech voices
  if (window.speechSynthesis && !voicesLoaded) {
    window.speechSynthesis.getVoices();
    voicesLoaded = true;
  }
  // Kick off manifest load early
  loadManifest();
}

function stop() {
  // Stop any Web Audio nodes
  for (const node of activeNodes) {
    try { node.osc.stop(); } catch (_) {}
    try { node.osc.disconnect(); } catch (_) {}
    try { node.gain.disconnect(); } catch (_) {}
  }
  activeNodes = [];
  // Stop any ongoing speech
  try {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  } catch (_) {}
  // Stop any cantor recording
  if (currentAudioEl) {
    try { currentAudioEl.pause(); } catch (_) {}
    currentAudioEl = null;
  }
}

function getBestHebrewVoice() {
  if (!window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  // Prefer genuine Hebrew voices (he-IL)
  return (
    voices.find(v => v.lang === 'he-IL' && !v.localService === false) ||
    voices.find(v => v.lang === 'he-IL') ||
    voices.find(v => v.lang.startsWith('he')) ||
    null
  );
}

function speakHebrew(text) {
  if (!window.speechSynthesis || !text) return Promise.resolve(0);

  return new Promise((resolve) => {
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'he-IL';
      utter.rate = 0.65;   // slow, deliberate chanting pace
      utter.pitch = 1.05;  // slight upward pitch for a chanting feel
      utter.volume = 1.0;

      const voice = getBestHebrewVoice();
      if (voice) utter.voice = voice;

      let done = false;
      const finish = () => { if (!done) { done = true; resolve(); } };
      utter.onend = finish;
      utter.onerror = finish;
      // Safety timeout — don't block forever if speech hangs
      setTimeout(finish, 3000);

      window.speechSynthesis.speak(utter);
    } catch (_) {
      resolve();
    }
  });
}

function playTones(tropName) {
  const melody = TROP_MELODIES[tropName];
  if (!melody) return Promise.resolve();

  const ctx = getAudioContext();
  if (!ctx) return Promise.resolve();

  let startTime = ctx.currentTime + 0.05; // tiny buffer
  let totalDuration = 0;

  for (const [note, duration] of melody) {
    const freq = NOTES[note];
    if (!freq) { startTime += duration; totalDuration += duration; continue; }

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle'; // warmer/more vocal than sine
      osc.frequency.value = freq;

      const attack = 0.03;
      const release = 0.08;
      const peak = 0.45; // audible volume

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(peak, startTime + attack);
      gain.gain.setValueAtTime(peak, startTime + Math.max(attack, duration - release));
      gain.gain.linearRampToValueAtTime(0, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
      activeNodes.push({ osc, gain });
    } catch (_) {}

    startTime += duration;
    totalDuration += duration;
  }

  return new Promise(resolve => setTimeout(resolve, totalDuration * 1000 + 60));
}

async function play(tropName, hebrewText = null) {
  if (!tropName) return;

  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    try { await ctx.resume(); } catch (_) {}
  }

  stop();

  // Prefer the real cantor recording when it's been downloaded
  // (public/audio/trop/ via scripts/fetch-chabad-audio.mjs).
  await loadManifest();
  const recording = playRecording(tropName);
  if (recording) {
    await recording;
    return;
  }

  // Fallback: speech (human voice) + melody tones simultaneously.
  // If no Hebrew voice is available the speech promise resolves quickly
  // and only the melody tones play.
  const [speechDone, tonesDone] = [
    speakHebrew(hebrewText),
    playTones(tropName),
  ];

  await Promise.all([speechDone, tonesDone]);
}

const TropPlayer = { play, stop, unlock };
export default TropPlayer;

let audioCtx = null;

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

function ensureRunning(ctx) {
  try {
    if (ctx && ctx.state === 'suspended' && typeof ctx.resume === 'function') {
      ctx.resume();
    }
  } catch (e) {
    // ignore
  }
}

function playTone(freq, startOffset, duration, peak = 0.15) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    ensureRunning(ctx);

    const start = ctx.currentTime + startOffset;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const attack = 0.02;
    const release = 0.05;

    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(peak, start + attack);
    gain.gain.setValueAtTime(peak, start + Math.max(attack, duration - release));
    gain.gain.linearRampToValueAtTime(0, start + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + duration + 0.02);
  } catch (e) {
    // ignore
  }
}

function playLevelUp() {
  try {
    const notes = [523.25, 659.25, 783.99];
    const dur = 0.15;
    notes.forEach((freq, i) => {
      playTone(freq, i * dur, dur);
    });
  } catch (e) {
    // ignore
  }
}

function playBadgeUnlock() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    ensureRunning(ctx);

    const start = ctx.currentTime;
    const duration = 0.4;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;

    const attack = 0.02;
    const peak = 0.15;

    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(peak, start + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + duration + 0.02);
  } catch (e) {
    // ignore
  }
}

function playComboMilestone() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    ensureRunning(ctx);

    const start = ctx.currentTime;
    const duration = 0.3;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';

    const attack = 0.02;
    const release = 0.05;
    const peak = 0.15;

    osc.frequency.setValueAtTime(293.66, start);
    osc.frequency.linearRampToValueAtTime(587.33, start + duration);

    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(peak, start + attack);
    gain.gain.setValueAtTime(peak, start + Math.max(attack, duration - release));
    gain.gain.linearRampToValueAtTime(0, start + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + duration + 0.02);
  } catch (e) {
    // ignore
  }
}

function playSectionComplete() {
  try {
    const freqs = [523.25, 659.25, 783.99];
    const duration = 0.6;
    freqs.forEach((f) => playTone(f, 0, duration));
  } catch (e) {
    // ignore
  }
}

const SoundManager = {
  playLevelUp,
  playBadgeUnlock,
  playComboMilestone,
  playSectionComplete,
};

export default SoundManager;

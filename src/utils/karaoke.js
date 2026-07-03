// Estimate per-word timestamps within a cantor recording so words can
// highlight karaoke-style. Words are grouped into verses (split on
// sof-pasuk), each verse mapped to its measured [start, end] window from
// silence detection, and time within a verse is distributed by weight:
// syllable count (hyphens in the transliteration) plus extra time for
// trop marks that carry long melismas.

const TROP_BONUS = {
  'sof-pasuk': 2.5,
  'etnachta': 2.0,
  'shalshelet': 2.0,
  'zakef-gadol': 1.0,
  'zakef-katan': 0.8,
  'segol': 0.8,
  'revia': 0.8,
  'tevir': 0.6,
  'tipcha': 0.4,
  'pashta': 0.4,
  'geresh': 0.4,
  'telisha': 0.4,
  'tefillah-end': 1.2,
  'tefillah-rise': 0.6,
  'tefillah-drop': 0.6,
};

function wordWeight(word) {
  const syllables = (word.transliteration || 'x').split('-').length;
  return syllables + (TROP_BONUS[word.trop] || 0);
}

// Returns an array of {start, end} (seconds, in recording time) per word.
export function buildWordTimings(words, verseWindows) {
  // Group word indices into verses, splitting after each sof-pasuk
  let groups = [];
  let current = [];
  words.forEach((w, i) => {
    current.push(i);
    if (w.trop === 'sof-pasuk' || i === words.length - 1) {
      groups.push(current);
      current = [];
    }
  });

  // If verse count doesn't match measured windows (e.g. blessings with no
  // sof-pasuk marks), spread all words across the full span instead.
  let windows = verseWindows;
  if (groups.length !== verseWindows.length) {
    windows = [[verseWindows[0][0], verseWindows[verseWindows.length - 1][1]]];
    groups = [words.map((_, i) => i)];
  }

  const timings = new Array(words.length);
  groups.forEach((idxs, g) => {
    const [vStart, vEnd] = windows[g];
    const weights = idxs.map((i) => wordWeight(words[i]));
    const total = weights.reduce((a, b) => a + b, 0);
    let t = vStart;
    idxs.forEach((i, k) => {
      const dur = ((vEnd - vStart) * weights[k]) / total;
      timings[i] = { start: t, end: t + dur };
      t += dur;
    });
  });
  return timings;
}

// Find the word index for a given playback time.
export function wordIndexAtTime(timings, time) {
  for (let i = 0; i < timings.length; i++) {
    if (time < timings[i].end) return i;
  }
  return timings.length - 1;
}

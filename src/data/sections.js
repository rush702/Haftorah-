import { SEC0_WORDS, SEC1_WORDS, SEC2_WORDS } from './chunk1';
import { SEC3_WORDS, SEC4_WORDS } from './chunk2';
import { SEC5_WORDS, SEC6_WORDS } from './chunk3';

// Assign Ashkenazic bracha (tefillah) nusach trop to blessing words that
// don't already carry a trop mark. Detects the Baruch / Ata / Adonai
// formula and phrase endings automatically.
function withTefillahTrop(words) {
  return words.map((w, i, arr) => {
    if (w.trop) return w;
    let trop;
    if (w.transliteration === 'Ba-RUCH') {
      trop = 'tefillah-rise';
    } else if (w.transliteration === 'a-TAH' || w.transliteration === 'a-TAH') {
      trop = 'tefillah-high';
    } else if (w.transliteration === 'Ado-NAI') {
      trop = 'tefillah-drop';
    } else if (i === arr.length - 1 || arr[i + 1]?.transliteration === 'Ba-RUCH') {
      // last word OR the word right before the next "Baruch" closing formula
      trop = 'tefillah-end';
    } else {
      trop = 'tefillah-mid';
    }
    return { ...w, trop };
  });
}

export const SECTIONS = [
  {
    id: 0,
    title: 'Opening Blessing',
    subtitle: 'Before the Haftorah',
    emoji: '🙏',
    color: 'from-purple-900 via-purple-800 to-indigo-900',
    cssGradient: 'linear-gradient(135deg,#3b0764,#312e81)',
    isBoss: false,
    isBonus: false,
    parTime: 90,
    description: 'The bracha you say before reading the haftorah.',
    words: withTefillahTrop(SEC0_WORDS),
    // Real cantor recording (Chaim Alevsky, Chabad.org) served from public/
    cantorAudio: 'audio/cantor/section-0.mp3',
  },
  {
    id: 1,
    title: 'The Vision Begins',
    subtitle: 'Isaiah 6:1–2',
    emoji: '👁️',
    color: 'from-blue-900 via-indigo-900 to-purple-900',
    cssGradient: 'linear-gradient(135deg,#1e3a8a,#3730a3)',
    isBoss: false,
    isBonus: false,
    parTime: 120,
    description: 'Isaiah sees God on the throne with fiery angels.',
    words: SEC1_WORDS,
  },
  {
    id: 2,
    title: 'Kadosh × 3',
    subtitle: 'Isaiah 6:3',
    emoji: '🔥',
    color: 'from-orange-900 via-red-800 to-red-950',
    cssGradient: 'linear-gradient(135deg,#7c2d12,#991b1b)',
    isBoss: true,
    isBonus: false,
    parTime: 50,
    description: 'The angels cry HOLY HOLY HOLY — the most famous verse!',
    words: SEC2_WORDS,
  },
  {
    id: 3,
    title: 'The Coal & the Call',
    subtitle: 'Isaiah 6:4–13',
    emoji: '🪨',
    color: 'from-amber-900 via-orange-900 to-red-900',
    cssGradient: 'linear-gradient(135deg,#78350f,#7c2d12)',
    isBoss: false,
    isBonus: false,
    parTime: 480,
    description: 'An angel touches Isaiah\'s lips with a burning coal.',
    words: SEC3_WORDS,
  },
  {
    id: 4,
    title: 'The Political Prophecy',
    subtitle: 'Isaiah 7:1–6',
    emoji: '⚔️',
    color: 'from-emerald-900 via-teal-900 to-cyan-900',
    cssGradient: 'linear-gradient(135deg,#064e3b,#134e4a)',
    isBoss: false,
    isBonus: false,
    parTime: 360,
    description: 'Two kings plot war against Judah — but God reassures Isaiah.',
    words: SEC4_WORDS,
  },
  {
    id: 5,
    title: 'Light of Israel',
    subtitle: 'Isaiah 9:5–6 — BONUS',
    emoji: '✨',
    color: 'from-yellow-600 via-amber-600 to-orange-600',
    cssGradient: 'linear-gradient(135deg,#ca8a04,#d97706)',
    isBoss: false,
    isBonus: true,
    parTime: 150,
    description: 'Bonus: "Wonderful Counselor, Mighty God, Eternal Father, Prince of Peace."',
    words: SEC5_WORDS,
  },
  {
    id: 6,
    title: 'Closing Blessings',
    subtitle: 'After the Haftorah',
    emoji: '📜',
    color: 'from-violet-900 via-purple-900 to-fuchsia-900',
    cssGradient: 'linear-gradient(135deg,#4c1d95,#581c87)',
    isBoss: false,
    isBonus: false,
    parTime: 480,
    description: 'The four blessings you say after reading the haftorah.',
    words: withTefillahTrop(SEC6_WORDS),
    // Real cantor recording (Chaim Alevsky, Chabad.org) — Ashkenaz nusach
    cantorAudio: 'audio/cantor/section-6.mp3',
  },
];

export const RANK_TITLES = [
  'Beginner', 'Student', 'Reader', 'Chazzan', 'Prophet', 'High Priest', 'Kadosh',
];

export function getRankForLevel(level) {
  return RANK_TITLES[Math.min(level - 1, RANK_TITLES.length - 1)];
}

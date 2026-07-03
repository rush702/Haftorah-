import { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { SECTIONS } from '../data/sections';
import { useGameState } from '../hooks/useGameState';
import WordCard from '../components/WordCard';
import ProgressBar from '../components/ProgressBar';
import TimerDisplay from '../components/TimerDisplay';
import ScoreHUD from '../components/ScoreHUD';
import FloatingPoints from '../components/FloatingPoints';
import BadgeToast from '../components/BadgeToast';
import LevelUpModal from '../components/LevelUpModal';
import TropPlayer from '../components/TropPlayer';
import SoundManager from '../components/SoundManager';
import { buildWordTimings, wordIndexAtTime } from '../utils/karaoke';

const COMBO_MILESTONES = [3, 5, 8, 12];

const COMBO_BURSTS = {
  3: { text: '2× COMBO!', emoji: '✨' },
  5: { text: '3× ON FIRE!', emoji: '🔥' },
  8: { text: '5× UNSTOPPABLE!', emoji: '⚡' },
  12: { text: '10× LEGENDARY!!', emoji: '👑' },
};

function getMultiplier(combo) {
  if (combo >= 12) return 10;
  if (combo >= 8) return 5;
  if (combo >= 5) return 3;
  if (combo >= 3) return 2;
  return 1;
}

export default function PracticeScreen({ sectionId, onComplete, onExit }) {
  const { recordWordRead, completeSection } = useGameState();

  const section = SECTIONS.find((s) => s.id === sectionId) || SECTIONS[0];
  const totalWords = section.words.length;

  const [wordIndex, setWordIndex] = useState(0);
  const [sessionPoints, setSessionPoints] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [wordStartTime, setWordStartTime] = useState(() => Date.now());
  const [sessionStartTime] = useState(() => Date.now());
  const [speedBonusCount, setSpeedBonusCount] = useState(0);
  const [floatingRewards, setFloatingRewards] = useState([]);
  const [activeBadges, setActiveBadges] = useState([]);
  const [levelUpModal, setLevelUpModal] = useState(null);
  const [isPlayingTrop, setIsPlayingTrop] = useState(false);
  const [listenMode, setListenMode] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [comboBurst, setComboBurst] = useState(null);
  const [cantorPlaying, setCantorPlaying] = useState(false);
  const [karaokeIndex, setKaraokeIndex] = useState(0);

  const rewardIdRef = useRef(0);
  const isHandlingRef = useRef(false);
  const cantorRef = useRef(null);
  const karaokeTimingsRef = useRef(null);

  // Real cantor recording: plays continuously while the kid taps along.
  // Sections can share one file via cantorStart/cantorEnd offsets.
  const toggleCantor = useCallback(() => {
    if (!section.cantorAudio) return;
    if (!cantorRef.current) {
      const el = new Audio(`${import.meta.env.BASE_URL}${section.cantorAudio}`);
      el.addEventListener('ended', () => setCantorPlaying(false));
      if (section.cantorEnd) {
        el.addEventListener('timeupdate', () => {
          if (el.currentTime >= section.cantorEnd) {
            el.pause();
            setCantorPlaying(false);
          }
        });
      }
      cantorRef.current = el;
    }
    const el = cantorRef.current;
    if (el.paused) {
      const start = section.cantorStart || 0;
      // Restart from the section beginning if outside its window
      if (el.currentTime < start || (section.cantorEnd && el.currentTime >= section.cantorEnd)) {
        el.currentTime = start;
      }
      // Karaoke timings: verse windows from data, or the whole file
      const setupTimings = () => {
        const windows =
          section.cantorVerseTimes ||
          [[section.cantorStart || 0, section.cantorEnd || el.duration || 60]];
        karaokeTimingsRef.current = buildWordTimings(section.words, windows);
      };
      if (Number.isFinite(el.duration) || section.cantorVerseTimes) setupTimings();
      else el.addEventListener('loadedmetadata', setupTimings, { once: true });
      el.play().catch(() => {});
      setCantorPlaying(true);
    } else {
      el.pause();
      setCantorPlaying(false);
    }
  }, [section.cantorAudio, section.cantorStart, section.cantorEnd, section.cantorVerseTimes, section.words]);

  // Karaoke: while the cantor sings, the highlighted word follows him
  useEffect(() => {
    if (!cantorPlaying) return undefined;
    let raf;
    const tick = () => {
      const el = cantorRef.current;
      const timings = karaokeTimingsRef.current;
      if (el && timings) {
        setKaraokeIndex(wordIndexAtTime(timings, el.currentTime));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [cantorPlaying]);

  // Stop cantor audio when leaving the screen
  useEffect(() => {
    return () => {
      try { cantorRef.current?.pause(); } catch (_) {}
    };
  }, []);

  const currentWord = section.words[wordIndex];
  const multiplier = getMultiplier(comboCount);

  const variant = section.isBoss ? 'boss' : section.isBonus ? 'bonus' : 'default';

  const addFloatingReward = useCallback((text, x, y, rewardVariant) => {
    const id = ++rewardIdRef.current;
    setFloatingRewards((prev) => [...prev, { id, text, x, y, variant: rewardVariant }]);
  }, []);

  const removeFloatingReward = useCallback((id) => {
    setFloatingRewards((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const dismissBadge = useCallback((badgeId) => {
    setActiveBadges((prev) => prev.filter((b) => b.id !== badgeId));
  }, []);

  const triggerHolyFireConfetti = (x, y) => {
    const origin = {
      x: x / window.innerWidth,
      y: y / window.innerHeight,
    };
    confetti({
      particleCount: 80,
      spread: 70,
      startVelocity: 45,
      origin,
      colors: ['#ff5722', '#ffd700', '#ff8c00', '#ffeb3b'],
      scalar: 1.1,
    });
  };

  const triggerCompletionConfetti = () => {
    const end = Date.now() + 800;
    const fire = () => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 80,
        origin: { x: 0, y: 0.7 },
        colors: ['#ffd700', '#ff5722', '#a855f7', '#3b82f6'],
      });
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 80,
        origin: { x: 1, y: 0.7 },
        colors: ['#ffd700', '#ff5722', '#a855f7', '#3b82f6'],
      });
      if (Date.now() < end) requestAnimationFrame(fire);
    };
    fire();
  };

  const handleSectionComplete = useCallback(
    async (finalPoints, finalSpeedBonusCount) => {
      const sessionDuration = (Date.now() - sessionStartTime) / 1000;
      const speedRatio = finalSpeedBonusCount / totalWords;
      const allWordsSpeedBonus = finalSpeedBonusCount === totalWords;

      let stars = 1;
      if (speedRatio >= 0.5) stars = 2;
      if (speedRatio >= 0.8 || (section.parTime && sessionDuration < section.parTime)) {
        stars = 3;
      }

      try {
        SoundManager.playSectionComplete?.();
      } catch (_) {}
      triggerCompletionConfetti();

      const result =
        completeSection(sectionId, {
          stars,
          sessionPoints: finalPoints,
          allWordsSpeedBonus,
        }) || {};

      const newBadges = result.newBadges || [];
      if (newBadges.length > 0) {
        try {
          SoundManager.playBadgeUnlock?.();
        } catch (_) {}
        setActiveBadges((prev) => [...prev, ...newBadges]);
      }

      if (result.leveledUp) {
        try {
          SoundManager.playLevelUp?.();
        } catch (_) {}
        setLevelUpModal({ level: result.newLevel, rankTitle: result.rankTitle });
      }

      setTimeout(() => {
        onComplete({
          sectionId,
          stars,
          sessionPoints: finalPoints,
          sessionDuration,
          newBadges,
          isNewRecord: !!result.isNewRecord,
          prevBest: result.prevBest || 0,
          speedBonusCount: finalSpeedBonusCount,
          totalWords,
        });
      }, 1500);
    },
    [completeSection, onComplete, section.parTime, sectionId, sessionStartTime, totalWords]
  );

  const handleWordTap = useCallback(
    async (e) => {
      if (isPlayingTrop || completing || isHandlingRef.current) return;
      isHandlingRef.current = true;

      const tapX = e?.clientX ?? window.innerWidth / 2;
      const tapY = e?.clientY ?? window.innerHeight / 2;

      const timeOnWord = Date.now() - wordStartTime;
      const wasSpeedBonus = timeOnWord < 3000;
      const random = Math.random();
      const wasRandomBonus = random < 0.2;
      const wasHolyFire = random < 0.067;

      let basePoints = 10;
      if (wasSpeedBonus) basePoints += 5;
      if (wasRandomBonus) basePoints += 50;
      if (wasHolyFire) basePoints += 100;

      const currentMultiplier = getMultiplier(comboCount);
      const finalPoints = basePoints * currentMultiplier;

      const newSessionPoints = sessionPoints + finalPoints;
      setSessionPoints(newSessionPoints);

      const newCombo = wasSpeedBonus ? comboCount + 1 : 0;
      setComboCount(newCombo);

      const newSpeedBonusCount = wasSpeedBonus ? speedBonusCount + 1 : speedBonusCount;
      if (wasSpeedBonus) setSpeedBonusCount(newSpeedBonusCount);

      try {
        recordWordRead({
          basePoints,
          wasSpeedBonus,
          wasHolyFire,
          wasRandomBonus,
          currentCombo: newCombo,
        });
      } catch (_) {}

      // Floating reward text
      let rewardText = `+${finalPoints}`;
      let rewardVariant = 'default';
      if (wasHolyFire) {
        rewardText = `🔥 HOLY FIRE +${finalPoints}!`;
        rewardVariant = 'fire';
      } else if (wasRandomBonus) {
        rewardText = `+${finalPoints} BONUS!`;
        rewardVariant = 'bonus';
      } else if (wasSpeedBonus) {
        rewardVariant = 'speed';
      }
      addFloatingReward(rewardText, tapX, tapY, rewardVariant);

      if (COMBO_MILESTONES.includes(newCombo)) {
        try {
          SoundManager.playComboMilestone?.();
        } catch (_) {}
        const burst = COMBO_BURSTS[newCombo];
        if (burst) {
          setComboBurst(burst);
          setTimeout(() => setComboBurst(null), 1100);
        }
      }

      if (wasHolyFire) {
        triggerHolyFireConfetti(tapX, tapY);
      }

      // Play trop melody if listenMode (skip while the cantor recording
      // is playing — no clashing audio, the kid taps along instead)
      if (listenMode && !cantorPlaying && currentWord?.trop && TropPlayer?.play) {
        setIsPlayingTrop(true);
        try {
          await TropPlayer.play(currentWord.trop, currentWord.hebrew);
        } catch (_) {}
        setIsPlayingTrop(false);
      }

      const nextIndex = wordIndex + 1;
      if (nextIndex >= totalWords) {
        setCompleting(true);
        setWordIndex(nextIndex);
        await handleSectionComplete(newSessionPoints, newSpeedBonusCount);
      } else {
        setWordIndex(nextIndex);
        setWordStartTime(Date.now());
      }

      isHandlingRef.current = false;
    },
    [
      addFloatingReward,
      comboCount,
      completing,
      currentWord,
      handleSectionComplete,
      isPlayingTrop,
      listenMode,
      cantorPlaying,
      recordWordRead,
      sessionPoints,
      speedBonusCount,
      totalWords,
      wordIndex,
      wordStartTime,
    ]
  );

  // Stop trop on unmount
  useEffect(() => {
    return () => {
      try {
        TropPlayer?.stop?.();
      } catch (_) {}
    };
  }, []);

  return (
    <div className="relative min-h-[100dvh] flex flex-col bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-2 z-10">
        <div className="flex-1 min-w-0">
          <ScoreHUD points={sessionPoints} combo={comboCount} multiplier={multiplier} />
        </div>
        <TimerDisplay startTime={sessionStartTime} />
        <button
          onClick={() => {
            try {
              TropPlayer?.stop?.();
            } catch (_) {}
            onExit();
          }}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white text-xl font-bold transition-all"
          aria-label="Exit"
        >
          ×
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-4 pb-3 z-10">
        <ProgressBar
          current={Math.min(cantorPlaying ? karaokeIndex + 1 : wordIndex, totalWords)}
          total={totalWords}
          color={cantorPlaying ? 'green' : section.color || '#a855f7'}
        />
        <div className="text-[11px] text-indigo-200/60 mt-1 text-center font-bold tracking-wider uppercase">
          {cantorPlaying
            ? `🎤 Karaoke — ${Math.min(karaokeIndex + 1, totalWords)}/${totalWords}`
            : `${section.title} — ${Math.min(wordIndex + 1, totalWords)}/${totalWords}`}
        </div>
      </div>

      {/* Word card center — follows the cantor in karaoke mode */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4">
        {(cantorPlaying ? section.words[karaokeIndex] : currentWord && wordIndex < totalWords ? currentWord : null) && (
          <WordCard
            hebrew={(cantorPlaying ? section.words[karaokeIndex] : currentWord).hebrew}
            transliteration={(cantorPlaying ? section.words[karaokeIndex] : currentWord).transliteration}
            isPlaying={isPlayingTrop || cantorPlaying}
            onTap={(e) => {
              if (cantorPlaying) {
                toggleCantor(); // tap pauses karaoke, back to tap-practice
                return;
              }
              TropPlayer.unlock();
              handleWordTap(e);
            }}
            variant={variant}
          />
        )}

        <div className="mt-6 text-sm text-indigo-200/70 font-semibold">
          {cantorPlaying
            ? '🎤 Follow along with the cantor! (tap to pause)'
            : isPlayingTrop
            ? '🎵 Playing melody...'
            : !currentWord?.trop
            ? 'Tap to advance'
            : listenMode
            ? 'Tap word to hear melody'
            : 'Tap to advance'}
        </div>
      </div>

      {/* Combo milestone burst */}
      {comboBurst && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
          <div className="animate-bounce-in text-center">
            <div className="text-6xl mb-1">{comboBurst.emoji}</div>
            <div className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(251,146,60,0.9)] tracking-tight">
              {comboBurst.text}
            </div>
          </div>
        </div>
      )}

      {/* Listen mode toggle */}
      <div className="absolute bottom-4 left-4 z-20">
        <button
          onClick={() => setListenMode((m) => !m)}
          className={`px-4 py-2 rounded-full font-bold text-sm shadow-lg active:scale-95 transition-all flex items-center gap-1.5 ${
            listenMode
              ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white'
              : 'bg-white/10 text-white/70 backdrop-blur-sm'
          }`}
        >
          🎵 {listenMode ? 'Listen On' : 'Listen Off'}
        </button>
      </div>

      {/* Real cantor recording: in-app if we have the audio, Chabad link otherwise */}
      <div className="absolute bottom-4 right-4 z-20">
        {section.cantorAudio ? (
          <button
            onClick={toggleCantor}
            className={`px-4 py-2 rounded-full font-bold text-sm shadow-lg active:scale-95 transition-all flex items-center gap-1.5 text-white ${
              cantorPlaying
                ? 'bg-gradient-to-br from-green-500 to-emerald-600 animate-pulse-glow'
                : 'bg-gradient-to-br from-amber-500 to-orange-600'
            }`}
          >
            🎤 {cantorPlaying ? 'Cantor Singing…' : 'Play Cantor'}
          </button>
        ) : (
          <a
            href="https://www.chabad.org/library/howto/trainer_cdo/aid/1771208/jewish/Learn-to-Read-Torah-and-Haftarah-With-Trop-Audio.htm#0=32494&1=1352&2=32834&3=33223&4=v280"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-full font-bold text-sm shadow-lg active:scale-95 transition-all flex items-center gap-1.5 bg-gradient-to-br from-amber-500 to-orange-600 text-white"
          >
            🎤 Real Cantor
          </a>
        )}
      </div>

      {/* Floating rewards */}
      {floatingRewards.map((r) => (
        <FloatingPoints
          key={r.id}
          text={r.text}
          x={r.x}
          y={r.y}
          variant={r.variant}
          onComplete={() => removeFloatingReward(r.id)}
        />
      ))}

      {/* Badge toasts */}
      <div className="absolute top-20 right-4 flex flex-col gap-2 z-30">
        {activeBadges.map((b) => (
          <BadgeToast key={b.id} badge={b} onDismiss={() => dismissBadge(b.id)} />
        ))}
      </div>

      {/* Level up modal */}
      {levelUpModal && (
        <LevelUpModal
          level={levelUpModal.level}
          rankTitle={levelUpModal.rankTitle}
          onClose={() => setLevelUpModal(null)}
        />
      )}
    </div>
  );
}

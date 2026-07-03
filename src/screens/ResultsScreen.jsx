import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { SECTIONS } from '../data/sections';
import { useGameState } from '../hooks/useGameState';
import SoundManager from '../components/SoundManager';

function formatTime(seconds) {
  const total = Math.max(0, Math.round(seconds || 0));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target) {
      setValue(0);
      return;
    }
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

// Variable-ratio chest rewards — the not-knowing is the hook
function rollChestReward() {
  const r = Math.random();
  if (r < 0.03) return { points: 1000, label: '💎 JACKPOT!!', tier: 'jackpot' };
  if (r < 0.18) return { points: 250, label: '🌟 RARE FIND!', tier: 'rare' };
  return { points: 50 + Math.floor(Math.random() * 6) * 10, label: 'Nice!', tier: 'common' };
}

function TreasureChest({ onOpened }) {
  const [phase, setPhase] = useState('closed'); // closed | shaking | open
  const [reward, setReward] = useState(null);

  const open = () => {
    if (phase !== 'closed') return;
    setPhase('shaking');
    setTimeout(() => {
      const r = rollChestReward();
      setReward(r);
      setPhase('open');
      onOpened(r);
      confetti({
        particleCount: r.tier === 'jackpot' ? 200 : r.tier === 'rare' ? 100 : 50,
        spread: 90,
        startVelocity: 45,
        origin: { x: 0.5, y: 0.55 },
        colors:
          r.tier === 'jackpot'
            ? ['#22d3ee', '#a855f7', '#ffd700', '#ffffff']
            : ['#ffd700', '#ff8c00', '#fde047'],
      });
      try {
        SoundManager.playBadgeUnlock?.();
      } catch (_) {}
    }, 900);
  };

  return (
    <div className="w-full mt-4 bg-gradient-to-r from-amber-500/15 to-yellow-400/15 border-2 border-amber-300/50 rounded-2xl p-4 flex flex-col items-center">
      {phase !== 'open' ? (
        <>
          <button
            onClick={open}
            className={`text-7xl active:scale-95 transition-transform ${
              phase === 'shaking' ? 'animate-shake' : 'animate-bounce-slow'
            }`}
            aria-label="Open treasure chest"
          >
            🎁
          </button>
          <div className="text-sm font-extrabold uppercase tracking-wider text-amber-200 mt-2">
            {phase === 'shaking' ? 'Opening...' : 'Tap to open your treasure!'}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center animate-bounce-in">
          <div className="text-6xl">{reward.tier === 'jackpot' ? '💎' : reward.tier === 'rare' ? '🌟' : '🪙'}</div>
          <div
            className={`text-2xl font-extrabold mt-1 ${
              reward.tier === 'jackpot'
                ? 'bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent'
                : 'text-yellow-300'
            }`}
          >
            {reward.label}
          </div>
          <div className="text-3xl font-extrabold text-white tabular-nums">+{reward.points}</div>
        </div>
      )}
    </div>
  );
}

export default function ResultsScreen({ stats, onContinue, onNext }) {
  const {
    sectionId,
    stars = 0,
    sessionPoints = 0,
    sessionDuration = 0,
    newBadges = [],
    isNewRecord = false,
    prevBest = 0,
    speedBonusCount = 0,
    totalWords = 0,
  } = stats || {};
  const section = SECTIONS.find((s) => s.id === sectionId) || SECTIONS[0];
  const nextSection = SECTIONS.find((s) => s.id === sectionId + 1) || null;
  const animatedPoints = useCountUp(sessionPoints, 1400);
  const { awardBonus } = useGameState();
  const [chestBadges, setChestBadges] = useState([]);

  // Near-miss nudge: how many more fast words for the next star?
  let starNudge = null;
  if (totalWords > 0 && stars < 3) {
    const need = stars < 2 ? 0.5 : 0.8;
    const missing = Math.ceil(need * totalWords) - speedBonusCount;
    if (missing > 0 && missing <= Math.max(3, totalWords * 0.15)) {
      starNudge = `SO close! Just ${missing} more fast word${missing > 1 ? 's' : ''} for ${stars < 2 ? '⭐⭐' : '⭐⭐⭐'}!`;
    }
  }

  useEffect(() => {
    const fire = (originX) => {
      confetti({
        particleCount: 80,
        spread: 80,
        startVelocity: 50,
        origin: { x: originX, y: 0.6 },
        colors: ['#ffd700', '#ff5722', '#a855f7', '#22d3ee', '#22c55e'],
      });
    };
    fire(0.2);
    setTimeout(() => fire(0.8), 200);
    setTimeout(() => fire(0.5), 400);
  }, []);

  const bgStyle = {
    background: `linear-gradient(135deg, ${section.cssGradient ? '' : section.color || '#6366f1'}, #0f172a)`,
    ...(section.cssGradient ? { background: section.cssGradient } : {}),
  };

  return (
    <div
      className="h-[100dvh] flex flex-col items-center justify-between px-6 py-8 overflow-y-auto"
      style={bgStyle}
    >
      <div className="w-full max-w-md flex flex-col items-center mt-4">
        <div className="text-5xl mb-3 animate-bounce-slow">{section.emoji}</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-white drop-shadow-lg tracking-tight">
          SECTION COMPLETE!
        </h1>
        <p className="mt-1 text-sm font-semibold text-white/80">{section.title}</p>

        {isNewRecord && prevBest > 0 && (
          <div className="mt-3 px-4 py-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-purple-950 text-sm font-extrabold uppercase tracking-wider animate-bounce-in shadow-lg">
            🏆 NEW RECORD! (was {prevBest.toLocaleString()})
          </div>
        )}

        {/* Stars */}
        <div className="flex gap-3 mt-6 mb-2">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`text-6xl sm:text-7xl transition-all ${
                n <= stars
                  ? 'opacity-100 drop-shadow-[0_0_15px_rgba(255,215,0,0.7)] animate-bounce-in'
                  : 'opacity-25 grayscale'
              }`}
              style={{ animationDelay: `${n * 200}ms` }}
            >
              ⭐
            </div>
          ))}
        </div>

        {starNudge && (
          <div className="text-sm font-bold text-yellow-200 text-center mb-3 animate-pulse">
            {starNudge}
          </div>
        )}

        {/* Stats */}
        <div className="w-full bg-black/30 backdrop-blur-md rounded-2xl border border-white/15 p-5 flex flex-col gap-3 mt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold uppercase tracking-wider text-white/70">
              Points
            </span>
            <span className="text-2xl font-extrabold text-yellow-300 tabular-nums">
              +{animatedPoints.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold uppercase tracking-wider text-white/70">
              Time
            </span>
            <span className="text-2xl font-extrabold text-white tabular-nums">
              {formatTime(sessionDuration)}
            </span>
          </div>
        </div>

        {/* Treasure chest — variable reward after every section */}
        <TreasureChest
          onOpened={(reward) => {
            const result = awardBonus(reward.points, 'chest');
            if (result?.newBadges?.length) setChestBadges(result.newBadges);
          }}
        />

        {/* New badges */}
        {(newBadges.length > 0 || chestBadges.length > 0) && (
          <div className="w-full mt-4 bg-gradient-to-r from-yellow-400/20 to-amber-500/20 border-2 border-yellow-300/60 rounded-2xl p-4">
            <div className="text-sm font-extrabold uppercase tracking-wider text-yellow-200 mb-3 text-center">
              🏆 New Badges Unlocked!
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {[...newBadges, ...chestBadges].map((b) => (
                <div
                  key={b.id}
                  className="flex flex-col items-center text-center bg-white/10 rounded-xl p-2 min-w-[80px]"
                >
                  <div className="text-3xl">{b.emoji}</div>
                  <div className="text-xs font-bold text-white mt-1">{b.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="w-full max-w-md mt-8 flex flex-col gap-3">
        {nextSection && (
          <button
            onClick={() => onNext?.(nextSection.id)}
            className="w-full px-6 py-5 text-xl font-extrabold rounded-2xl bg-gradient-to-b from-yellow-300 via-yellow-400 to-amber-600 text-purple-950 shadow-[0_8px_0_rgba(180,100,0,0.6)] active:translate-y-1 active:shadow-[0_2px_0_rgba(180,100,0,0.6)] transition-all tracking-wide"
          >
            ▶ Next: {nextSection.emoji} {nextSection.title}
          </button>
        )}
        <button
          onClick={onContinue}
          className={`w-full px-6 py-4 font-extrabold rounded-2xl transition-all tracking-wide ${
            nextSection
              ? 'text-base bg-white/10 text-white border border-white/25 active:scale-[0.98]'
              : 'text-xl py-5 bg-gradient-to-b from-yellow-300 via-yellow-400 to-amber-600 text-purple-950 shadow-[0_8px_0_rgba(180,100,0,0.6)] active:translate-y-1'
          }`}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

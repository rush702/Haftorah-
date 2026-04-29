import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { SECTIONS } from '../data/sections';

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

export default function ResultsScreen({ stats, onContinue }) {
  const { sectionId, stars = 0, sessionPoints = 0, sessionDuration = 0, newBadges = [] } = stats || {};
  const section = SECTIONS.find((s) => s.id === sectionId) || SECTIONS[0];
  const animatedPoints = useCountUp(sessionPoints, 1400);

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
    background: `linear-gradient(135deg, ${section.color || '#6366f1'}, #0f172a)`,
  };

  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center justify-between px-6 py-8 overflow-y-auto"
      style={bgStyle}
    >
      <div className="w-full max-w-md flex flex-col items-center mt-4">
        <div className="text-5xl mb-3 animate-bounce-slow">{section.emoji}</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-white drop-shadow-lg tracking-tight">
          SECTION COMPLETE!
        </h1>
        <p className="mt-1 text-sm font-semibold text-white/80">{section.title}</p>

        {/* Stars */}
        <div className="flex gap-3 mt-6 mb-6">
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

        {/* Stats */}
        <div className="w-full bg-black/30 backdrop-blur-md rounded-2xl border border-white/15 p-5 flex flex-col gap-3">
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

        {/* New badges */}
        {newBadges.length > 0 && (
          <div className="w-full mt-4 bg-gradient-to-r from-yellow-400/20 to-amber-500/20 border-2 border-yellow-300/60 rounded-2xl p-4">
            <div className="text-sm font-extrabold uppercase tracking-wider text-yellow-200 mb-3 text-center">
              🏆 New Badges Unlocked!
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {newBadges.map((b) => (
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

      <button
        onClick={onContinue}
        className="w-full max-w-md mt-8 px-6 py-5 text-xl font-extrabold rounded-2xl bg-gradient-to-b from-yellow-300 via-yellow-400 to-amber-600 text-purple-950 shadow-[0_8px_0_rgba(180,100,0,0.6)] active:translate-y-1 active:shadow-[0_2px_0_rgba(180,100,0,0.6)] transition-all tracking-wide"
      >
        Back to Home
      </button>
    </div>
  );
}

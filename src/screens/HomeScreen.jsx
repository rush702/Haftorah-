import { useState } from 'react';
import confetti from 'canvas-confetti';
import { SECTIONS, RANK_TITLES } from '../data/sections';
import { useGameState } from '../hooks/useGameState';
import StreakBadge from '../components/StreakBadge';
import ProgressBar from '../components/ProgressBar';

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function HomeScreen({ onNavigate }) {
  const {
    playerName,
    totalPoints,
    level,
    xp,
    rankTitle,
    sectionStars,
    completedSections,
    dailyStreak,
    lastPracticeDate,
    dailyQuest,
    awardBonus,
  } = useGameState();
  const [questJustClaimed, setQuestJustClaimed] = useState(false);

  const xpInLevel = xp % 1000;
  const completedSet = new Set(completedSections || []);
  const nextRank = RANK_TITLES[Math.min(level, RANK_TITLES.length - 1)];
  const xpToNext = 1000 - xpInLevel;

  const streakAtRisk = dailyStreak > 0 && lastPracticeDate !== getTodayString();
  const nextUpSection = SECTIONS.find((s) => !completedSet.has(s.id)) || null;

  const claimQuest = () => {
    if (!dailyQuest.complete || dailyQuest.claimed || questJustClaimed) return;
    setQuestJustClaimed(true);
    awardBonus(dailyQuest.reward, 'quest');
    confetti({
      particleCount: 120,
      spread: 90,
      startVelocity: 45,
      origin: { x: 0.5, y: 0.35 },
      colors: ['#ffd700', '#22c55e', '#22d3ee', '#a855f7'],
    });
  };

  return (
    <div className="min-h-[100dvh] overflow-y-auto px-4 pt-5 pb-10 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      <div className="max-w-3xl mx-auto">
        {/* Top row */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Shalom, <span className="bg-gradient-to-r from-yellow-300 to-amber-500 bg-clip-text text-transparent">{playerName || 'Hero'}</span>! 👋
            </h1>
            <p className="text-sm text-indigo-200/70 mt-1">Ready to practice?</p>
          </div>
          <button
            onClick={() => onNavigate('achievements')}
            className="shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-2xl shadow-lg active:scale-95 transition-transform"
            aria-label="Achievements"
          >
            🏆
          </button>
        </div>

        {/* Stats card */}
        <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 mb-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider text-indigo-200/60 font-bold">Rank</span>
              <span className="text-lg font-extrabold text-white">
                Lvl {level} <span className="text-yellow-300">— {rankTitle}</span>
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs uppercase tracking-wider text-indigo-200/60 font-bold">Points</span>
              <span className="text-lg font-extrabold text-yellow-300">
                {totalPoints?.toLocaleString() || 0}
              </span>
            </div>
            <StreakBadge count={dailyStreak || 0} />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-200/70 shrink-0">XP</span>
            <ProgressBar current={xpInLevel} total={1000} color="yellow" />
            <span className="text-xs font-bold text-indigo-200/70 shrink-0 tabular-nums">
              {xpInLevel}/1000
            </span>
          </div>
          <p className="text-[11px] text-yellow-300/80 font-bold mt-1.5 text-right">
            Only {xpToNext} XP to {nextRank}! 🚀
          </p>
        </div>

        {/* Streak at risk warning */}
        {streakAtRisk && (
          <div className="rounded-2xl bg-gradient-to-r from-red-500/20 to-orange-500/20 border-2 border-orange-400/60 p-3 mb-4 flex items-center gap-3 animate-pulse">
            <span className="text-3xl">⚠️</span>
            <p className="text-sm font-extrabold text-orange-200">
              Your 🔥 {dailyStreak}-day streak is at risk — practice today to keep it alive!
            </p>
          </div>
        )}

        {/* Daily quest */}
        <div
          className={`rounded-2xl p-4 mb-4 border-2 ${
            dailyQuest.claimed || questJustClaimed
              ? 'bg-green-500/10 border-green-400/40'
              : dailyQuest.complete
              ? 'bg-gradient-to-r from-yellow-400/20 to-amber-500/20 border-yellow-300/70 animate-pulse-glow'
              : 'bg-white/5 border-white/10'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-xs uppercase tracking-wider text-indigo-200/60 font-bold mb-0.5">
                Today&apos;s Quest
              </div>
              <div className="text-sm font-extrabold text-white">
                {dailyQuest.claimed || questJustClaimed
                  ? '✅ Quest complete — see you tomorrow!'
                  : `Read ${dailyQuest.target} words today`}
              </div>
              {!dailyQuest.claimed && !questJustClaimed && (
                <div className="flex items-center gap-2 mt-2">
                  <ProgressBar
                    current={Math.min(dailyQuest.progress, dailyQuest.target)}
                    total={dailyQuest.target}
                    color="green"
                  />
                  <span className="text-xs font-bold text-indigo-200/70 shrink-0 tabular-nums">
                    {Math.min(dailyQuest.progress, dailyQuest.target)}/{dailyQuest.target}
                  </span>
                </div>
              )}
            </div>
            {!dailyQuest.claimed && !questJustClaimed && (
              <button
                onClick={claimQuest}
                disabled={!dailyQuest.complete}
                className={`shrink-0 flex flex-col items-center px-3 py-2 rounded-xl font-extrabold text-xs transition-all ${
                  dailyQuest.complete
                    ? 'bg-gradient-to-b from-yellow-300 to-amber-500 text-purple-950 shadow-lg active:scale-95 animate-bounce-slow'
                    : 'bg-white/10 text-white/40'
                }`}
              >
                <span className="text-2xl">🎁</span>
                {dailyQuest.complete ? 'CLAIM!' : `+${dailyQuest.reward}`}
              </button>
            )}
          </div>
        </div>

        {/* Sections grid */}
        <h2 className="text-sm font-extrabold uppercase tracking-widest text-indigo-200/60 mb-3 px-1">
          Your Haftorah
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {SECTIONS.map((section) => {
            const stars = sectionStars?.[section.id] || 0;
            const isCompleted = completedSet.has(section.id);

            const isNextUp = nextUpSection?.id === section.id;

            const animClasses = isNextUp
              ? 'animate-pulse-glow ring-4 ring-yellow-300'
              : section.isBoss
              ? 'animate-fire ring-2 ring-red-400/60'
              : section.isBonus
              ? 'animate-pulse-glow ring-2 ring-yellow-300'
              : '';

            return (
              <button
                key={section.id}
                onClick={() => onNavigate('practice', { sectionId: section.id })}
                className={`relative aspect-square rounded-2xl p-3 flex flex-col items-center justify-between text-left shadow-lg active:scale-95 transition-transform overflow-hidden ${animClasses}`}
                style={{
                  background: section.cssGradient || section.color || "#6366f1",
                }}
              >
                {isNextUp && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-yellow-300 text-purple-950 text-[10px] font-extrabold uppercase tracking-wider shadow-md animate-bounce-slow">
                    Next up!
                  </div>
                )}
                {isCompleted && (
                  <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    ✓
                  </div>
                )}

                <div className="text-4xl sm:text-5xl drop-shadow-md">{section.emoji}</div>

                <div className="w-full">
                  <div className="font-extrabold text-white text-sm sm:text-base leading-tight drop-shadow">
                    {section.title}
                  </div>
                  {section.subtitle && (
                    <div className="text-[10px] text-white/70 mt-0.5 leading-tight">
                      {section.subtitle}
                    </div>
                  )}
                </div>

                <div className="flex gap-0.5 text-sm">
                  {[1, 2, 3].map((n) => (
                    <span key={n} className={n <= stars ? 'opacity-100' : 'opacity-30 grayscale'}>
                      ⭐
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-center text-xs text-indigo-200/60">
          🔥 Practice every day to build your streak!
        </p>
      </div>
    </div>
  );
}

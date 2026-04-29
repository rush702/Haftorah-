import { SECTIONS } from '../data/sections';
import { useGameState } from '../hooks/useGameState';
import StreakBadge from '../components/StreakBadge';
import ProgressBar from '../components/ProgressBar';

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
  } = useGameState();

  const xpInLevel = xp % 1000;
  const completedSet = new Set(completedSections || []);

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
        </div>

        {/* Sections grid */}
        <h2 className="text-sm font-extrabold uppercase tracking-widest text-indigo-200/60 mb-3 px-1">
          Your Haftorah
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {SECTIONS.map((section) => {
            const stars = sectionStars?.[section.id] || 0;
            const isCompleted = completedSet.has(section.id);

            const animClasses = section.isBoss
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

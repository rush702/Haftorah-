import { BADGES, RARITY_COLORS } from '../data/badges';
import { useGameState } from '../hooks/useGameState';

export default function AchievementsScreen({ onBack }) {
  const {
    earnedBadges,
    totalPoints,
    maxCombo,
    dailyStreak,
    totalWordsRead,
    resetProgress,
  } = useGameState();

  const earnedSet = new Set(earnedBadges || []);

  const handleReset = () => {
    if (
      window.confirm(
        'Reset all progress? This will clear your points, level, badges, and streak. This cannot be undone.'
      )
    ) {
      resetProgress();
    }
  };

  return (
    <div className="h-[100dvh] overflow-y-auto px-4 pt-5 pb-10 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white text-xl transition-all"
            aria-label="Back"
          >
            ←
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            🏆 Achievements
          </h1>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          <StatTile label="Points" value={(totalPoints || 0).toLocaleString()} color="text-yellow-300" />
          <StatTile label="Max Combo" value={maxCombo || 0} color="text-orange-300" />
          <StatTile label="Streak" value={`${dailyStreak || 0}🔥`} color="text-red-300" />
          <StatTile label="Words Read" value={(totalWordsRead || 0).toLocaleString()} color="text-cyan-300" />
        </div>

        {/* Badges grid */}
        <h2 className="text-sm font-extrabold uppercase tracking-widest text-indigo-200/60 mb-3 px-1">
          Badges ({earnedSet.size}/{BADGES.length})
        </h2>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-8">
          {BADGES.map((badge) => {
            const earned = earnedSet.has(badge.id);
            const rarityColor = RARITY_COLORS?.[badge.rarity] || '#6366f1';

            return (
              <div
                key={badge.id}
                className={`relative rounded-2xl p-3 flex flex-col items-center text-center transition-all ${
                  earned
                    ? 'shadow-lg ring-2'
                    : 'bg-white/5 border border-white/10 grayscale opacity-40'
                }`}
                style={
                  earned
                    ? {
                        background: `linear-gradient(135deg, ${rarityColor}, rgba(0,0,0,0.5))`,
                        boxShadow: `0 0 20px ${rarityColor}50`,
                        '--tw-ring-color': rarityColor,
                      }
                    : undefined
                }
              >
                <div className="text-4xl mb-1 drop-shadow">{badge.emoji}</div>
                <div className="text-xs font-extrabold text-white leading-tight">
                  {badge.name}
                </div>
                <div className="text-[10px] mt-1 text-white/70 leading-tight line-clamp-3">
                  {badge.description}
                </div>
                {earned && badge.rarity && (
                  <div className="absolute top-1 right-1 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/40 text-white">
                    {badge.rarity}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Reset */}
        <div className="text-center mt-10">
          <button
            onClick={handleReset}
            className="text-xs font-bold uppercase tracking-wider text-red-400/80 hover:text-red-300 underline underline-offset-4"
          >
            Reset all progress
          </button>
        </div>
      </div>
    </div>
  );
}

function StatTile({ label, value, color }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
      <div className="text-[10px] uppercase tracking-wider text-indigo-200/60 font-bold">
        {label}
      </div>
      <div className={`text-lg font-extrabold ${color || 'text-white'} tabular-nums mt-0.5`}>
        {value}
      </div>
    </div>
  );
}

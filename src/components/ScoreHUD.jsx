function comboChipClasses(combo) {
  if (combo >= 8) {
    return 'bg-red-600/90 text-white animate-pulse-glow';
  }
  if (combo >= 5) {
    return 'bg-orange-500/90 text-white';
  }
  return 'bg-yellow-400/90 text-slate-900';
}

function ScoreHUD({ points = 0, combo = 0, multiplier = 1 }) {
  const showCombo = combo >= 2;
  const showMult = multiplier > 1;

  return (
    <div className="flex items-center justify-between gap-4 w-full select-none">
      <div className="flex items-center gap-2 transition-all">
        <span className="text-2xl md:text-3xl" aria-hidden="true">
          💰
        </span>
        <span className="text-3xl font-bold text-yellow-400 tabular-nums">
          {points.toLocaleString()}
        </span>
      </div>

      {showCombo && (
        <div
          className={`flex flex-col items-center px-3 py-1 rounded-2xl font-bold transition-all ${comboChipClasses(
            combo
          )}`}
        >
          <span className="text-sm md:text-base whitespace-nowrap">
            🔥 {combo}× COMBO
          </span>
          {showMult && (
            <span className="text-xs uppercase tracking-wider opacity-90">
              {multiplier}x MULTIPLIER
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default ScoreHUD;

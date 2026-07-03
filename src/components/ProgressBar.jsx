const NAMED_COLORS = {
  yellow: 'bg-gradient-to-r from-yellow-400 to-orange-500',
  green: 'bg-gradient-to-r from-green-400 to-emerald-500',
  purple: 'bg-gradient-to-r from-purple-400 to-fuchsia-500',
  blue: 'bg-gradient-to-r from-cyan-400 to-blue-500',
};

function resolveColor(color) {
  if (!color) return NAMED_COLORS.yellow;
  if (NAMED_COLORS[color]) return NAMED_COLORS[color];
  // Tailwind gradient stops without the direction utility
  if (color.includes('from-') && !color.includes('bg-gradient')) {
    return `bg-gradient-to-r ${color}`;
  }
  return color;
}

function ProgressBar({ current = 0, total = 1, color, showLabel = false }) {
  const safeTotal = total > 0 ? total : 1;
  const clamped = Math.max(0, Math.min(current, safeTotal));
  const pct = (clamped / safeTotal) * 100;

  return (
    <div className="w-full select-none">
      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full ${resolveColor(color)} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-right text-xs text-white/70 font-mono">
          {clamped}/{safeTotal}
        </div>
      )}
    </div>
  );
}

export default ProgressBar;

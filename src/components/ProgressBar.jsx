function ProgressBar({
  current = 0,
  total = 1,
  color = 'bg-gradient-to-r from-yellow-400 to-orange-500',
}) {
  const safeTotal = total > 0 ? total : 1;
  const clamped = Math.max(0, Math.min(current, safeTotal));
  const pct = (clamped / safeTotal) * 100;

  return (
    <div className="w-full select-none">
      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 text-right text-xs text-white/70 font-mono">
        {clamped}/{safeTotal}
      </div>
    </div>
  );
}

export default ProgressBar;

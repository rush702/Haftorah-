function streakClasses(count) {
  if (count >= 30) {
    return 'bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 text-slate-900 animate-pulse-glow';
  }
  if (count >= 7) {
    return 'bg-red-600 text-white animate-fire';
  }
  if (count >= 3) {
    return 'bg-red-500 text-white';
  }
  if (count >= 1) {
    return 'bg-orange-500 text-white';
  }
  return 'bg-white/10 text-white/40';
}

function StreakBadge({ count = 0 }) {
  if (count <= 0) {
    return (
      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-white/40 text-sm font-semibold select-none">
        <span aria-hidden="true">🔥</span>
        <span>Start your streak!</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold select-none shadow-md ${streakClasses(
        count
      )}`}
    >
      <span aria-hidden="true">🔥</span>
      <span>
        {count} day{count === 1 ? '' : 's'} streak
      </span>
    </div>
  );
}

export default StreakBadge;

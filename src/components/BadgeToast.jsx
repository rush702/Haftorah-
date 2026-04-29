import { useEffect } from 'react';

const rarityClasses = {
  common: 'bg-gradient-to-br from-gray-600 to-gray-700',
  rare: 'bg-gradient-to-br from-blue-600 to-blue-800',
  epic: 'bg-gradient-to-br from-purple-600 to-purple-800',
  legendary:
    'bg-gradient-to-br from-yellow-500 to-orange-600 animate-pulse-glow',
};

function BadgeToast({ badge, onDismiss = () => {} }) {
  useEffect(() => {
    const id = setTimeout(() => {
      onDismiss();
    }, 4000);
    return () => clearTimeout(id);
  }, [onDismiss]);

  if (!badge) return null;

  const rarity = badge.rarity || 'common';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onDismiss}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onDismiss();
        }
      }}
      className={`fixed top-4 right-4 z-50 min-w-[260px] max-w-[90vw] rounded-2xl p-4 shadow-2xl ring-1 ring-white/20 cursor-pointer select-none animate-slide-right ${rarityClasses[rarity]}`}
    >
      <div className="flex items-center gap-3">
        <div className="text-4xl shrink-0" aria-hidden="true">
          {badge.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] tracking-widest uppercase font-bold text-white/80">
            Badge Unlocked!
          </div>
          <div className="text-base font-bold text-white truncate">
            {badge.name}
          </div>
          {badge.description && (
            <div className="text-xs text-white/85 leading-snug">
              {badge.description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BadgeToast;

import { useEffect, useState } from 'react';

const variantRing = {
  default: 'ring-2 ring-yellow-400/60 shadow-[0_0_40px_rgba(251,191,36,0.35)]',
  boss: 'ring-2 ring-red-500/70 shadow-[0_0_50px_rgba(239,68,68,0.55)]',
  bonus: 'ring-2 ring-amber-300/80 shadow-[0_0_45px_rgba(252,211,77,0.55)]',
};

const variantBg = {
  default: 'bg-gradient-to-br from-slate-900/80 to-slate-800/80',
  boss: 'bg-gradient-to-br from-red-950/80 to-slate-900/80',
  bonus: 'bg-gradient-to-br from-amber-900/40 to-slate-900/80',
};

function WordCard({
  hebrew,
  transliteration,
  isPlaying = false,
  onTap = () => {},
  variant = 'default',
}) {
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    setAnimKey((k) => k + 1);
  }, [hebrew]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onTap}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onTap();
        }
      }}
      className={`select-none cursor-pointer w-full min-h-[44px] rounded-2xl px-6 py-12 md:py-20 ${variantBg[variant]} ${variantRing[variant]} transition-all active:scale-[0.98]`}
    >
      <div
        key={animKey}
        className="flex flex-col items-center justify-center text-center animate-bounce-in"
      >
        <div className="h-10 mb-2 flex items-center justify-center">
          {isPlaying && (
            <span className="text-3xl md:text-4xl animate-pulse" aria-hidden="true">
              🎵
            </span>
          )}
        </div>
        <div
          dir="rtl"
          className="text-7xl md:text-9xl font-hebrew leading-none text-white drop-shadow-[0_0_18px_rgba(255,255,255,0.25)]"
        >
          {hebrew}
        </div>
        <div className="text-2xl md:text-4xl text-yellow-300 mt-6 tracking-wide font-semibold">
          {transliteration}
        </div>
      </div>
    </div>
  );
}

export default WordCard;

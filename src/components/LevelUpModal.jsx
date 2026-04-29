import { useEffect } from 'react';
import confetti from 'canvas-confetti';

function fireConfetti() {
  const colors = ['#fbbf24', '#f59e0b', '#ef4444', '#a855f7'];

  confetti({
    particleCount: 120,
    spread: 70,
    origin: { y: 0.6 },
    colors,
  });

  setTimeout(() => {
    confetti({
      particleCount: 80,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
    });
  }, 200);

  setTimeout(() => {
    confetti({
      particleCount: 80,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
    });
  }, 400);
}

function LevelUpModal({ level = 1, rankTitle = '', onClose = () => {} }) {
  useEffect(() => {
    fireConfetti();
  }, []);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
          e.preventDefault();
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm select-none cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-bounce-in rounded-2xl px-10 py-12 mx-4 text-center bg-gradient-to-br from-yellow-500 via-orange-500 to-red-600 shadow-2xl ring-2 ring-yellow-300/70 max-w-md w-full cursor-default"
      >
        <div className="text-4xl md:text-5xl font-extrabold text-yellow-200 drop-shadow-[0_0_12px_rgba(0,0,0,0.5)] tracking-wider animate-bounce-in">
          LEVEL UP!
        </div>
        <div className="mt-6 text-7xl md:text-8xl font-black text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.4)]">
          Level {level}
        </div>
        {rankTitle && (
          <div className="mt-3 italic text-2xl md:text-3xl text-yellow-100 font-semibold">
            {rankTitle}
          </div>
        )}
        <button
          type="button"
          onClick={onClose}
          className="mt-8 text-sm uppercase tracking-widest text-white/90 hover:text-white animate-pulse"
        >
          Tap to continue
        </button>
      </div>
    </div>
  );
}

export default LevelUpModal;

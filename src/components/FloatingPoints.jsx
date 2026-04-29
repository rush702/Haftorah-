import { useEffect } from 'react';

const variantClasses = {
  default: 'text-yellow-300 text-2xl font-bold',
  bonus:
    'text-pink-300 text-3xl font-bold drop-shadow-[0_0_10px_rgba(244,114,182,0.8)]',
  fire:
    'text-orange-400 text-4xl font-extrabold drop-shadow-[0_0_15px_rgba(251,146,60,1)]',
};

function FloatingPoints({
  text = '+10',
  x = 0,
  y = 0,
  variant = 'default',
  onComplete = () => {},
}) {
  useEffect(() => {
    const id = setTimeout(() => {
      onComplete();
    }, 1200);
    return () => clearTimeout(id);
  }, [onComplete]);

  return (
    <div
      className={`pointer-events-none absolute select-none whitespace-nowrap animate-float-up ${variantClasses[variant]}`}
      style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
    >
      {text}
    </div>
  );
}

export default FloatingPoints;

import { useState } from 'react';
import { useGameState } from '../hooks/useGameState';

export default function WelcomeScreen({ onComplete }) {
  const { setPlayerName } = useGameState();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 1) {
      setError('Please enter your name');
      return;
    }
    setPlayerName(trimmed);
    onComplete();
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-10 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 bg-gradient-animated">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="text-7xl sm:text-8xl mb-4 animate-bounce-slow drop-shadow-[0_0_30px_rgba(255,215,0,0.5)]">
          🕎
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold text-center mb-3 tracking-tight bg-gradient-to-b from-yellow-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(255,200,0,0.4)]">
          HAFTORAH HERO
        </h1>

        <p className="text-base sm:text-lg text-center text-indigo-100/90 mb-10 font-medium">
          Master your Bar Mitzvah haftorah, one word at a time
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            placeholder="Your name"
            maxLength={24}
            autoFocus
            className="w-full px-6 py-5 text-xl rounded-2xl bg-white/10 backdrop-blur-md border-2 border-white/30 placeholder-white/50 text-white text-center font-semibold focus:outline-none focus:border-yellow-400 focus:bg-white/20 transition-all"
          />

          {error && (
            <p className="text-red-300 text-center text-sm font-semibold">{error}</p>
          )}

          <button
            type="submit"
            className="w-full px-6 py-5 text-2xl font-extrabold rounded-2xl bg-gradient-to-b from-yellow-300 via-yellow-400 to-amber-600 text-purple-950 shadow-[0_8px_0_rgba(180,100,0,0.6)] hover:translate-y-0.5 hover:shadow-[0_4px_0_rgba(180,100,0,0.6)] active:translate-y-1 active:shadow-[0_2px_0_rgba(180,100,0,0.6)] transition-all tracking-wide"
          >
            LET&apos;S GO! 🚀
          </button>
        </form>

        <p className="mt-8 text-xs text-indigo-200/60 text-center">
          Get ready to read like a pro
        </p>
      </div>
    </div>
  );
}

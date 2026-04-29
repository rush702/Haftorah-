import { useEffect, useState } from 'react';

function format(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mm = String(Math.floor(safe / 60)).padStart(2, '0');
  const ss = String(safe % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function TimerDisplay({ startTime }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (startTime == null) {
      setElapsed(0);
      return undefined;
    }
    const tick = () => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [startTime]);

  const display = startTime == null ? '00:00' : format(elapsed);

  return (
    <div className="inline-flex items-center gap-1 text-white/80 font-mono text-lg select-none">
      <span aria-hidden="true">⏱️</span>
      <span>{display}</span>
    </div>
  );
}

export default TimerDisplay;

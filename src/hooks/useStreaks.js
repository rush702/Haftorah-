import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'haftorah_save';

function getDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getTodayString() {
  return getDateString(new Date());
}

function getYesterdayString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getDateString(d);
}

export function computeNewStreak(lastDate, currentStreak) {
  const today = getTodayString();
  const yesterday = getYesterdayString();

  if (today === lastDate) {
    return { newStreak: currentStreak, isNewDay: false };
  }
  if (yesterday === lastDate) {
    return { newStreak: currentStreak + 1, isNewDay: true };
  }
  return { newStreak: 1, isNewDay: true };
}

function readStoredState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch (e) {
    return {};
  }
}

function writeStoredState(patch) {
  try {
    const current = readStoredState();
    const merged = { ...current, ...patch };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch (e) {
    return patch;
  }
}

export function useStreaks() {
  const initial = readStoredState();
  const [dailyStreak, setDailyStreak] = useState(initial.dailyStreak || 0);
  const [lastPracticeDate, setLastPracticeDate] = useState(initial.lastPracticeDate || null);

  useEffect(() => {
    const handler = () => {
      const s = readStoredState();
      setDailyStreak(s.dailyStreak || 0);
      setLastPracticeDate(s.lastPracticeDate || null);
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const updateStreak = useCallback(() => {
    const stored = readStoredState();
    const currentStreak = stored.dailyStreak || 0;
    const lastDate = stored.lastPracticeDate || null;

    const { newStreak, isNewDay } = computeNewStreak(lastDate, currentStreak);
    const today = getTodayString();

    writeStoredState({
      dailyStreak: newStreak,
      lastPracticeDate: today,
    });

    setDailyStreak(newStreak);
    setLastPracticeDate(today);

    return { newStreak, isNewDay };
  }, []);

  return { dailyStreak, lastPracticeDate, updateStreak };
}

export default useStreaks;

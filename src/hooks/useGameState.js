import { useState, useEffect, useRef, useCallback } from 'react';
import { BADGES } from '../data/badges';

let getRankForLevel;
try {
  // eslint-disable-next-line global-require
  const sectionsModule = require('../data/sections');
  getRankForLevel = sectionsModule.getRankForLevel;
} catch (e) {
  getRankForLevel = null;
}

const STORAGE_KEY = 'haftorah_save';

const DEFAULT_STATE = {
  playerName: null,
  totalPoints: 0,
  dailyStreak: 0,
  lastPracticeDate: null,
  earnedBadges: [],
  sectionStars: {},
  completedSections: [],
  totalWordsRead: 0,
  maxCombo: 0,
  maxConsecutiveSpeedBonuses: 0,
  practicedAtNight: false,
  practicedEarlyMorning: false,
  holyFireCount: 0,
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed };
  } catch (e) {
    return { ...DEFAULT_STATE };
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // ignore
  }
}

function getTodayString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getYesterdayString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function computeNewStreakInternal(lastDate, currentStreak) {
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

function safeGetRankForLevel(level) {
  if (typeof getRankForLevel === 'function') {
    try {
      const r = getRankForLevel(level);
      if (r) return r;
    } catch (e) {
      // fallthrough
    }
  }
  return 'Beginner';
}

export function useGameState() {
  const [state, setState] = useState(() => loadState());
  const consecutiveSpeedBonusesRef = useRef(0);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const setPlayerName = useCallback((name) => {
    setState((prev) => ({ ...prev, playerName: name }));
  }, []);

  const recordWordRead = useCallback(({
    basePoints = 0,
    wasSpeedBonus = false,
    wasHolyFire = false,
    wasRandomBonus = false,
    currentCombo = 0,
  } = {}) => {
    if (wasSpeedBonus) {
      consecutiveSpeedBonusesRef.current += 1;
    } else {
      consecutiveSpeedBonusesRef.current = 0;
    }
    const consecutiveSpeed = consecutiveSpeedBonusesRef.current;

    const now = new Date();
    const hour = now.getHours();
    const isNight = hour >= 22;
    const isEarlyMorning = hour < 7;

    setState((prev) => ({
      ...prev,
      totalPoints: prev.totalPoints + (basePoints || 0),
      totalWordsRead: prev.totalWordsRead + 1,
      maxCombo: Math.max(prev.maxCombo, currentCombo || 0),
      maxConsecutiveSpeedBonuses: Math.max(prev.maxConsecutiveSpeedBonuses, consecutiveSpeed),
      practicedAtNight: prev.practicedAtNight || isNight,
      practicedEarlyMorning: prev.practicedEarlyMorning || isEarlyMorning,
      holyFireCount: prev.holyFireCount + (wasHolyFire ? 1 : 0),
    }));
  }, []);

  const updateStreakInline = useCallback((prev) => {
    const { newStreak, isNewDay } = computeNewStreakInternal(prev.lastPracticeDate, prev.dailyStreak);
    const today = getTodayString();
    return {
      dailyStreak: newStreak,
      lastPracticeDate: today,
      isNewDay,
    };
  }, []);

  const completeSection = useCallback((sectionId, { stars = 0, sessionPoints = 0, allWordsSpeedBonus = false } = {}) => {
    let result = { newBadges: [], leveledUp: false, newLevel: 1 };

    setState((prev) => {
      const prevLevel = Math.floor(prev.totalPoints / 1000) + 1;

      const prevStars = prev.sectionStars[sectionId] || 0;
      const newStars = Math.max(prevStars, stars);
      const sectionStars = { ...prev.sectionStars, [sectionId]: newStars };

      const completedSections = prev.completedSections.includes(sectionId)
        ? prev.completedSections
        : [...prev.completedSections, sectionId];

      const completionBonus = 100 + (allWordsSpeedBonus ? 300 : 0);
      const totalPoints = prev.totalPoints + completionBonus;

      const streakInfo = updateStreakInline(prev);

      const postState = {
        ...prev,
        sectionStars,
        completedSections,
        totalPoints,
        dailyStreak: streakInfo.dailyStreak,
        lastPracticeDate: streakInfo.lastPracticeDate,
      };

      const newLevel = Math.floor(totalPoints / 1000) + 1;
      const leveledUp = newLevel > prevLevel;

      const stats = {
        ...postState,
        level: newLevel,
        xp: totalPoints,
      };

      const previouslyEarnedIds = new Set(prev.earnedBadges || []);
      const newlyEarned = [];
      const allEarnedIds = new Set(previouslyEarnedIds);

      if (Array.isArray(BADGES)) {
        for (const badge of BADGES) {
          if (!badge || !badge.id) continue;
          if (previouslyEarnedIds.has(badge.id)) continue;
          let passed = false;
          try {
            passed = typeof badge.check === 'function' ? !!badge.check(stats) : false;
          } catch (e) {
            passed = false;
          }
          if (passed) {
            newlyEarned.push(badge);
            allEarnedIds.add(badge.id);
          }
        }
      }

      result = {
        newBadges: newlyEarned,
        leveledUp,
        newLevel,
      };

      return {
        ...postState,
        earnedBadges: Array.from(allEarnedIds),
      };
    });

    return result;
  }, [updateStreakInline]);

  const resetProgress = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
    consecutiveSpeedBonusesRef.current = 0;
    setState({ ...DEFAULT_STATE });
  }, []);

  const level = Math.floor(state.totalPoints / 1000) + 1;
  const xp = state.totalPoints;
  const rankTitle = safeGetRankForLevel(level);

  return {
    playerName: state.playerName,
    totalPoints: state.totalPoints,
    level,
    xp,
    rankTitle,
    earnedBadges: state.earnedBadges,
    sectionStars: state.sectionStars,
    completedSections: state.completedSections,
    dailyStreak: state.dailyStreak,
    lastPracticeDate: state.lastPracticeDate,
    totalWordsRead: state.totalWordsRead,
    maxCombo: state.maxCombo,
    maxConsecutiveSpeedBonuses: state.maxConsecutiveSpeedBonuses,
    practicedAtNight: state.practicedAtNight,
    practicedEarlyMorning: state.practicedEarlyMorning,
    holyFireCount: state.holyFireCount,
    setPlayerName,
    recordWordRead,
    completeSection,
    resetProgress,
  };
}

export default useGameState;

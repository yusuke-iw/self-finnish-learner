import { describe, it, expect, beforeEach } from 'vitest';
import {
  STUDY_STATS_STORAGE_KEY,
  recordAnswer,
  getTodayCount,
  getDailyGoal,
  setDailyGoal,
  getStreak,
  mergeStudyStats
} from '../studyStats';

describe('studyStats utility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('recordAnswer and getTodayCount', () => {
    it('increments today count using local date key YYYY-MM-DD', () => {
      const now = new Date(2026, 4, 10, 15, 30, 0); // 2026-05-10 local
      expect(getTodayCount(now)).toBe(0);

      recordAnswer(now);
      expect(getTodayCount(now)).toBe(1);

      const stats = recordAnswer(now);
      expect(getTodayCount(now)).toBe(2);
      expect(stats.days['2026-05-10']).toBe(2);
    });
  });

  describe('getDailyGoal and setDailyGoal', () => {
    it('defaults to 20 and only accepts 10, 20, or 30', () => {
      expect(getDailyGoal()).toBe(20);

      setDailyGoal(10);
      expect(getDailyGoal()).toBe(10);

      setDailyGoal(30);
      expect(getDailyGoal()).toBe(30);

      // Invalid values fallback to 20
      setDailyGoal(15);
      expect(getDailyGoal()).toBe(20);

      localStorage.setItem(STUDY_STATS_STORAGE_KEY, JSON.stringify({ days: {}, dailyGoal: 99 }));
      expect(getDailyGoal()).toBe(20);
    });
  });

  describe('getStreak', () => {
    it('counts consecutive days up to today when today count >= 1', () => {
      const now = new Date(2026, 4, 10, 12, 0, 0); // 2026-05-10
      localStorage.setItem(
        STUDY_STATS_STORAGE_KEY,
        JSON.stringify({
          days: {
            '2026-05-08': 5,
            '2026-05-09': 3,
            '2026-05-10': 1
          },
          dailyGoal: 20
        })
      );

      expect(getStreak(now)).toBe(3);
    });

    it('returns streak up to yesterday when today count is 0 and yesterday >= 1', () => {
      const now = new Date(2026, 4, 10, 9, 0, 0); // 2026-05-10
      localStorage.setItem(
        STUDY_STATS_STORAGE_KEY,
        JSON.stringify({
          days: {
            '2026-05-07': 4,
            '2026-05-08': 2,
            '2026-05-09': 6
          },
          dailyGoal: 20
        })
      );

      expect(getStreak(now)).toBe(3);
    });

    it('returns 0 when both today and yesterday have 0 answers even if earlier days had answers', () => {
      const now = new Date(2026, 4, 10, 9, 0, 0); // 2026-05-10
      localStorage.setItem(
        STUDY_STATS_STORAGE_KEY,
        JSON.stringify({
          days: {
            '2026-05-07': 10,
            '2026-05-08': 5
          },
          dailyGoal: 20
        })
      );

      expect(getStreak(now)).toBe(0);
    });

    it('stops counting at a gap day when today >= 1 but yesterday is 0', () => {
      const now = new Date(2026, 4, 10, 9, 0, 0); // 2026-05-10
      localStorage.setItem(
        STUDY_STATS_STORAGE_KEY,
        JSON.stringify({
          days: {
            '2026-05-08': 10,
            '2026-05-10': 2
          },
          dailyGoal: 20
        })
      );

      expect(getStreak(now)).toBe(1);
    });
  });

  describe('mergeStudyStats', () => {
    it('takes larger count per day and prioritizes local (2nd arg) dailyGoal', () => {
      const serverStats = {
        days: {
          '2026-05-08': 10,
          '2026-05-09': 3
        },
        dailyGoal: 30
      };
      const localStats = {
        days: {
          '2026-05-09': 8,
          '2026-05-10': 4
        },
        dailyGoal: 10
      };

      const merged = mergeStudyStats(serverStats, localStats);
      expect(merged).toEqual({
        days: {
          '2026-05-08': 10,
          '2026-05-09': 8,
          '2026-05-10': 4
        },
        dailyGoal: 10
      });
    });
  });
});

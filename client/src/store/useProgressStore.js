import { create } from 'zustand';
import { fetchProgress, saveProgress } from '../services/api';
import { findLessonByTitle } from '../data/curriculumData';
import { getWords, mergeWordBooks, saveWords } from '../utils/wordBook';
import {
  getReviewSchedule,
  saveReviewSchedule,
  mergeReviewSchedules,
  migrateLegacyReviewItems
} from '../utils/reviewSchedule';
import {
  getStudyStats,
  saveStudyStats,
  mergeStudyStats
} from '../utils/studyStats';

const PROGRESS_STORAGE_KEY = 'finnishLearnerProgress';
const PASSAGES_STORAGE_KEY = 'finnishLearnerPassagesProgress';
const MISTAKES_STORAGE_KEY = 'finnish_grammar_mistakes';

export const migrateProgressKeys = (progress) => {
  if (!progress || typeof progress !== 'object') {
    return {};
  }
  const migrated = {};
  for (const [key, level] of Object.entries(progress)) {
    const lesson = findLessonByTitle(key);
    const targetKey = lesson ? lesson.id : key;
    if (migrated[targetKey] !== undefined) {
      migrated[targetKey] = Math.max(migrated[targetKey], level);
    } else {
      migrated[targetKey] = level;
    }
  }
  return migrated;
};

const getInitialProgress = () => {
  try {
    const saved = localStorage.getItem(PROGRESS_STORAGE_KEY);
    return saved ? migrateProgressKeys(JSON.parse(saved)) : {};
  } catch (err) {
    console.error('Failed to parse saved progress:', err);
    return {};
  }
};

export const useProgressStore = create((set, get) => ({
  progress: getInitialProgress(),
  isSyncing: false,

  loadProgress: () => {
    migrateLegacyReviewItems();
    set({ progress: getInitialProgress() });
  },

  syncWithServer: async () => {
    try {
      set({ isSyncing: true });
      migrateLegacyReviewItems();
      const localProgress = getInitialProgress();
      const res = await fetchProgress();
      if (res?.data?.success && res.data.data) {
        const serverData = res.data.data;
        const serverPath = migrateProgressKeys(serverData.learningPath || {});

        // Merge: take highest level per category
        const mergedPath = { ...localProgress };
        for (const [cat, lvl] of Object.entries(serverPath)) {
          mergedPath[cat] = Math.max(mergedPath[cat] || 1, lvl);
        }

        // Restore passages progress if server has it
        if (serverData.passagesProgress) {
          try {
            const localPassages = JSON.parse(localStorage.getItem(PASSAGES_STORAGE_KEY) || '{}');
            const mergedPassages = { ...serverData.passagesProgress, ...localPassages };
            localStorage.setItem(PASSAGES_STORAGE_KEY, JSON.stringify(mergedPassages));
          } catch (e) {
            console.error('Failed to merge passages progress', e);
          }
        }

        // Restore mistakes if server has it
        if (Array.isArray(serverData.mistakes) && serverData.mistakes.length > 0) {
          try {
            const localMistakes = JSON.parse(localStorage.getItem(MISTAKES_STORAGE_KEY) || '[]');
            const mistakeMap = new Map();
            [...serverData.mistakes, ...localMistakes].forEach(m => {
              if (m?.question) mistakeMap.set(m.question, m);
            });
            localStorage.setItem(MISTAKES_STORAGE_KEY, JSON.stringify(Array.from(mistakeMap.values())));
          } catch (e) {
            console.error('Failed to merge mistakes', e);
          }
        }

        const mergedWordBook = mergeWordBooks(serverData.wordBook, getWords());
        saveWords(mergedWordBook);

        // Merge review schedule between server and local
        const localReviewSchedule = getReviewSchedule();
        const serverReviewSchedule =
          serverData.reviewSchedule && typeof serverData.reviewSchedule === 'object'
            ? serverData.reviewSchedule
            : {};
        const mergedReviewSchedule = mergeReviewSchedules(serverReviewSchedule, localReviewSchedule);
        saveReviewSchedule(mergedReviewSchedule);

        // Merge study stats between server and local
        const localStudyStats = getStudyStats();
        const serverStudyStats =
          serverData.studyStats && typeof serverData.studyStats === 'object'
            ? serverData.studyStats
            : {};
        const mergedStudyStats = mergeStudyStats(serverStudyStats, localStudyStats);
        saveStudyStats(mergedStudyStats);

        // Save merged learningPath back to localStorage & state
        localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(mergedPath));
        set({ progress: mergedPath });

        // Push merged state back to server to ensure server is also up-to-date
        const savePromise = saveProgress({
          learningPath: mergedPath,
          passagesProgress: JSON.parse(localStorage.getItem(PASSAGES_STORAGE_KEY) || '{}'),
          wordBook: mergedWordBook,
          reviewSchedule: mergedReviewSchedule,
          studyStats: mergedStudyStats
        });
        if (savePromise && typeof savePromise.catch === 'function') {
          savePromise.catch(() => {});
        }
      }
    } catch (err) {
      console.warn('[INFO] Could not sync progress with backend (running offline / memory mode).', err.message);
      set({ progress: getInitialProgress() });
    } finally {
      set({ isSyncing: false });
    }
  },

  updateLevelProgress: async (category, level) => {
    const currentProgress = get().progress;
    const currentLevel = currentProgress[category] || 1;
    const newLevel = Math.max(currentLevel, level);
    const newProgress = { ...currentProgress, [category]: newLevel };

    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(newProgress));
    set({ progress: newProgress });

    try {
      await saveProgress({
        learningPath: newProgress,
        passagesProgress: JSON.parse(localStorage.getItem(PASSAGES_STORAGE_KEY) || '{}')
      });
    } catch (err) {
      console.warn('[INFO] Failed to save progress to server:', err.message);
    }
  },

  resetProgress: async () => {
    localStorage.removeItem(PROGRESS_STORAGE_KEY);
    set({ progress: {} });
    try {
      await saveProgress({ learningPath: {} });
    } catch (err) {
      console.warn('Failed to reset progress on server:', err.message);
    }
  }
}));

import { create } from 'zustand';
import { fetchProgress, saveProgress } from '../services/api';

const PROGRESS_STORAGE_KEY = 'finnishLearnerProgress';
const PASSAGES_STORAGE_KEY = 'finnishLearnerPassagesProgress';
const MISTAKES_STORAGE_KEY = 'finnish_grammar_mistakes';

const getInitialProgress = () => {
  try {
    const saved = localStorage.getItem(PROGRESS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (err) {
    console.error('Failed to parse saved progress:', err);
    return {};
  }
};

export const useProgressStore = create((set, get) => ({
  progress: getInitialProgress(),
  isSyncing: false,

  loadProgress: () => {
    set({ progress: getInitialProgress() });
  },

  syncWithServer: async () => {
    try {
      set({ isSyncing: true });
      const localProgress = getInitialProgress();
      const res = await fetchProgress();
      if (res?.data?.success && res.data.data) {
        const serverData = res.data.data;
        const serverPath = serverData.learningPath || {};

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

        // Save merged learningPath back to localStorage & state
        localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(mergedPath));
        set({ progress: mergedPath });

        // Push merged state back to server to ensure server is also up-to-date
        saveProgress({
          learningPath: mergedPath,
          passagesProgress: JSON.parse(localStorage.getItem(PASSAGES_STORAGE_KEY) || '{}')
        }).catch(() => {});
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

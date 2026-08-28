import { create } from 'zustand';

const STORAGE_KEY = 'finnishLearnerProgress';

const getInitialProgress = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (err) {
    console.error('Failed to parse saved progress:', err);
    return {};
  }
};

export const useProgressStore = create((set, get) => ({
  progress: getInitialProgress(),

  loadProgress: () => {
    set({ progress: getInitialProgress() });
  },

  updateLevelProgress: (category, level) => {
    const newProgress = { ...get().progress, [category]: level };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
    set({ progress: newProgress });
  },

  resetProgress: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ progress: {} });
  }
}));

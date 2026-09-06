import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useProgressStore } from '../useProgressStore';
import * as api from '../../services/api';

vi.mock('../../services/api', () => ({
  fetchProgress: vi.fn(),
  saveProgress: vi.fn()
}));

describe('useProgressStore', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    useProgressStore.setState({ progress: {} });
  });

  it('updates level progress locally and syncs to server', async () => {
    api.saveProgress.mockResolvedValue({ data: { success: true } });

    await useProgressStore.getState().updateLevelProgress('Ruoka ja Juoma', 2);

    expect(useProgressStore.getState().progress['Ruoka ja Juoma']).toBe(2);
    expect(JSON.parse(localStorage.getItem('finnishLearnerProgress'))['Ruoka ja Juoma']).toBe(2);
    expect(api.saveProgress).toHaveBeenCalledWith(expect.objectContaining({
      learningPath: expect.objectContaining({ 'Ruoka ja Juoma': 2 })
    }));
  });

  it('syncs with server on syncWithServer call', async () => {
    localStorage.setItem('finnishLearnerProgress', JSON.stringify({ 'Ruoka ja Juoma': 1 }));
    api.fetchProgress.mockResolvedValue({
      data: {
        success: true,
        data: {
          learningPath: { 'Ruoka ja Juoma': 3, 'Perhe ja Ystävät': 2 },
          passagesProgress: { 'p1': true }
        }
      }
    });
    api.saveProgress.mockResolvedValue({ data: { success: true } });

    await useProgressStore.getState().syncWithServer();

    // Merged highest level
    expect(useProgressStore.getState().progress['Ruoka ja Juoma']).toBe(3);
    expect(useProgressStore.getState().progress['Perhe ja Ystävät']).toBe(2);
    // Preserved passages in localStorage
    expect(JSON.parse(localStorage.getItem('finnishLearnerPassagesProgress'))['p1']).toBe(true);
  });

  it('handles server network failure gracefully during sync', async () => {
    localStorage.setItem('finnishLearnerProgress', JSON.stringify({ 'Ruoka ja Juoma': 2 }));
    api.fetchProgress.mockRejectedValue(new Error('Network Error'));

    // Should not throw
    await expect(useProgressStore.getState().syncWithServer()).resolves.not.toThrow();
    // Local progress remains intact
    expect(useProgressStore.getState().progress['Ruoka ja Juoma']).toBe(2);
  });
});

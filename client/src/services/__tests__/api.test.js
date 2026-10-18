import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { fetchProgress, saveProgress, generateSession } from '../api';
import { setUserId } from '../../utils/userId';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

describe('api service (progress)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('fetchProgress sends default_user when no userId is stored', () => {
    fetchProgress();
    expect(axios.get).toHaveBeenCalledWith('/api/progress?userId=default_user');
  });

  it('fetchProgress sends stored userId from localStorage and URL-encodes it', () => {
    setUserId('my_sync_id-1');
    fetchProgress();
    expect(axios.get).toHaveBeenCalledWith('/api/progress?userId=my_sync_id-1');

    fetchProgress('custom id');
    expect(axios.get).toHaveBeenCalledWith('/api/progress?userId=custom%20id');
  });

  it('saveProgress attaches getUserId() when userId is not in payload', () => {
    setUserId('sync_device_2');
    saveProgress({ learningPath: { l1: 2 } });
    expect(axios.post).toHaveBeenCalledWith('/api/progress', {
      learningPath: { l1: 2 },
      userId: 'sync_device_2'
    });
  });

  it('saveProgress preserves explicit userId when provided in payload', () => {
    setUserId('sync_device_2');
    saveProgress({ userId: 'explicit_user', learningPath: { l1: 3 } });
    expect(axios.post).toHaveBeenCalledWith('/api/progress', {
      userId: 'explicit_user',
      learningPath: { l1: 3 }
    });
  });

  it('generateSession sends optional sentenceIds when provided without breaking existing calls', () => {
    generateSession(5, 'Ruoka ja Juoma', 1, null, 'ja');
    expect(axios.post).toHaveBeenCalledWith('/api/sessions/generate', {
      sentenceCount: 5,
      category: 'Ruoka ja Juoma',
      level: 1,
      exerciseType: null,
      lang: 'ja'
    });

    generateSession(5, null, null, null, 'en', ['s1', 's2']);
    expect(axios.post).toHaveBeenCalledWith('/api/sessions/generate', {
      sentenceCount: 5,
      category: null,
      level: null,
      exerciseType: null,
      lang: 'en',
      sentenceIds: ['s1', 's2']
    });
  });
});

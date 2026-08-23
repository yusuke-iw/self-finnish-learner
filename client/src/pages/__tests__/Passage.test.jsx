import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Passage from '../Passage';
import { fetchPassages, fetchPassageById } from '../../services/api';
import { playAudio } from '../../utils/audio';
import { playCorrectSound, playIncorrectSound } from '../../utils/feedbackSounds';

import { vi, expect, describe, it, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('../../services/api');
vi.mock('../../utils/audio');
vi.mock('../../utils/feedbackSounds');

const mockPassages = [
  { _id: 'p1', title: 'Test Passage 1', difficulty: 'A2' },
  { _id: 'p2', title: 'Test Passage 2', difficulty: 'B1' }
];

const mockPassageDetail = {
  _id: 'p1',
  title: 'Test Passage 1',
  difficulty: 'A2',
  text: 'Tämä on testi.',
  translation: 'This is a test.',
  vocabulary: [{ word: 'testi', translation: 'test' }],
  questions: [
    {
      questionText: 'Mitä tämä on?',
      options: ['Testi', 'Kissa'],
      correctAnswerIndex: 0
    }
  ]
};

describe('Passage Component', () => {
  beforeEach(() => {
    fetchPassages.mockResolvedValue({ data: { success: true, data: mockPassages } });
    fetchPassageById.mockResolvedValue({ data: { success: true, data: mockPassageDetail } });
    
    // Clear localStorage
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders passage list with difficulty tags', async () => {
    render(<Passage />);
    
    // Loading state initially
    expect(screen.getByText('Loading passages...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test Passage 1')).toBeInTheDocument();
    });

    expect(screen.getByText('A2')).toBeInTheDocument();
    expect(screen.getByText('B1')).toBeInTheDocument();
  });

  it('opens passage detail on click', async () => {
    render(<Passage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Passage 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Test Passage 1'));

    await waitFor(() => {
      expect(screen.getByText('Knowledge Check')).toBeInTheDocument();
    });

    // Verify content is loaded
    expect(screen.getByText('Tämä on testi.')).toBeInTheDocument();
    expect(screen.getByText('testi')).toBeInTheDocument();
    expect(screen.getByText('Mitä tämä on?')).toBeInTheDocument();
  });

  it('tracks progress and shows completion badge when answered correctly', async () => {
    render(<Passage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Passage 1')).toBeInTheDocument();
    });

    // Open detail
    fireEvent.click(screen.getByText('Test Passage 1'));

    await waitFor(() => {
      expect(screen.getByText('Knowledge Check')).toBeInTheDocument();
    });

    // Answer the question correctly (Option 0)
    fireEvent.click(screen.getByText('Testi'));

    // Verify sound was played
    expect(playCorrectSound).toHaveBeenCalled();

    // Wait for the Mastery badge to appear
    await waitFor(() => {
      expect(screen.getByText('🏆 Mastered')).toBeInTheDocument();
    });

    // Go back to the list and verify the checkmark
    fireEvent.click(screen.getByText('← Back to Passages'));

    await waitFor(() => {
      expect(screen.getByTitle('Mastered')).toBeInTheDocument();
    });

    // Check localStorage
    const savedProgress = JSON.parse(localStorage.getItem('finnishLearnerPassagesProgress'));
    expect(savedProgress).toHaveProperty('p1', true);
  });

  it('plays incorrect sound when answered wrong', async () => {
    render(<Passage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Passage 1')).toBeInTheDocument();
    });

    // Open detail
    fireEvent.click(screen.getByText('Test Passage 1'));

    await waitFor(() => {
      expect(screen.getByText('Knowledge Check')).toBeInTheDocument();
    });

    // Answer incorrectly (Option 1)
    fireEvent.click(screen.getByText('Kissa'));

    expect(playIncorrectSound).toHaveBeenCalled();
    
    // Mastery badge should not be present
    expect(screen.queryByText('🏆 Mastered')).not.toBeInTheDocument();
  });

  it('resets progress when button is clicked', async () => {
    // Mock window.confirm to always return true
    window.confirm = vi.fn().mockReturnValue(true);
    
    // Pre-populate localStorage
    localStorage.setItem('finnishLearnerPassagesProgress', JSON.stringify({ p1: true }));
    
    render(<Passage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Passage 1')).toBeInTheDocument();
    });

    // Verify checkmark is there initially
    expect(screen.getByTitle('Mastered')).toBeInTheDocument();

    // Click reset button
    fireEvent.click(screen.getByText('Reset Progress'));

    // Checkmark should disappear
    await waitFor(() => {
      expect(screen.queryByTitle('Mastered')).not.toBeInTheDocument();
    });

    // Local storage should be empty
    expect(localStorage.getItem('finnishLearnerPassagesProgress')).toBeNull();
  });

  it('does not reset progress if confirm is cancelled', async () => {
    window.confirm = vi.fn().mockReturnValue(false);
    localStorage.setItem('finnishLearnerPassagesProgress', JSON.stringify({ p1: true }));
    
    render(<Passage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Passage 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Reset Progress'));
    expect(screen.getByTitle('Mastered')).toBeInTheDocument();
  });

  it('handles fetchPassages error gracefully', async () => {
    fetchPassages.mockRejectedValue(new Error('Network error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<Passage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading passages...')).not.toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('handles fetchPassageById error gracefully', async () => {
    fetchPassageById.mockRejectedValue(new Error('Network error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<Passage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Passage 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Test Passage 1'));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });
    consoleSpy.mockRestore();
  });

  it('toggles translation visibility', async () => {
    render(<Passage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Passage 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Test Passage 1'));

    await waitFor(() => {
      expect(screen.getByText('Knowledge Check')).toBeInTheDocument();
    });

    expect(screen.queryByText('This is a test.')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Show Translation'));
    
    await waitFor(() => {
      expect(screen.getByText('This is a test.')).toBeInTheDocument();
      expect(screen.getByText('Hide Translation')).toBeInTheDocument();
    });
  });

  it('handles multiple questions where one is correct but others are not yet answered', async () => {
    const multiQuestionPassage = {
      _id: 'p-multi',
      title: 'Multi Passage',
      text: 'Multi',
      questions: [
        { questionText: 'Q1', options: ['A', 'B'], correctAnswerIndex: 0 },
        { questionText: 'Q2', options: ['C', 'D'], correctAnswerIndex: 0 }
      ]
    };
    fetchPassageById.mockResolvedValueOnce({ data: { success: true, data: multiQuestionPassage } });

    render(<Passage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Passage 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Test Passage 1')); // Will fetch p-multi because of the mockResolvedValueOnce

    await waitFor(() => {
      expect(screen.getByText('Q1')).toBeInTheDocument();
    });

    // Answer Q1 correctly
    fireEvent.click(screen.getByText('A'));
    expect(playCorrectSound).toHaveBeenCalled();

    // Mastery badge should not be present yet because Q2 is unanswered
    expect(screen.queryByText('🏆 Mastered')).not.toBeInTheDocument();
  });
});

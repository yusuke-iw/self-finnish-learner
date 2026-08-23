import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import GuidebookModal from '../GuidebookModal';
import { fetchSentences } from '../../services/api';
import { playAudio } from '../../utils/audio';

vi.mock('../../services/api');
vi.mock('../../utils/audio');

describe('GuidebookModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    unit: {
      title: 'Unit 1',
      color: '#58cc02',
      lessons: [
        { title: 'Lesson A' },
        { title: 'Lesson B' }
      ]
    }
  };

  const mockSentences = [
    {
      _id: '1',
      category: 'Lesson A',
      text: 'Kissa',
      translation: 'Cat',
      grammarNotes: 'A cute animal'
    },
    {
      _id: '2',
      category: 'Lesson C', // not in unit
      text: 'Koira',
      translation: 'Dog'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    fetchSentences.mockResolvedValue({ data: { success: true, data: mockSentences } });
  });

  it('renders loading state initially and then the filtered sentences', async () => {
    render(<GuidebookModal {...defaultProps} />);
    expect(screen.getByText('Loading notes...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Loading notes...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Unit 1 Guidebook')).toBeInTheDocument();
    expect(screen.getByText('Kissa')).toBeInTheDocument();
    expect(screen.getByText('Cat')).toBeInTheDocument();
    expect(screen.getByText('Note:')).toBeInTheDocument();
    expect(screen.getByText('A cute animal')).toBeInTheDocument();

    // Lesson C should be filtered out
    expect(screen.queryByText('Koira')).not.toBeInTheDocument();
  });

  it('renders empty state if no sentences match', async () => {
    fetchSentences.mockResolvedValue({ data: { success: true, data: [] } });
    render(<GuidebookModal {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('No grammar notes available for this unit yet.')).toBeInTheDocument();
    });
  });

  it('calls onClose when close button is clicked', async () => {
    render(<GuidebookModal {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading notes...')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('×'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('plays audio when a word is clicked', async () => {
    render(<GuidebookModal {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading notes...')).not.toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTitle('Listen'));
    expect(playAudio).toHaveBeenCalledWith('Kissa', '1');
  });

  it('handles API failure gracefully', async () => {
    fetchSentences.mockRejectedValue(new Error('API failed'));
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<GuidebookModal {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading notes...')).not.toBeInTheDocument();
    });
    
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(screen.getByText('No grammar notes available for this unit yet.')).toBeInTheDocument();
    
    consoleErrorSpy.mockRestore();
  });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Home from '../Home';
import { BrowserRouter, useNavigate } from 'react-router-dom';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn()
  };
});

// GuidebookModal is rendered by Home. We can mock it to isolate the test.
vi.mock('../../components/GuidebookModal', () => {
  return {
    default: ({ onClose }) => (
      <div data-testid="mock-guidebook-modal">
        <button onClick={onClose}>Close Mock Guidebook</button>
      </div>
    )
  };
});

describe('Home Component', () => {
  let mockNavigate;

  beforeEach(() => {
    mockNavigate = vi.fn();
    useNavigate.mockReturnValue(mockNavigate);
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the vertical path syllabus', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    expect(screen.getByText(/Unit 1/)).toBeInTheDocument();
    
    const lessons = screen.getAllByText(/Ruoka/i);
    expect(lessons.length).toBeGreaterThan(0);
  });

  it('handles level clicks and navigates correctly', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    // The buttons have "L1 (Choice)", "L2 (Words)", "L3 (Type)", "🎙️ Speak", "🧩 Match"
    const l2Buttons = screen.getAllByText('L2 (Words)');
    fireEvent.click(l2Buttons[0]);
    
    expect(mockNavigate).toHaveBeenCalledWith('/sessions?category=Asiointi%20ja%20Matkustaminen&level=2');

    const speakButtons = screen.getAllByText('🎙️ Speak');
    fireEvent.click(speakButtons[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/sessions?category=Asiointi%20ja%20Matkustaminen&level=3&exerciseType=speaking');
  });

  it('renders "Mastered" badge for completed levels', () => {
    localStorage.setItem('finnishLearnerProgress', JSON.stringify({
      'Asiointi ja Matkustaminen': 4
    }));

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    expect(screen.getByText('🏆 Mastered')).toBeInTheDocument();
  });

  it('opens and closes the guidebook modal', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    const guideBtns = screen.getAllByText('Guidebook');
    fireEvent.click(guideBtns[0]);

    expect(screen.getByTestId('mock-guidebook-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Close Mock Guidebook'));
    expect(screen.queryByTestId('mock-guidebook-modal')).not.toBeInTheDocument();
  });

  it('handles resetting progress', () => {
    localStorage.setItem('finnishLearnerProgress', JSON.stringify({
      'Asiointi ja Matkustaminen': 4
    }));
    window.confirm = vi.fn().mockReturnValue(true);

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    expect(screen.getByText('🏆 Mastered')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Reset Progress'));

    expect(window.confirm).toHaveBeenCalledWith("Are you sure you want to reset all your progress?");
    expect(screen.queryByText('🏆 Mastered')).not.toBeInTheDocument();
  });
  
  it('does not reset progress if confirm is cancelled', () => {
    localStorage.setItem('finnishLearnerProgress', JSON.stringify({
      'Asiointi ja Matkustaminen': 4
    }));
    window.confirm = vi.fn().mockReturnValue(false);

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Reset Progress'));

    expect(window.confirm).toHaveBeenCalled();
    expect(screen.getByText('🏆 Mastered')).toBeInTheDocument();
  });
});

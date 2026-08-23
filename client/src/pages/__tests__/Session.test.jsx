import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Session from '../Session';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../../services/api', () => ({
  generateSession: vi.fn(),
  checkAnswer: vi.fn()
}));
import { generateSession, checkAnswer } from '../../services/api';

describe('Session Component', () => {
  const mockSession = {
    _id: 'session-123',
    questions: [
      {
        sentenceId: 's1',
        level: 1,
        type: 'choice',
        prompt: 'Dog',
        correctAnswer: 'Koira',
        options: ['Kissa', 'Koira', 'Hiiri', 'Hevonen']
      }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock the state returned by useLocation or just render it plainly
    // Session uses useLocation to get state.session
  });

  const renderComponent = (sessionData = mockSession) => {
    // We mock the react-router-dom useLocation hook
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useLocation: () => ({
          state: { session: sessionData }
        }),
        useNavigate: () => vi.fn()
      };
    });

    // Instead of mocking useLocation, we can just let it render the start screen and click start!
    // But since generateSession is imported directly, let's mock generateSession:
    generateSession.mockResolvedValueOnce({ data: { success: true, data: sessionData } });

    return render(
      <BrowserRouter>
        <Session />
      </BrowserRouter>
    );
  };

  it('renders a choice question correctly', async () => {
    renderComponent();
    
    // Click Start Session
    fireEvent.click(screen.getByText('Start Session'));

    await waitFor(() => {
      expect(screen.getByText('Translate this sentence:')).toBeInTheDocument();
    });

    expect(screen.getByText('Dog')).toBeInTheDocument();
    
    const options = screen.getAllByRole('button').filter(b => b.classList.contains('choice-btn'));
    expect(options).toHaveLength(4);
    
    // Select correct option
    const correctBtn = screen.getByText('Koira');
    fireEvent.click(correctBtn);
    
    // Check answer
    checkAnswer.mockResolvedValueOnce({ data: { data: { isCorrect: true, isPerfect: true, correctText: 'Koira' }, success: true } });
    const checkBtn = screen.getByText('Check Answer');
    fireEvent.click(checkBtn);
    
    await waitFor(() => {
      expect(screen.getByText(/Correct!/)).toBeInTheDocument();
    });
  });

  it('renders a matching question correctly', async () => {
    const matchingSession = {
      _id: 'session-456',
      questions: [
        {
          sentenceId: 'm1',
          level: 1,
          type: 'matching',
          tokens: [
            { id: '1', text: 'Koira', lang: 'fi' },
            { id: '1', text: 'Dog', lang: 'en' },
            { id: '2', text: 'Kissa', lang: 'fi' },
            { id: '2', text: 'Cat', lang: 'en' }
          ],
          pairs: [
            { id: '1', fi: 'Koira', en: 'Dog' },
            { id: '2', fi: 'Kissa', en: 'Cat' }
          ]
        }
      ]
    };

    renderComponent(matchingSession);

    // Click Start Session
    fireEvent.click(screen.getByText('Start Session'));

    await waitFor(() => {
      expect(screen.getByText('Tap the matching pairs:')).toBeInTheDocument();
    });
    expect(screen.getByText('Koira')).toBeInTheDocument();
    expect(screen.getByText('Dog')).toBeInTheDocument();

    const koiraBtn = screen.getByText('Koira');
    const dogBtn = screen.getByText('Dog');

    fireEvent.click(koiraBtn);
    fireEvent.click(dogBtn);

    await waitFor(() => {
      expect(koiraBtn).toHaveClass('correct-choice');
      expect(dogBtn).toHaveClass('correct-choice');
    });
  });

  it('renders a speaking question correctly', async () => {
    const speakingSession = {
      _id: 'session-789',
      questions: [
        {
          sentenceId: 'sp1',
          level: 3,
          type: 'speaking',
          prompt: 'Tämä on testi.',
          correctAnswer: 'Tämä on testi.'
        }
      ]
    };

    renderComponent(speakingSession);

    // Click Start Session
    fireEvent.click(screen.getByText('Start Session'));

    await waitFor(() => {
      expect(screen.getByText('Read this sentence out loud:')).toBeInTheDocument();
    });
    expect(screen.getByText('Tämä on testi.')).toBeInTheDocument();

    const micBtn = screen.getByText('🎤');
    expect(micBtn).toBeInTheDocument();

    // Trigger mic
    fireEvent.click(micBtn);

    // Normally SpeechRecognition triggers onresult. Since it's mocked, we can't easily trigger the event 
    // unless we capture the mock instance.
    // For now, we just ensure it renders and clicking doesn't crash.
  });

  it('renders a word-bank question correctly', async () => {
    const wordBankSession = {
      _id: 'session-wb',
      questions: [
        {
          sentenceId: 'wb1',
          level: 2,
          type: 'word-bank',
          prompt: 'I speak Finnish.',
          correctAnswer: 'Minä puhun suomea.',
          wordBank: ['Minä', 'puhun', 'suomea', 'koira']
        }
      ]
    };
    renderComponent(wordBankSession);
    fireEvent.click(screen.getByText('Start Session'));
    
    await waitFor(() => {
      expect(screen.getByText('Translate this sentence:')).toBeInTheDocument();
    });
    
    // Click words in word bank
    fireEvent.click(screen.getByText('Minä'));
    fireEvent.click(screen.getByText('puhun'));
    fireEvent.click(screen.getByText('suomea'));

    checkAnswer.mockResolvedValueOnce({ data: { data: { isCorrect: true, isPerfect: true, correctText: 'Minä puhun suomea.' }, success: true } });
    fireEvent.click(screen.getByText('Check Answer'));
    
    await waitFor(() => {
      expect(screen.getByText(/Correct!/)).toBeInTheDocument();
    });
  });

  it('renders a fill-in-the-blank question correctly', async () => {
    const fillSession = {
      _id: 'session-fib',
      questions: [
        {
          sentenceId: 'fib1',
          level: 3,
          type: 'fill-in-the-blank',
          prompt: 'I speak Finnish.',
          prefix: 'Minä ',
          missingWord: 'puhun',
          suffix: ' suomea.',
          correctAnswer: 'Minä puhun suomea.'
        }
      ]
    };
    renderComponent(fillSession);
    fireEvent.click(screen.getByText('Start Session'));
    
    await waitFor(() => {
      expect(screen.getByText('Type the missing word:')).toBeInTheDocument();
    });
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'puhun' } });

    checkAnswer.mockResolvedValueOnce({ data: { data: { isCorrect: true, isPerfect: true, correctText: 'Minä puhun suomea.' }, success: true } });
    fireEvent.click(screen.getByText('Check Answer'));
    
    await waitFor(() => {
      expect(screen.getByText(/Correct!/)).toBeInTheDocument();
    });
  });

  it('renders a typing question correctly', async () => {
    const typingSession = {
      _id: 'session-typ',
      questions: [
        {
          sentenceId: 'typ1',
          level: 3,
          type: 'typing',
          prompt: 'I speak Finnish.',
          correctAnswer: 'Minä puhun suomea.'
        }
      ]
    };
    renderComponent(typingSession);
    fireEvent.click(screen.getByText('Start Session'));
    
    await waitFor(() => {
      expect(screen.getByText('Translate this sentence:')).toBeInTheDocument();
    });
    
    const input = screen.getByPlaceholderText('Type in Finnish...');
    fireEvent.change(input, { target: { value: 'Minä puhun suomea.' } });

    checkAnswer.mockResolvedValueOnce({ data: { data: { isCorrect: true, isPerfect: true, correctText: 'Minä puhun suomea.' }, success: true } });
    fireEvent.click(screen.getByText('Check Answer'));
    
    await waitFor(() => {
      expect(screen.getByText(/Correct!/)).toBeInTheDocument();
    });
  });

  it('handles incorrect answer gracefully', async () => {
    renderComponent();
    fireEvent.click(screen.getByText('Start Session'));

    await waitFor(() => {
      expect(screen.getByText('Translate this sentence:')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Kissa'));
    
    checkAnswer.mockResolvedValueOnce({ data: { data: { isCorrect: false, correctText: 'Koira' }, success: true } });
    fireEvent.click(screen.getByText('Check Answer'));
    
    await waitFor(() => {
      expect(document.querySelector('.feedback.incorrect')).toBeInTheDocument();
      expect(document.querySelector('.correct-text').textContent).toContain('Koira');
    });
  });
});


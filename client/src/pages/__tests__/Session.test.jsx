import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Session from '../Session';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../../services/api', () => ({
  generateSession: vi.fn(),
  checkAnswer: vi.fn()
}));
vi.mock('../../utils/audio', () => ({
  playAudio: vi.fn()
}));
import { generateSession, checkAnswer } from '../../services/api';
import { playAudio } from '../../utils/audio';

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
    vi.resetAllMocks();
    // Mock the state returned by useLocation or just render it plainly
    // Session uses useLocation to get state.session
  });

  afterEach(() => {
    delete global.window.SpeechRecognition;
    delete global.window.webkitSpeechRecognition;
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
    generateSession.mockResolvedValue({ data: { success: true, data: sessionData } });

    return render(
      <BrowserRouter>
        <Session />
      </BrowserRouter>
    );
  };

  it('handles speaking question recording events and typo feedback', async () => {
    const speakingSession = {
      _id: 'session-speak',
      questions: [
        {
          sentenceId: 'speak1',
          level: 3,
          type: 'speaking',
          prompt: 'Cat',
          correctAnswer: 'Kissa'
        }
      ]
    };
    renderComponent(speakingSession);
    fireEvent.click(screen.getByText('Start Session'));
    
    await waitFor(() => {
      expect(screen.getByText('Tap microphone to speak')).toBeInTheDocument();
    });

    const mockRecognition = {
      start: vi.fn(),
      stop: vi.fn(),
      onresult: null,
      onerror: null,
      onend: null
    };
    global.window.SpeechRecognition = vi.fn().mockImplementation(() => mockRecognition);
    global.window.webkitSpeechRecognition = vi.fn().mockImplementation(() => mockRecognition);

    fireEvent.click(screen.getByText('🎤'));
    
    // simulate onend
    expect(mockRecognition.onend).not.toBeNull();
    mockRecognition.onend();
    
    // Now trigger result
    mockRecognition.onresult({ results: [[{ transcript: 'Kisa' }]] });
    
    await waitFor(() => {
      expect(screen.getByText('"Kisa"')).toBeInTheDocument();
    });

    checkAnswer.mockResolvedValueOnce({ data: { data: { isCorrect: true, isPerfect: false, hasTypo: true }, success: true } });
    fireEvent.click(screen.getByText('Check Answer'));

    await waitFor(() => {
      expect(document.querySelector('.feedback.typo')).toBeInTheDocument();
    });
  });

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

  it('handles generateSession error gracefully', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderComponent();
    generateSession.mockRejectedValueOnce({ response: { data: { error: 'Failed' } } });
    
    fireEvent.click(screen.getByText('Start Session'));
    
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Failed');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    alertSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('renders a word-bank-reverse question correctly', async () => {
    const reverseSession = {
      _id: 'session-wbr',
      questions: [
        {
          sentenceId: 'wbr1',
          level: 2,
          type: 'word-bank-reverse',
          prompt: 'Kissa',
          correctAnswer: 'Cat',
          wordBank: ['Cat', 'Dog', 'Mouse']
        }
      ]
    };
    renderComponent(reverseSession);
    fireEvent.click(screen.getByText('Start Session'));
    
    await waitFor(() => {
      expect(screen.getByText('Write this in English:')).toBeInTheDocument();
    });
  });

  it('renders listening audio controls correctly', async () => {
    const listeningSession = {
      _id: 'session-lis',
      questions: [
        {
          sentenceId: 'lis1',
          level: 3,
          type: 'typing',
          prompt: 'Kissa',
          correctAnswer: 'Kissa',
          isListening: true
        }
      ]
    };
    renderComponent(listeningSession);
    fireEvent.click(screen.getByText('Start Session'));
    
    await waitFor(() => {
      expect(screen.getByTitle('Listen (Normal Speed)')).toBeInTheDocument();
      expect(screen.getByTitle('Listen (Slow)')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTitle('Listen (Normal Speed)'));
    expect(playAudio).toHaveBeenCalledWith('Kissa', 'lis1', 'fi-FI', 1.0);

    fireEvent.click(screen.getByTitle('Listen (Slow)'));
    expect(playAudio).toHaveBeenCalledWith('Kissa', 'lis1', 'fi-FI', 0.6);
  });

  it('deselects a word in word-bank question', async () => {
    const wordBankSession = {
      _id: 'session-wb',
      questions: [
        {
          sentenceId: 'wb1',
          level: 2,
          type: 'word-bank',
          prompt: 'Cat',
          correctAnswer: 'Kissa',
          wordBank: ['Kissa', 'Koira', 'Hiiri']
        }
      ]
    };
    renderComponent(wordBankSession);
    fireEvent.click(screen.getByText('Start Session'));
    
    await waitFor(() => {
      expect(screen.getByText('Kissa')).toBeInTheDocument();
    });

    const kissaChip = screen.getByText('Kissa');
    
    // Select
    fireEvent.click(kissaChip);
    expect(screen.getAllByText('Kissa').length).toBe(2); // one in pool, one in answer

    // Deselect
    const answerChips = document.querySelectorAll('.word-bank-answer .word-chip');
    fireEvent.click(answerChips[0]); // deselect
  });

  it('handles session complete correctly', async () => {
    const singleQuestionSession = {
      _id: 'session-single',
      questions: [
        {
          sentenceId: 's1',
          level: 1,
          type: 'choice',
          prompt: 'Dog',
          correctAnswer: 'Koira',
          options: ['Kissa', 'Koira']
        }
      ]
    };
    renderComponent(singleQuestionSession);
    fireEvent.click(screen.getByText('Start Session'));
    
    await waitFor(() => {
      expect(screen.getByText('Koira')).toBeInTheDocument();
    });

    checkAnswer.mockResolvedValueOnce({ data: { data: { isCorrect: true, isPerfect: true }, success: true } });
    fireEvent.click(screen.getByText('Koira'));
    fireEvent.click(screen.getByText('Check Answer'));

    await waitFor(() => {
      expect(screen.getByText('Continue')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Continue'));

    await waitFor(() => {
      expect(screen.getByText('Session Complete!')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
    
    // Click Try Again
    fireEvent.click(screen.getByText('Try Again'));
    await waitFor(() => {
      expect(screen.getByText('Start a Quiz Session')).toBeInTheDocument();
    });
  });

  it('handles checkAnswer error gracefully', async () => {
    checkAnswer.mockRejectedValueOnce(new Error('Network Error'));
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const testSession = {
      _id: 'session-single',
      questions: [
        {
          sentenceId: 's1',
          level: 1,
          type: 'choice',
          prompt: 'Dog',
          correctAnswer: 'Koira',
          options: ['Kissa', 'Koira']
        }
      ]
    };
    renderComponent(testSession);
    fireEvent.click(screen.getByText('Start Session'));
    
    await waitFor(() => {
      expect(screen.getByText('Koira')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Koira'));
    fireEvent.click(screen.getByText('Check Answer'));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
    consoleErrorSpy.mockRestore();
  });

  it('navigates to the next question if available', async () => {
    const multiSession = {
      _id: 'session-multi',
      questions: [
        {
          sentenceId: 's1',
          level: 1,
          type: 'choice',
          prompt: 'Dog',
          correctAnswer: 'Koira',
          options: ['Kissa', 'Koira']
        },
        {
          sentenceId: 's2',
          level: 1,
          type: 'choice',
          prompt: 'Cat',
          correctAnswer: 'Kissa',
          options: ['Kissa', 'Koira']
        }
      ]
    };
    renderComponent(multiSession);
    fireEvent.click(screen.getByText('Start Session'));
    
    await waitFor(() => {
      expect(screen.getByText('Dog')).toBeInTheDocument();
    });

    checkAnswer.mockResolvedValueOnce({ data: { data: { isCorrect: true, isPerfect: true }, success: true } });
    fireEvent.click(screen.getByText('Koira'));
    fireEvent.click(screen.getByText('Check Answer'));

    await waitFor(() => {
      expect(screen.getByText('Continue')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Continue'));

    await waitFor(() => {
      expect(screen.getByText('Cat')).toBeInTheDocument();
    });
  });

  it('allows picking multiple identical words in word bank', async () => {
    const identicalWordsSession = {
      _id: 'session-identical',
      questions: [
        {
          sentenceId: 'ident1',
          level: 1,
          type: 'word-bank',
          prompt: 'A cat and a dog',
          correctAnswer: 'Kissa ja Kissa', 
          wordBank: ['Kissa', 'ja', 'Kissa', 'koira']
        }
      ]
    };
    renderComponent(identicalWordsSession);
    fireEvent.click(screen.getByText('Start Session'));

    await waitFor(() => {
      expect(screen.getByText('A cat and a dog')).toBeInTheDocument();
    });

    const kissaButtons = screen.getAllByText('Kissa');
    // There should be 2 pool buttons
    expect(kissaButtons.length).toBe(2);

    // Click first 'Kissa'
    fireEvent.click(kissaButtons[0]);
    // Click second 'Kissa'
    fireEvent.click(kissaButtons[1]);

    // Check Answer
    fireEvent.click(screen.getByText('Check Answer'));

    await waitFor(() => {
      expect(checkAnswer).toHaveBeenCalledWith({
        sentenceId: 'ident1',
        userInput: 'Kissa Kissa',
        questionType: 'word-bank'
      });
    });
  });

  it('updates score correctly for matching questions', async () => {
    const matchingSession = {
      _id: 'session-match-score',
      questions: [
        {
          sentenceId: 'match1',
          level: 1,
          type: 'matching',
          prompt: 'Match the words',
          pairs: [{ id: 'p1', fi: 'Kissa', en: 'Cat' }],
          tokens: [
            { id: 'p1', text: 'Kissa', lang: 'fi' },
            { id: 'p1', text: 'Cat', lang: 'en' }
          ]
        }
      ]
    };

    renderComponent(matchingSession);
    fireEvent.click(screen.getByText('Start Session'));

    await waitFor(() => {
      expect(screen.getByText('Tap the matching pairs:')).toBeInTheDocument();
    });

    const kissaBtn = screen.getByText('Kissa');
    const catBtn = screen.getByText('Cat');

    // Click matching pair
    fireEvent.click(kissaBtn);
    fireEvent.click(catBtn);

    // Wait for the feedback state to set
    await waitFor(() => {
      expect(screen.getByText(/All pairs matched!/i)).toBeInTheDocument();
    });

    // Click Next/Continue
    fireEvent.click(screen.getByText('Continue'));

    // Should finish session and show 100%
    await waitFor(() => {
      expect(screen.getByText('Session Complete!')).toBeInTheDocument();
    });
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});

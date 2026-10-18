import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Session from '../Session';
import { BrowserRouter } from 'react-router-dom';
import { useProgressStore } from '../../store/useProgressStore';
import { LanguageProvider } from '../../context/LanguageContext';

vi.mock('../../services/api', () => ({
  generateSession: vi.fn(),
  checkAnswer: vi.fn(),
  fetchProgress: vi.fn(),
  saveProgress: vi.fn().mockResolvedValue({ data: { success: true } })
}));
vi.mock('../../utils/audio', () => ({
  playAudio: vi.fn()
}));
import { generateSession, checkAnswer, saveProgress } from '../../services/api';
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
    localStorage.clear();
    useProgressStore.setState({ progress: {} });
    window.history.pushState({}, '', '/');
  });

  afterEach(() => {
    delete global.window.SpeechRecognition;
    delete global.window.webkitSpeechRecognition;
    window.history.pushState({}, '', '/');
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

  it.each(['en', 'ja'])('shows localized spoken feedback and plays spoken audio in %s', async (language) => {
    const question = { ...mockSession.questions[0], spokenText: 'Mä oon täällä.',
      spokenNotes: 'minä → mä, olen → oon', spokenNotesJa: 'minä → mä（私）, olen → oon（〜です）' };
    generateSession.mockResolvedValue({ data: { success: true, data: { questions: [question] } } });
    render(<LanguageProvider defaultLanguage={language}><BrowserRouter><Session /></BrowserRouter></LanguageProvider>);
    fireEvent.click(screen.getByText(language === 'ja' ? 'セッション開始' : 'Start Session'));
    fireEvent.click(await screen.findByText('Koira'));
    expect(screen.queryByText(/💬/)).not.toBeInTheDocument();
    checkAnswer.mockResolvedValue({ data: { success: true,
      data: { isCorrect: true, isPerfect: true, correctText: 'Koira' } } });
    fireEvent.click(screen.getByText(language === 'ja' ? '回答を確認する' : 'Check Answer'));
    const spoken = await screen.findByText(`${language === 'ja' ? '💬 話し言葉:' : '💬 Spoken:'} ${question.spokenText}`);
    expect(screen.getByText(language === 'ja' ? question.spokenNotesJa : question.spokenNotes)).toBeInTheDocument();
    fireEvent.click(spoken.parentElement.querySelector('button'));
    expect(playAudio).toHaveBeenLastCalledWith(question.spokenText, expect.any(String), 'fi-FI', 1, expect.anything());
  });

  it.each([true, false])('handles spoken-choice feedback, records answers and preserves level progress (correct=%s)', async (isCorrect) => {
    window.history.pushState({}, '', '/sessions?lessonId=l1&level=2&exerciseType=spoken');
    useProgressStore.setState({ progress: { l1: 2 } });
    const question = { sentenceId: 's1', type: 'spoken-choice', level: 2,
      prompt: 'Mä oon täällä.', promptJa: 'ここにいます。', spokenText: 'Mä oon täällä.',
      correctAnswer: 'Minä olen täällä.', options: ['Minä olen täällä.', 'Sinä olet siellä.'] };
    renderComponent({ questions: [question] });
    expect(await screen.findByText('Pick the standard written form of this spoken sentence')).toBeInTheDocument();
    expect(screen.getByText(question.prompt)).toBeInTheDocument();
    fireEvent.click(screen.getByTitle('Listen (Normal Speed)'));
    expect(playAudio).toHaveBeenLastCalledWith(question.prompt, expect.any(String), 'fi-FI', 1, expect.anything());
    fireEvent.click(screen.getByTitle('Listen (Slow)'));
    expect(playAudio).toHaveBeenLastCalledWith(question.prompt, expect.any(String), 'fi-FI', 0.6, expect.anything());
    const answer = isCorrect ? question.options[0] : question.options[1];
    fireEvent.click(screen.getByText(answer));
    checkAnswer.mockResolvedValue({ data: { success: true,
      data: { isCorrect, isPerfect: isCorrect, hasTypo: false, correctText: question.correctAnswer } } });
    fireEvent.click(screen.getByText('Check Answer'));
    await screen.findByText('Continue');
    expect(checkAnswer).toHaveBeenCalledWith({ sentenceId: 's1', userInput: answer, questionType: 'spoken-choice' });
    expect(document.querySelector(isCorrect ? '.feedback.correct' : '.feedback.incorrect')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: question.correctAnswer })).toHaveClass('correct-choice');
    expect(Object.values(JSON.parse(localStorage.getItem('finnishLearnerStudyStats')).days)[0]).toBe(1);
    if (!isCorrect) {
      expect(JSON.parse(localStorage.getItem('finnishLearnerReviewSchedule'))['sentence:s1'].box).toBe(1);
    }
    fireEvent.click(screen.getByText('Continue'));
    expect(await screen.findByText(isCorrect ? '100%' : '0%')).toBeInTheDocument();
    expect(useProgressStore.getState().progress.l1).toBe(2);
  });

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
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderComponent();
    generateSession.mockRejectedValueOnce({ response: { data: { error: 'Failed' } } });

    fireEvent.click(screen.getByText('Start Session'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Could not load the session (Failed)');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('does not retry auto-start in a loop when generating the session fails', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    window.history.pushState({}, '', '/sessions?lessonId=l1&level=1');

    generateSession.mockReset();
    generateSession.mockRejectedValue({ response: { data: { error: 'Failed' } } });
    render(
      <BrowserRouter>
        <Session />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(generateSession).toHaveBeenCalledTimes(1);

    generateSession.mockResolvedValue({ data: { success: true, data: mockSession } });
    fireEvent.click(screen.getByText('Retry'));

    await waitFor(() => {
      expect(generateSession).toHaveBeenCalledTimes(2);
      expect(screen.queryByText('Retry')).not.toBeInTheDocument();
    });

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
    expect(playAudio).toHaveBeenCalledWith('Kissa', 'lis1', 'fi-FI', 1.0, expect.any(Object));

    fireEvent.click(screen.getByTitle('Listen (Slow)'));
    expect(playAudio).toHaveBeenCalledWith('Kissa', 'lis1', 'fi-FI', 0.6, expect.any(Object));
  });

  it('selects a speaker per question and preserves the speaker within the same question', async () => {
    const multiQuestionSession = {
      _id: 'session-multi',
      questions: [
        {
          sentenceId: 'q1',
          level: 1,
          type: 'typing',
          prompt: 'Kissa',
          correctAnswer: 'Kissa',
          isListening: true
        },
        {
          sentenceId: 'q2',
          level: 1,
          type: 'typing',
          prompt: 'Koira',
          correctAnswer: 'Koira',
          isListening: true
        }
      ]
    };
    renderComponent(multiQuestionSession);
    fireEvent.click(screen.getByText('Start Session'));

    await waitFor(() => {
      expect(screen.getByTestId('speaker-badge')).toBeInTheDocument();
    });

    // Play normal audio first time
    fireEvent.click(screen.getByTitle('Listen (Normal Speed)'));
    expect(playAudio).toHaveBeenCalled();
    const firstCallSpeaker = playAudio.mock.calls[playAudio.mock.calls.length - 1][4];
    expect(firstCallSpeaker).toBeDefined();
    expect(firstCallSpeaker).toHaveProperty('name');

    // Play slow audio in the same question
    fireEvent.click(screen.getByTitle('Listen (Slow)'));
    const secondCallSpeaker = playAudio.mock.calls[playAudio.mock.calls.length - 1][4];
    // Speaker must be unchanged in the same question
    expect(secondCallSpeaker.id).toBe(firstCallSpeaker.id);

    // Replay normal audio in the same question
    fireEvent.click(screen.getByTitle('Listen (Normal Speed)'));
    const thirdCallSpeaker = playAudio.mock.calls[playAudio.mock.calls.length - 1][4];
    expect(thirdCallSpeaker.id).toBe(firstCallSpeaker.id);
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

  it('does not increment lesson level when score is below pass threshold', async () => {
    window.history.pushState({}, '', '/sessions?lessonId=l1&level=1');
    const singleQuestionSession = {
      _id: 'session-fail',
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

    await waitFor(() => {
      expect(screen.getByText('Koira')).toBeInTheDocument();
    });

    checkAnswer.mockResolvedValueOnce({ data: { data: { isCorrect: false, correctText: 'Koira' }, success: true } });
    fireEvent.click(screen.getByText('Kissa'));
    fireEvent.click(screen.getByText('Check Answer'));

    await waitFor(() => {
      expect(screen.getByText('Continue')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Continue'));

    await waitFor(() => {
      expect(screen.getByText('Session Complete!')).toBeInTheDocument();
      expect(screen.getByText('You need 80% to pass. Try again!')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Back to Path'));
    expect(useProgressStore.getState().progress['l1']).toBeUndefined();
  });

  it('increments lesson level by lessonId when score meets pass threshold', async () => {
    window.history.pushState({}, '', '/sessions?lessonId=l1&level=1');
    const singleQuestionSession = {
      _id: 'session-pass',
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

    await waitFor(() => {
      expect(screen.getByText('Koira')).toBeInTheDocument();
    });
    expect(generateSession).toHaveBeenCalledWith(5, 'Asiointi ja Matkustaminen', 1, null, expect.any(String));

    checkAnswer.mockResolvedValueOnce({ data: { data: { isCorrect: true, isPerfect: true, correctText: 'Koira' }, success: true } });
    fireEvent.click(screen.getByText('Koira'));
    fireEvent.click(screen.getByText('Check Answer'));

    await waitFor(() => {
      expect(screen.getByText('Continue')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Continue'));

    await waitFor(() => {
      expect(screen.getByText('Session Complete!')).toBeInTheDocument();
      expect(screen.getByText('Passed! The next level is unlocked.')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Back to Path'));
    expect(useProgressStore.getState().progress['l1']).toBe(2);
  });

  it('keeps the unlocked level when the user chooses Try Again after passing', async () => {
    window.history.pushState({}, '', '/sessions?lessonId=l1&level=1');
    const singleQuestionSession = {
      _id: 'session-pass-retry',
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

    await waitFor(() => {
      expect(screen.getByText('Koira')).toBeInTheDocument();
    });

    checkAnswer.mockResolvedValueOnce({ data: { data: { isCorrect: true, isPerfect: true, correctText: 'Koira' }, success: true } });
    fireEvent.click(screen.getByText('Koira'));
    fireEvent.click(screen.getByText('Check Answer'));

    await waitFor(() => {
      expect(screen.getByText('Continue')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Continue'));

    await waitFor(() => {
      expect(screen.getByText('Passed! The next level is unlocked.')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Try Again'));
    expect(useProgressStore.getState().progress['l1']).toBe(2);
  });

  it('shows Passed! without unlock text when re-challenging an already unlocked level, and resolves legacy category param to lessonId', async () => {
    useProgressStore.setState({ progress: { l1: 3 } });
    window.history.pushState({}, '', '/sessions?category=Asiointi%20ja%20Matkustaminen&level=1');
    const singleQuestionSession = {
      _id: 'session-legacy-pass',
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

    await waitFor(() => {
      expect(screen.getByText('Koira')).toBeInTheDocument();
    });

    checkAnswer.mockResolvedValueOnce({ data: { data: { isCorrect: true, isPerfect: true, correctText: 'Koira' }, success: true } });
    fireEvent.click(screen.getByText('Koira'));
    fireEvent.click(screen.getByText('Check Answer'));

    await waitFor(() => {
      expect(screen.getByText('Continue')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Continue'));

    await waitFor(() => {
      expect(screen.getByText('Session Complete!')).toBeInTheDocument();
      expect(screen.getByText('Passed!')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Back to Path'));
    expect(useProgressStore.getState().progress['l1']).toBe(3);
  });

  it('submits answer with Enter when check is enabled and advances to next question with Enter during feedback', async () => {
    const twoQuestionSession = {
      _id: 'session-enter',
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
          level: 3,
          type: 'typing',
          prompt: 'Cat',
          correctAnswer: 'Kissa'
        }
      ]
    };

    renderComponent(twoQuestionSession);
    fireEvent.click(screen.getByText('Start Session'));

    await waitFor(() => {
      expect(screen.getByText('Dog')).toBeInTheDocument();
    });

    // Pressing Enter before selecting an answer does nothing
    fireEvent.keyDown(window, { key: 'Enter' });
    expect(checkAnswer).not.toHaveBeenCalled();

    // Select an answer and press Enter to check
    fireEvent.click(screen.getByText('Koira'));
    checkAnswer.mockResolvedValueOnce({
      data: { success: true, data: { isCorrect: true, isPerfect: true, correctText: 'Koira' } }
    });
    fireEvent.keyDown(window, { key: 'Enter' });

    await waitFor(() => {
      expect(checkAnswer).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Continue')).toBeInTheDocument();
    });

    // Press Enter during feedback to advance to question 2
    fireEvent.keyDown(window, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('Cat')).toBeInTheDocument();
    });
  });

  it('ignores Enter key during IME composition (isComposing or keyCode 229)', async () => {
    const typingSession = {
      _id: 'session-ime',
      questions: [
        {
          sentenceId: 's1',
          level: 3,
          type: 'typing',
          prompt: 'Cat',
          correctAnswer: 'Kissa'
        }
      ]
    };

    renderComponent(typingSession);
    fireEvent.click(screen.getByText('Start Session'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type in Finnish...')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Type in Finnish...');
    fireEvent.change(input, { target: { value: 'Kissa' } });

    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    fireEvent.keyDown(input, { key: 'Enter', keyCode: 229 });

    expect(checkAnswer).not.toHaveBeenCalled();
  });

  it('renders SpecialCharBar for typing and fill-in-the-blank and hides it during feedback', async () => {
    const typingSession = {
      _id: 'session-charbar',
      questions: [
        {
          sentenceId: 's1',
          level: 3,
          type: 'typing',
          prompt: 'Weather',
          correctAnswer: 'Sää'
        }
      ]
    };

    renderComponent(typingSession);
    fireEvent.click(screen.getByText('Start Session'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Insert ä' })).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Type in Finnish...');
    fireEvent.change(input, { target: { value: 'S' } });
    input.setSelectionRange(1, 1);

    fireEvent.click(screen.getByRole('button', { name: 'Insert ä' }));
    fireEvent.click(screen.getByRole('button', { name: 'Insert ä' }));
    expect(input.value).toBe('Sää');

    checkAnswer.mockResolvedValueOnce({
      data: { success: true, data: { isCorrect: true, isPerfect: true, correctText: 'Sää' } }
    });
    fireEvent.click(screen.getByText('Check Answer'));

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Insert ä' })).not.toBeInTheDocument();
    });
  });

  it('uses saved session length preference when auto-starting a session', async () => {
    localStorage.setItem('finnishLearnerSessionLength', '10');
    window.history.pushState({}, '', '/sessions?lessonId=l1&level=1');

    renderComponent(mockSession);

    await waitFor(() => {
      expect(generateSession).toHaveBeenCalledWith(10, 'Asiointi ja Matkustaminen', 1, null, expect.any(String));
    });
  });

  it('records sentence into reviewSchedule at box 1 on incorrect answer and records studyStats', async () => {
    renderComponent(mockSession);
    fireEvent.click(screen.getByText('Start Session'));

    await waitFor(() => {
      expect(screen.getByText('Dog')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Kissa'));
    checkAnswer.mockResolvedValueOnce({
      data: { success: true, data: { isCorrect: false, isPerfect: false, hasTypo: false, correctText: 'Koira' } }
    });
    fireEvent.click(screen.getByText('Check Answer'));

    await waitFor(() => {
      expect(document.querySelector('.feedback.incorrect')).toBeInTheDocument();
    });

    const storedSchedule = JSON.parse(localStorage.getItem('finnishLearnerReviewSchedule'));
    expect(storedSchedule['sentence:s1']).toBeDefined();
    expect(storedSchedule['sentence:s1'].box).toBe(1);
    expect(storedSchedule['sentence:s1'].lapses).toBe(1);
    expect(saveProgress).toHaveBeenCalledWith({
      reviewSchedule: storedSchedule
    });

    const storedStats = JSON.parse(localStorage.getItem('finnishLearnerStudyStats'));
    expect(Object.values(storedStats.days)[0]).toBe(1);
    expect(saveProgress).toHaveBeenCalledWith({
      studyStats: storedStats
    });
  });

  it('starts review mode with due sentenceIds sorted by oldest dueAt and advances box on correct answer', async () => {
    localStorage.setItem(
      'finnishLearnerReviewSchedule',
      JSON.stringify({
        'sentence:s1': {
          box: 1,
          dueAt: '2020-05-02T10:00:00.000Z',
          lastReviewedAt: '2020-05-02T10:00:00.000Z',
          lapses: 1
        },
        'sentence:s2': {
          box: 2,
          dueAt: '2020-05-01T10:00:00.000Z',
          lastReviewedAt: '2020-04-28T10:00:00.000Z',
          lapses: 1
        },
        'sentence:s_future': {
          box: 3,
          dueAt: '2099-01-01T00:00:00.000Z',
          lastReviewedAt: '2020-05-01T00:00:00.000Z',
          lapses: 1
        }
      })
    );
    window.history.pushState({}, '', '/sessions?review=1');

    renderComponent(mockSession);

    await waitFor(() => {
      expect(generateSession).toHaveBeenCalledWith(5, null, null, null, expect.any(String), ['s2', 's1']);
      expect(screen.getByText('Koira')).toBeInTheDocument();
    });

    checkAnswer.mockResolvedValueOnce({
      data: { success: true, data: { isCorrect: true, isPerfect: true, hasTypo: false, correctText: 'Koira' } }
    });
    fireEvent.click(screen.getByText('Koira'));
    fireEvent.click(screen.getByText('Check Answer'));

    await waitFor(() => {
      expect(screen.getByText('Continue')).toBeInTheDocument();
    });

    const updatedSchedule = JSON.parse(localStorage.getItem('finnishLearnerReviewSchedule'));
    expect(updatedSchedule['sentence:s1'].box).toBe(2);
    expect(saveProgress).toHaveBeenCalledWith({
      reviewSchedule: updatedSchedule
    });
  });

  it('moves a sentence up only one box when a review session asks about it twice', async () => {
    localStorage.setItem(
      'finnishLearnerReviewSchedule',
      JSON.stringify({
        'sentence:s1': {
          box: 1,
          dueAt: '2020-05-02T10:00:00.000Z',
          lastReviewedAt: '2020-05-02T10:00:00.000Z',
          lapses: 1
        }
      })
    );
    window.history.pushState({}, '', '/sessions?review=1');
    const choiceQuestion = {
      sentenceId: 's1',
      level: 1,
      type: 'choice',
      prompt: 'Dog',
      correctAnswer: 'Koira',
      options: ['Kissa', 'Koira']
    };
    renderComponent({ _id: 'review-twice', questions: [choiceQuestion, { ...choiceQuestion, level: 2 }] });

    for (let i = 0; i < 2; i += 1) {
      await waitFor(() => {
        expect(screen.getByText('Koira')).toBeInTheDocument();
      });
      checkAnswer.mockResolvedValueOnce({
        data: { success: true, data: { isCorrect: true, isPerfect: true, hasTypo: false, correctText: 'Koira' } }
      });
      fireEvent.click(screen.getByText('Koira'));
      fireEvent.click(screen.getByText('Check Answer'));
      await waitFor(() => {
        expect(screen.getByText('Continue')).toBeInTheDocument();
      });
      if (i === 0) fireEvent.click(screen.getByText('Continue'));
    }

    const updatedSchedule = JSON.parse(localStorage.getItem('finnishLearnerReviewSchedule'));
    expect(updatedSchedule['sentence:s1'].box).toBe(2);
  });

  it('shows empty review message when starting review mode with 0 due sentences', async () => {
    window.history.pushState({}, '', '/sessions?review=1');

    renderComponent(mockSession);

    await waitFor(() => {
      expect(screen.getByText('Nothing to review today.')).toBeInTheDocument();
    });
    expect(generateSession).not.toHaveBeenCalled();
  });

  it('auto-plays audio once per question in dictation mode without throwing on rejected autoplay and does not advance level progress', async () => {
    window.history.pushState({}, '', '/sessions?lessonId=l1&level=1&exerciseType=dictation');
    const dictationSession = {
      sessionId: 'dict-1',
      questions: [
        {
          sentenceId: 's1',
          level: 3,
          type: 'typing',
          prompt: 'I speak Finnish.',
          correctAnswer: 'Minä puhun suomea.',
          isListening: true
        },
        {
          sentenceId: 's2',
          level: 3,
          type: 'typing',
          prompt: 'This is easy.',
          correctAnswer: 'Tämä on helppoa.',
          isListening: true
        }
      ]
    };

    playAudio.mockRejectedValueOnce(new Error('Autoplay blocked'));
    renderComponent(dictationSession);

    await waitFor(() => {
      expect(screen.getByText('Type what you hear:')).toBeInTheDocument();
    });

    expect(playAudio).toHaveBeenCalledTimes(1);
    expect(playAudio).toHaveBeenCalledWith(
      'Minä puhun suomea.',
      's1',
      'fi-FI',
      1.0,
      expect.any(Object)
    );

    // Typing in the input should not re-trigger autoplay
    const input = screen.getByPlaceholderText('Type in Finnish...');
    fireEvent.change(input, { target: { value: 'Minä puhun suomea.' } });
    expect(playAudio).toHaveBeenCalledTimes(1);

    checkAnswer.mockResolvedValueOnce({
      data: { success: true, data: { isCorrect: true, isPerfect: true, correctText: 'Minä puhun suomea.' } }
    });
    fireEvent.click(screen.getByText('Check Answer'));

    await waitFor(() => {
      expect(screen.getByText('Continue')).toBeInTheDocument();
    });
    expect(playAudio).toHaveBeenCalledTimes(1);

    // Advancing to question 2 auto-plays question 2 once
    fireEvent.click(screen.getByText('Continue'));

    await waitFor(() => {
      expect(playAudio).toHaveBeenCalledTimes(2);
    });
    expect(playAudio).toHaveBeenLastCalledWith(
      'Tämä on helppoa.',
      's2',
      'fi-FI',
      1.0,
      expect.any(Object)
    );

    // Finish question 2 and verify level progress is unchanged
    const input2 = screen.getByPlaceholderText('Type in Finnish...');
    fireEvent.change(input2, { target: { value: 'Tämä on helppoa.' } });
    checkAnswer.mockResolvedValueOnce({
      data: { success: true, data: { isCorrect: true, isPerfect: true, correctText: 'Tämä on helppoa.' } }
    });
    fireEvent.click(screen.getByText('Check Answer'));

    await waitFor(() => {
      expect(screen.getByText('Continue')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Continue'));

    await waitFor(() => {
      expect(screen.getByText('Session Complete!')).toBeInTheDocument();
    });
    expect(useProgressStore.getState().progress['l1']).toBeUndefined();
  });
});

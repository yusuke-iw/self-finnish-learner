import React from 'react';
import { useLanguage } from '../context/useLanguage';
import { useSession } from '../hooks/useSession';
import QuestionPrompt from '../components/session/QuestionPrompt';
import ChoiceQuestion from '../components/session/ChoiceQuestion';
import WordBankQuestion from '../components/session/WordBankQuestion';
import TypingQuestion from '../components/session/TypingQuestion';
import FillInBlankQuestion from '../components/session/FillInBlankQuestion';
import MatchingQuestion from '../components/session/MatchingQuestion';
import SpeakingQuestion from '../components/session/SpeakingQuestion';
import SessionFeedback from '../components/session/SessionFeedback';
import SessionSummary from '../components/session/SessionSummary';
import { NoReviewScreen, StartErrorScreen, StartScreen } from '../components/session/SessionSetup';

export default function Session() {
  const { language, t } = useLanguage();
  const s = useSession();
  const { session, currentQuestion, feedback, currentSpeaker } = s;

  if (s.isFinished) {
    return (
      <SessionSummary
        score={s.score}
        totalQuestions={session.questions.length}
        showResult={!s.isReviewMode && Boolean(s.resolvedLessonId) && Boolean(s.levelParam)}
        unlockedNext={s.unlockedNext}
        onBack={s.goHome}
        onRetry={s.restart}
      />
    );
  }

  if (s.isReviewMode && s.noReviewSentences) {
    return <NoReviewScreen onHome={s.goHome} />;
  }

  if (!session && s.startError) {
    return <StartErrorScreen error={s.startError} onRetry={s.clearStartError} onHome={s.goHome} />;
  }

  if (!session) {
    return (
      <StartScreen
        category={s.resolvedCategory}
        level={s.levelParam}
        showForm={!s.resolvedCategory && !s.isReviewMode}
        sentenceCount={s.sentenceCount}
        isStarting={s.isStarting}
        onCountChange={s.changeSentenceCount}
        onStart={() => s.startSession()}
      />
    );
  }

  const progress = ((s.currentIndex) / session.questions.length) * 100;

  return (
    <div className="session-page">
      <div className="progress-container">
        <div className="progress-info">
          <span>{t('session.questionOf', { current: s.currentIndex + 1, total: session.questions.length })}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className={`question-card ${feedback?.isCorrect ? 'correct-flash' : ''} ${feedback && !feedback.isCorrect ? 'incorrect-flash' : ''}`}>
        <div className="question-card-header">
          <div className={`level-badge level-${currentQuestion.level}`}>
            {t('session.levelLabel', { level: currentQuestion.level })}
          </div>
          {currentSpeaker && (
            <div
              data-testid="speaker-badge"
              className="speaker-badge"
              title={currentSpeaker.description}
            >
              <span className="speaker-badge-icon">{currentSpeaker.icon}</span>
              <span>{currentSpeaker.name}</span>
            </div>
          )}
        </div>

        <QuestionPrompt question={currentQuestion} speaker={currentSpeaker} />

        {(currentQuestion.type === 'choice' || currentQuestion.type === 'spoken-choice') && (
          <ChoiceQuestion
            question={currentQuestion}
            selected={s.inputValue}
            feedback={feedback}
            speaker={currentSpeaker}
            onSelect={s.setInputValue}
          />
        )}

        {(currentQuestion.type === 'word-bank' || currentQuestion.type === 'word-bank-reverse') && (
          <WordBankQuestion
            question={currentQuestion}
            selectedWords={s.selectedWords}
            feedback={feedback}
            onToggleWord={s.toggleWord}
          />
        )}

        {currentQuestion.type === 'typing' && (
          <TypingQuestion
            inputRef={s.inputRef}
            value={s.inputValue}
            feedback={feedback}
            onChange={s.setInputValue}
          />
        )}

        {currentQuestion.type === 'fill-in-the-blank' && (
          <FillInBlankQuestion
            question={currentQuestion}
            inputRef={s.inputRef}
            value={s.inputValue}
            feedback={feedback}
            onChange={s.setInputValue}
          />
        )}

        {currentQuestion.type === 'matching' && (
          <MatchingQuestion
            question={currentQuestion}
            selectedTokens={s.selectedMatchingTokens}
            matchedPairIds={s.matchedPairIds}
            wrongMatch={s.wrongMatch}
            isChecking={s.isChecking}
            onTokenClick={s.handleMatchingTokenClick}
          />
        )}

        {currentQuestion.type === 'speaking' && (
          <SpeakingQuestion
            value={s.inputValue}
            isRecording={s.isRecording}
            feedback={feedback}
            onMicClick={s.handleMicClick}
          />
        )}

        {feedback && (
          <SessionFeedback feedback={feedback} question={currentQuestion} speaker={currentSpeaker} />
        )}

        <div className="question-actions">
          {!feedback ? (
            currentQuestion.type !== 'matching' && (
              <button
                className="btn-check"
                onClick={s.handleCheck}
                disabled={!s.canCheckAnswer()}
              >
                {language === 'en' ? 'Check Answer' : '回答を確認する'}
              </button>
            )
          ) : (
            <button className="btn-next" onClick={s.handleNext}>
              {language === 'en' ? 'Continue' : '次へ ➔'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

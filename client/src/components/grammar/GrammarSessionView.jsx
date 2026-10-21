import React from 'react';
import { playAudio } from '../../utils/audio';
import { useLanguage } from '../../context/useLanguage';
import GrammarChoiceQuestion from './GrammarChoiceQuestion';
import GrammarWordbankQuestion from './GrammarWordbankQuestion';
import GrammarTypingQuestion from './GrammarTypingQuestion';
import GrammarFeedback from './GrammarFeedback';

export default function GrammarSessionView({
  question,
  index,
  total,
  streak,
  answer,
  isSubmitted,
  isCorrect,
  onAnswerChange,
  onInsertChar,
  onSubmit,
  onNext,
  onKeyDown,
  onExit
}) {
  const { t, language } = useLanguage();

  return (
    <div className="practice-session-card" onKeyDown={onKeyDown} tabIndex={0}>
      {/* Top Progress & Stats */}
      <div className="session-top-bar">
        <button
          type="button"
          className="exit-btn"
          onClick={() => {
            if (window.confirm(t('drillStudio.exitConfirm'))) {
              onExit();
            }
          }}
        >
          {t('drillStudio.exitBtn')}
        </button>

        <div className="session-progress-wrapper">
          <div
            className="session-progress-bar"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>

        <div className="session-indicators">
          <span className="q-counter">
            {index + 1} / {total}
          </span>
          {streak > 1 && (
            <span className="streak-badge">
              {t('drillStudio.streakBadge', { count: streak })}
            </span>
          )}
        </div>
      </div>

      {/* Question Metadata */}
      <div className="drill-question-header">
        <span className={`level-badge level-${(question.level || 'a1').toLowerCase()}`}>
          {question.level || 'A1'}
        </span>
        <span className="drill-topic-name">
          {language === 'en' && question.topicTitleEn ? question.topicTitleEn : question.topicTitle}
        </span>
        <button
          type="button"
          className="drill-audio-btn"
          title={language === 'en' ? t('common.listen') : '発音を再生'}
          onClick={() => playAudio(question.answer || question.question)}
        >
          🔊
        </button>
      </div>

      {/* Question Body */}
      <div className="drill-question-box">
        <h2 className="drill-question-text">
          {(language === 'en' && question.questionEn) ? question.questionEn : question.question}
        </h2>
      </div>

      {/* Question Interactive Area */}
      <div className="drill-interaction-area">
        {question.type === 'choice' && (
          <GrammarChoiceQuestion
            question={question}
            answer={answer}
            isSubmitted={isSubmitted}
            onSelect={onAnswerChange}
          />
        )}

        {question.type === 'wordbank' && (
          <GrammarWordbankQuestion
            question={question}
            answer={answer}
            isSubmitted={isSubmitted}
            onSelect={onAnswerChange}
          />
        )}

        {question.type === 'typing' && (
          <GrammarTypingQuestion
            question={question}
            answer={answer}
            isSubmitted={isSubmitted}
            onChange={onAnswerChange}
            onInsertChar={onInsertChar}
          />
        )}
      </div>

      {/* Feedback & Explanation Banner */}
      {isSubmitted && <GrammarFeedback question={question} isCorrect={isCorrect} />}

      {/* Bottom Action Footer */}
      <div className="drill-footer-actions">
        {!isSubmitted ? (
          <button
            type="button"
            className="drill-check-btn"
            disabled={!answer || !answer.trim()}
            onClick={onSubmit}
          >
            {t('drillStudio.submitBtnEnter')}
          </button>
        ) : (
          <button
            type="button"
            className="drill-next-btn"
            autoFocus
            onClick={onNext}
          >
            {index + 1 < total ? t('drillStudio.nextBtn') : t('drillStudio.finishBtn')}
          </button>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { playAudio } from '../../utils/audio';
import { useLanguage } from '../../context/useLanguage';

export default function SessionFeedback({ feedback, question, speaker }) {
  const { language, t } = useLanguage();

  return (
    <div className={`feedback ${feedback.isPerfect ? 'correct' : feedback.hasTypo ? 'typo' : 'incorrect'}`}>
      <div>
        {feedback.isPerfect
          ? t('session.feedbackCorrect')
          : feedback.hasTypo
          ? t('session.feedbackTypo')
          : t('session.feedbackWrong')}
        <div className="correct-answer-container">
          <div>
            <span className="correct-text">{t('session.correctAnswerIs')} {feedback.correctText}</span>
            {question.type !== 'word-bank-reverse' && (
              <button
                className="btn-audio feedback-audio-btn"
                onClick={() => playAudio(feedback.correctText, question.sentenceId, 'fi-FI', 1.0, speaker)}
                title={t('common.listen')}
              >
                🔊
              </button>
            )}
          </div>
        </div>
        {question.spokenText && (
          <div className="spoken-variant">
            <div>
              <span>{t('session.spokenLabel')} {question.spokenText}</span>
              <button
                className="btn-audio feedback-audio-btn"
                onClick={() => playAudio(question.spokenText, question.sentenceId, 'fi-FI', 1.0, speaker)}
                title={t('common.listen')}
              >
                🔊
              </button>
            </div>
            <p className="spoken-notes">{language === 'ja'
              ? (question.spokenNotesJa || question.spokenNotes)
              : question.spokenNotes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { playAudio } from '../../utils/audio';
import { useLanguage } from '../../context/useLanguage';

export default function QuestionPrompt({ question, speaker }) {
  const { language, t } = useLanguage();

  return (
    <div className="question-prompt">
      <span className="instruction">
        {question.type === 'spoken-choice'
          ? t('session.instructionSpoken')
          : question.isListening
          ? (question.type === 'typing' ? t('session.instructionListenTyping') : t('session.instructionListenFill'))
          : question.type === 'word-bank-reverse'
            ? t('session.instructionReverse')
            : question.type === 'fill-in-the-blank'
              ? t('session.instructionFill')
              : question.type === 'matching'
                ? t('session.instructionMatching')
                : question.type === 'speaking'
                  ? t('session.instructionSpeaking')
                  : t('session.instructionTranslate')}
      </span>
      <div className="prompt-text-container">
        {question.type === 'spoken-choice' ? (
          <>
            <span>{question.prompt}</span>
            <button
              className="btn-audio prompt-audio"
              onClick={() => playAudio(question.prompt, question.sentenceId, 'fi-FI', 1.0, speaker)}
              title={t('session.listenNormal')}
            >
              🔊
            </button>
            <button
              className="btn-audio prompt-audio slow"
              onClick={() => playAudio(question.prompt, question.sentenceId, 'fi-FI', 0.6, speaker)}
              title={t('session.listenSlow')}
            >
              🐢
            </button>
          </>
        ) : question.isListening ? (
          <div className="listening-audio-controls">
            <button
              className="btn-audio prompt-audio"
              onClick={() => playAudio(question.correctAnswer, question.sentenceId, 'fi-FI', 1.0, speaker)}
              title={t('session.listenNormal')}
            >
              🔊
            </button>
            <button
              className="btn-audio prompt-audio slow"
              onClick={() => playAudio(question.correctAnswer, question.sentenceId, 'fi-FI', 0.6, speaker)}
              title={t('session.listenSlow')}
            >
              🐢
            </button>
          </div>
        ) : (
          <>
            {(question.type === 'word-bank-reverse' || question.type === 'fill-in-the-blank' || question.type === 'speaking') && (
              <button
                className="btn-audio prompt-audio"
                onClick={() => playAudio(question.prompt, question.sentenceId, 'fi-FI', 1.0, speaker)}
                title={t('common.listen')}
              >
                🔊
              </button>
            )}
            {question.type !== 'matching' && (
              (language === 'ja' && question.promptJa) ? question.promptJa : question.prompt
            )}
          </>
        )}
      </div>
    </div>
  );
}

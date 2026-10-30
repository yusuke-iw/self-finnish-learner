import React, { useState } from 'react';
import SceneText from './SceneText';
import {
  createProcedureRound,
  getCurrentProcedure,
  getCurrentStep,
  answerStep,
  nextStep
} from '../../utils/procedureSim';
import { pickText, pickWord } from '../../utils/sceneText';
import { playAudio } from '../../utils/audio';
import { DEFAULT_SPEAKER } from '../../utils/speakers';
import {
  playCorrectSound,
  playIncorrectSound,
  playLessonCompleteSound
} from '../../utils/feedbackSounds';
import { recordAnswer } from '../../utils/studyStats';
import { useLanguage } from '../../context/useLanguage';

export default function ProcedureSim({ game, mode, onFinish }) {
  const { t } = useLanguage();
  const [round, setRound] = useState(() => createProcedureRound(game));
  const [wrongButtonIds, setWrongButtonIds] = useState([]);
  const [lastButtonId, setLastButtonId] = useState(null);
  const [isLast, setIsLast] = useState(false);

  const procedure = getCurrentProcedure(round);
  const step = getCurrentStep(round);

  if (!procedure || !step) {
    return null;
  }

  const totalSteps = Array.isArray(procedure.steps) ? procedure.steps.length : 0;

  const handlePlayAudio = (text, id, speed = 1.0) => {
    try {
      const p = playAudio(text, id, 'fi-FI', speed, DEFAULT_SPEAKER);
      if (p && typeof p.catch === 'function') {
        p.catch(() => {});
      }
    } catch {
      // ignore playback errors
    }
  };

  const handleButtonClick = (buttonId) => {
    if (round.solved) return;

    const result = answerStep(round, buttonId);
    if (result.isNewStep) {
      recordAnswer();
    }
    setRound(result.state);
    setLastButtonId(buttonId);

    if (result.isCorrect) {
      playCorrectSound();
      setIsLast(result.finished);
    } else {
      playIncorrectSound();
      setWrongButtonIds((prev) => (prev.includes(buttonId) ? prev : [...prev, buttonId]));
    }
  };

  const handleNext = () => {
    if (isLast) {
      playLessonCompleteSound();
      onFinish();
      return;
    }
    setRound((prev) => nextStep(prev));
    setWrongButtonIds([]);
    setLastButtonId(null);
  };

  const screenAudioText = Array.isArray(step.screen)
    ? step.screen
        .map((line) => line.fi)
        .filter((fi) => fi && fi !== '****')
        .join(' ')
    : '';

  const lastButton =
    lastButtonId && Array.isArray(step.buttons)
      ? step.buttons.find((b) => b.id === lastButtonId) || null
      : null;

  return (
    <div className="scene-atm-game">
      <div className="scene-progress-bar">
        <span className="scene-round-counter">
          {round.stepIndex + 1} / {totalSteps}
        </span>
      </div>

      <div className="scene-atm-goal">
        <span className="scene-atm-goal-label">{t('scenes.procedure.goal')}</span>
        <SceneText text={procedure.goal} mode={mode} className="scene-atm-goal-text" />
      </div>

      {step.question && (
        <div className="scene-atm-question">
          <SceneText text={step.question} mode={mode} />
        </div>
      )}

      <div className="scene-atm-layout">
        <div
          className="scene-atm-screen"
          role="group"
          aria-label={t('scenes.procedure.screenLabel')}
        >
          <div className="scene-atm-screen-lines">
            {Array.isArray(step.screen) &&
              step.screen.map((line, idx) => {
                const rawSub =
                  mode === 'fi'
                    ? null
                    : mode === 'selko'
                      ? (line.selko ?? null)
                      : pickText(line, mode).sub;
                const sub = rawSub && rawSub !== line.fi ? rawSub : null;

                return (
                  <div key={idx} className="scene-atm-screen-line">
                    <span className="scene-text">
                      <span className="scene-text-main">{line.fi}</span>
                      {sub && <span className="scene-text-sub">{sub}</span>}
                    </span>
                  </div>
                );
              })}
          </div>

          <div className="scene-weather-audio-btns">
            <button
              type="button"
              className="btn-audio"
              aria-label={t('scenes.listen')}
              onClick={() => handlePlayAudio(screenAudioText, `${step.id}-screen`, 1.0)}
            >
              🔊
            </button>
            <button
              type="button"
              className="btn-audio"
              aria-label={t('scenes.slowListen')}
              onClick={() => handlePlayAudio(screenAudioText, `${step.id}-screen`, 0.6)}
            >
              🐢
            </button>
          </div>
        </div>

        <div
          className="scene-atm-buttons"
          role="group"
          aria-label={t('scenes.procedure.buttonsLabel')}
        >
          {Array.isArray(step.buttons) &&
            step.buttons.map((btn) => {
              const isWrong = wrongButtonIds.includes(btn.id);
              const isCorrect = round.solved && Boolean(btn.correct);
              const keyClass = btn.key
                ? `scene-atm-key scene-atm-key-${btn.key}`
                : 'scene-atm-side-btn';
              const rawSub = pickWord(btn.label, mode).sub;
              const sub = rawSub && rawSub !== btn.label?.fi ? rawSub : null;

              return (
                <button
                  key={btn.id}
                  type="button"
                  className={`${keyClass}${isWrong ? ' scene-atm-wrong wrong-choice' : ''}${
                    isCorrect ? ' scene-atm-correct correct-choice' : ''
                  }`}
                  disabled={round.solved || isWrong}
                  onClick={() => handleButtonClick(btn.id)}
                >
                  <span className="scene-text">
                    <span className="scene-text-main">{btn.label?.fi}</span>
                    {sub && <span className="scene-text-sub">{sub}</span>}
                  </span>
                  {isWrong && <span className="scene-atm-mark">✖</span>}
                  {isCorrect && <span className="scene-atm-mark">✔</span>}
                </button>
              );
            })}
        </div>
      </div>

      {lastButton && lastButton.feedback && (
        <div
          className={`scene-atm-feedback ${
            round.solved ? 'scene-atm-feedback-correct' : 'scene-atm-feedback-wrong'
          }`}
          role="status"
        >
          <SceneText text={lastButton.feedback} mode={mode} />
        </div>
      )}

      <div className="scene-game-actions">
        {round.solved && (
          <button type="button" className="btn-primary scene-next-btn" onClick={handleNext}>
            {isLast ? t('scenes.done') : t('scenes.next')}
          </button>
        )}
      </div>
    </div>
  );
}

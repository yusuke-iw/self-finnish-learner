import React, { useState } from 'react';
import SceneText from './SceneText';
import { createOutfitRound, checkOutfit, getWearSentences } from '../../utils/outfitGame';
import { playAudio } from '../../utils/audio';
import { DEFAULT_SPEAKER } from '../../utils/speakers';
import {
  playCorrectSound,
  playIncorrectSound,
  playLessonCompleteSound
} from '../../utils/feedbackSounds';
import { recordAnswer } from '../../utils/studyStats';
import { useLanguage } from '../../context/useLanguage';

export default function OutfitGame({ game, mode, onFinish }) {
  const { t } = useLanguage();
  const [round] = useState(() => createOutfitRound(game));
  const [index, setIndex] = useState(0);
  const [selection, setSelection] = useState({});
  const [result, setResult] = useState(null);
  const [solved, setSolved] = useState(false);
  const [answeredIds, setAnsweredIds] = useState(() => new Set());

  const condition = round[index];
  const totalRounds = round.length;

  if (!condition) {
    return null;
  }

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

  const handleOptionSelect = (slotId, optionId) => {
    if (solved) return;

    setSelection((prev) => ({
      ...prev,
      [slotId]: optionId
    }));

    // Clear error feedback for this slot upon changing selection
    if (result && result.wrongSlotIds.includes(slotId)) {
      setResult((prev) => {
        if (!prev) return null;
        const nextWrongs = prev.wrongSlotIds.filter((id) => id !== slotId);
        return {
          ...prev,
          wrongSlotIds: nextWrongs
        };
      });
    }
  };

  const handleCheck = () => {
    if (solved || !condition) return;

    // Record answer once per weather condition on first submit
    if (!answeredIds.has(condition.id)) {
      recordAnswer();
      setAnsweredIds((prev) => new Set(prev).add(condition.id));
    }

    const checkRes = checkOutfit(condition, selection);
    setResult(checkRes);

    if (checkRes.allCorrect) {
      playCorrectSound();
      setSolved(true);
    } else {
      playIncorrectSound();
    }
  };

  const handleNext = () => {
    if (index + 1 < totalRounds) {
      setIndex((i) => i + 1);
      setSelection({});
      setResult(null);
      setSolved(false);
    } else {
      playLessonCompleteSound();
      onFinish();
    }
  };

  const isAllSelected = Array.isArray(game.slots) &&
    game.slots.every((slot) => Boolean(selection[slot.id]));

  const wearSentences = solved ? getWearSentences(game, selection) : [];

  return (
    <div className="outfit-game">
      {/* Header Info: Progress, Condition */}
      <div className="scene-progress-bar">
        <span className="scene-round-counter">
          {index + 1} / {totalRounds}
        </span>
      </div>

      <div className="scene-weather-card">
        <div className="scene-weather-top">
          <span className="scene-weather-icon">{condition.icon}</span>
          <span className="scene-weather-temp">{condition.temperature} °C</span>
        </div>
        <div className="scene-weather-main">
          <SceneText text={condition.weather} mode={mode} className="scene-weather-text" />
          <div className="scene-weather-audio-btns">
            <button
              type="button"
              className="btn-audio"
              aria-label={t('scenes.listen')}
              onClick={() => handlePlayAudio(condition.weather.fi, condition.id, 1.0)}
            >
              🔊
            </button>
            <button
              type="button"
              className="btn-audio"
              aria-label={t('scenes.slowListen')}
              onClick={() => handlePlayAudio(condition.weather.fi, condition.id, 0.6)}
            >
              🐢
            </button>
          </div>
        </div>
      </div>

      {/* Outfit Slots */}
      <div className="scene-slots-container">
        {game.slots.map((slot) => {
          const selectedOptionId = selection[slot.id];
          const isWrong = result && result.wrongSlotIds.includes(slot.id);
          const isCorrect = result && !result.wrongSlotIds.includes(slot.id) && selectedOptionId;

          return (
            <div
              key={slot.id}
              className={`scene-slot ${isWrong ? 'scene-slot-wrong' : ''} ${
                isCorrect ? 'scene-slot-correct' : ''
              }`}
            >
              <div className="scene-slot-header">
                <span className="scene-slot-label">
                  <SceneText text={slot.label} mode={mode} variant="word" />
                </span>
                {isWrong && <span className="scene-slot-status-icon">✖</span>}
                {isCorrect && <span className="scene-slot-status-icon">✔</span>}
              </div>

              <div className="scene-slot-options" role="group" aria-label={slot.label.fi}>
                {slot.options.map((option) => {
                  const isSelected = selectedOptionId === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={`scene-option-btn ${isSelected ? 'selected' : ''}`}
                      aria-pressed={isSelected}
                      disabled={solved}
                      onClick={() => handleOptionSelect(slot.id, option.id)}
                    >
                      <span className="scene-option-icon">{option.icon}</span>
                      <SceneText text={option.label} mode={mode} variant="word" />
                    </button>
                  );
                })}
              </div>

              {isWrong && condition.hints && condition.hints[slot.id] && (
                <div className="scene-slot-hint">
                  <SceneText text={condition.hints[slot.id]} mode={mode} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Solved sentences display */}
      {solved && wearSentences.length > 0 && (
        <div className="scene-wear-sentences">
          {wearSentences.map((sentence, idx) => (
            <div key={idx} className="scene-wear-sentence-row">
              <SceneText text={sentence} mode={mode} />
              <button
                type="button"
                className="btn-audio"
                aria-label={t('scenes.listen')}
                onClick={() => handlePlayAudio(sentence.fi, `wear-${idx}`, 1.0)}
              >
                🔊
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Action Button: Check Outfit or Next */}
      <div className="scene-game-actions">
        {!solved ? (
          <button
            type="button"
            className="btn-primary scene-check-btn"
            disabled={!isAllSelected}
            onClick={handleCheck}
          >
            {t('scenes.check')}
          </button>
        ) : (
          <button
            type="button"
            className="btn-primary scene-next-btn"
            onClick={handleNext}
          >
            {index + 1 === totalRounds ? t('scenes.done') : t('scenes.next')}
          </button>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import SceneText from './SceneText';
import {
  createSortRound,
  getCurrentSortItem,
  answerSortItem,
  nextSortItem
} from '../../utils/sortGame';
import { playAudio } from '../../utils/audio';
import { DEFAULT_SPEAKER } from '../../utils/speakers';
import {
  playCorrectSound,
  playIncorrectSound,
  playLessonCompleteSound
} from '../../utils/feedbackSounds';
import { recordAnswer } from '../../utils/studyStats';
import { useLanguage } from '../../context/useLanguage';

export default function SortGame({ game, mode, onFinish }) {
  const { t, language } = useLanguage();
  const [round, setRound] = useState(() => createSortRound(game));
  const [wrongBinIds, setWrongBinIds] = useState([]);
  const [lastWrongBinId, setLastWrongBinId] = useState(null);
  const [isLast, setIsLast] = useState(false);

  const item = getCurrentSortItem(round);
  const totalRounds = round.items.length;

  if (!item) {
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

  const handleBinSelect = (binId) => {
    if (round.solved) return;

    const result = answerSortItem(round, binId);
    if (result.isNewItem) {
      recordAnswer();
    }
    setRound(result.state);

    if (result.isCorrect) {
      playCorrectSound();
      setIsLast(result.finished);
      setLastWrongBinId(null);
    } else {
      playIncorrectSound();
      setWrongBinIds((prev) => (prev.includes(binId) ? prev : [...prev, binId]));
      setLastWrongBinId(binId);
    }
  };

  const handleNext = () => {
    if (isLast) {
      playLessonCompleteSound();
      onFinish();
      return;
    }
    setRound((prev) => nextSortItem(prev));
    setWrongBinIds([]);
    setLastWrongBinId(null);
  };

  return (
    <div className="sort-game">
      <div className="scene-progress-bar">
        <span className="scene-round-counter">
          {round.index + 1} / {totalRounds}
        </span>
      </div>

      <div className="sort-item-card">
        <span className="sort-item-icon">{item.icon}</span>
        <SceneText text={item.label} mode={mode} variant="word" className="sort-item-label" />
        <div className="scene-weather-audio-btns">
          <button
            type="button"
            className="btn-audio"
            aria-label={t('scenes.listen')}
            onClick={() => handlePlayAudio(item.label.fi, `${item.id}-label`, 1.0)}
          >
            🔊
          </button>
          <button
            type="button"
            className="btn-audio"
            aria-label={t('scenes.slowListen')}
            onClick={() => handlePlayAudio(item.label.fi, `${item.id}-label`, 0.6)}
          >
            🐢
          </button>
        </div>
      </div>

      <p className="sort-prompt">{game.prompt?.[language] || t('scenes.sort.prompt')}</p>

      <div className="sort-bins" role="group" aria-label={game.binsLabel?.[language] || t('scenes.sort.binsLabel')}>
        {game.bins.map((bin) => {
          const isWrong = wrongBinIds.includes(bin.id);
          const isCorrect = round.solved && bin.id === item.binId;

          return (
            <button
              key={bin.id}
              type="button"
              className={`sort-bin-btn ${isWrong ? 'wrong-choice' : ''} ${
                isCorrect ? 'correct-choice' : ''
              }`}
              style={{ '--bin-color': bin.color }}
              disabled={round.solved || isWrong}
              onClick={() => handleBinSelect(bin.id)}
            >
              <SceneText text={bin.label} mode={mode} variant="word" />
              {isWrong && <span className="sort-bin-mark">✖</span>}
              {isCorrect && <span className="sort-bin-mark">✔</span>}
            </button>
          );
        })}
      </div>

      {lastWrongBinId && !round.solved && (
        <div className="scene-slot-hint" role="status">
          <SceneText text={item.hint} mode={mode} />
        </div>
      )}

      {round.solved && (
        <div className="scene-wear-sentences" role="status">
          <div className="scene-wear-sentence-row">
            <SceneText text={item.sentence} mode={mode} />
            <button
              type="button"
              className="btn-audio"
              aria-label={t('scenes.listen')}
              onClick={() => handlePlayAudio(item.sentence.fi, `${item.id}-sentence`, 1.0)}
            >
              🔊
            </button>
          </div>
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

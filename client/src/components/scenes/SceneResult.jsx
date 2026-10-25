import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InfoCard from './InfoCard';
import { useLanguage } from '../../context/useLanguage';
import { useProgressStore } from '../../store/useProgressStore';
import { findLessonById } from '../../data/curriculumData';
import { addWord, getWords } from '../../utils/wordBook';

export default function SceneResult({ game, mode, onRetry, onNext, next }) {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { progress } = useProgressStore();
  const [bookWords, setBookWords] = useState(getWords);

  const handlePracticeLesson = () => {
    if (!game?.relatedLessonId) return;
    const currentLevel = progress[game.relatedLessonId] || 1;
    navigate(`/sessions?lessonId=${encodeURIComponent(game.relatedLessonId)}&level=${currentLevel}`);
  };

  const handleNextGame = () => {
    if (onNext) {
      onNext();
    } else if (next?.game?.id) {
      navigate(`/scenes/${next.game.id}`);
    }
  };

  const handleBackToList = () => {
    navigate('/scenes');
  };

  const relatedLesson = game?.relatedLessonId ? findLessonById(game.relatedLessonId) : null;
  const lessonTitle = relatedLesson
    ? (language === 'ja' && relatedLesson.titleJa ? relatedLesson.titleJa : relatedLesson.title)
    : '';

  return (
    <div className="scene-result">
      <h2 className="scene-result-title">{t('scenes.done')}</h2>

      {Array.isArray(game?.infoCards) && game.infoCards.length > 0 && (
        <div className="scene-result-cards">
          {game.infoCards.map((card) => (
            <InfoCard key={card.id} card={card} mode={mode} />
          ))}
        </div>
      )}

      {Array.isArray(game?.vocabulary) && game.vocabulary.length > 0 && (
        <div className="scene-result-vocab">
          <h3 className="scene-result-vocab-title">{t('scenes.vocabulary')}</h3>
          <ul className="scene-result-vocab-list">
            {game.vocabulary.map((entry, idx) => {
              const meaning = language === 'ja' ? entry.translationJa ?? entry.translation : entry.translation;
              const isAdded = bookWords.some(
                (word) => word.id === entry.word.trim().toLowerCase()
              );
              return (
                <li key={idx} className="scene-result-vocab-item">
                  <span className="scene-result-vocab-word">{entry.word}</span>
                  <span className="scene-result-vocab-meaning">{meaning}</span>
                  <button
                    type="button"
                    className="btn-secondary wordbook-add-btn"
                    disabled={isAdded}
                    onClick={() => {
                      addWord({
                        word: entry.word,
                        translation: entry.translation,
                        translationJa: entry.translationJa,
                        source: {
                          type: 'scene',
                          gameId: game.id,
                          title: game.title?.fi
                        }
                      });
                      setBookWords(getWords());
                    }}
                  >
                    {isAdded ? t('wordBook.added') : t('wordBook.addToBook')}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="scene-result-actions">
        {game?.relatedLessonId && (
          <button
            type="button"
            className="btn-primary scene-result-lesson-btn"
            onClick={handlePracticeLesson}
          >
            {lessonTitle
              ? `${t('scenes.practiceLesson')} (${lessonTitle})`
              : t('scenes.practiceLesson')}
          </button>
        )}

        <div className="scene-result-nav-btns">
          <button
            type="button"
            className="choice-btn scene-result-retry-btn"
            onClick={onRetry}
          >
            {t('scenes.retry')}
          </button>

          {next?.game && (
            <button
              type="button"
              className="choice-btn scene-result-next-btn"
              onClick={handleNextGame}
            >
              {`${t('scenes.nextRecommended')} ${next.number}`}
            </button>
          )}

          <button
            type="button"
            className="choice-btn scene-result-list-btn"
            onClick={handleBackToList}
          >
            {t('scenes.toList')}
          </button>
        </div>
      </div>
    </div>
  );
}

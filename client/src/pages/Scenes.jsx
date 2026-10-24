import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { scenes, games, findGameById, getRecommendedGames, getUpcomingGames } from '../data/scenes/index';
import SceneText from '../components/scenes/SceneText';
import SceneTextToggle from '../components/scenes/SceneTextToggle';
import { getSceneTextMode, setSceneTextMode, hasJapanese, resolveMode } from '../utils/sceneText';
import { hasPlayed } from '../utils/sceneProgress';
import { useLanguage } from '../context/useLanguage';

export default function Scenes() {
  const { t } = useLanguage();
  const [mode, setMode] = useState(() => getSceneTextMode());

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setSceneTextMode(nextMode);
  };

  const showJapanese = games.length > 0 && games.every((g) => hasJapanese(g));

  const displayMode = resolveMode(mode, showJapanese);

  const recommendedList = getRecommendedGames();
  const gameNumberMap = new Map(recommendedList.map((item) => [item.game.id, item.number]));

  return (
    <div className="scenes-page">
      <header className="scenes-header">
        <div className="scenes-header-content">
          <h1 className="scenes-title">{t('scenes.title')}</h1>
          <p className="scenes-lead">{t('scenes.lead')}</p>
        </div>
        <div className="scenes-toggle-area">
          <SceneTextToggle
            mode={displayMode}
            onChange={handleModeChange}
            showJapanese={showJapanese}
          />
        </div>
      </header>

      <div className="scenes-list">
        {scenes.map((scene) => {
          const sceneGames = Array.isArray(scene.gameIds)
            ? scene.gameIds.map((id) => findGameById(id)).filter(Boolean)
            : [];

          const upcomingForScene = getUpcomingGames(scene.id);

          return (
            <section key={scene.id} className="scene-section">
              <div className="scene-section-header">
                <span className="scene-section-icon">{scene.icon}</span>
                <h2 className="scene-section-title">
                  <SceneText text={scene.title} mode={displayMode} variant="word" />
                </h2>
                {scene.comingSoon && (
                  <span className="scene-coming-soon-badge">{t('scenes.comingSoon')}</span>
                )}
              </div>

              <div className="scene-cards-grid">
                {sceneGames.map((game) => {
                  const num = gameNumberMap.get(game.id) || 1;
                  const isPlayed = hasPlayed(game.id);

                  return (
                    <Link
                      key={game.id}
                      to={`/scenes/${game.id}`}
                      className="scene-game-card"
                    >
                      <span className="scene-card-number">{num}</span>
                      <span className="scene-card-icon">{game.icon}</span>
                      <div className="scene-card-info">
                        <SceneText
                          text={game.title}
                          mode={displayMode}
                          variant="word"
                          className="scene-card-title"
                        />
                      </div>
                      {isPlayed && (
                        <span
                          className="scene-card-played"
                          aria-label={t('scenes.played')}
                        >
                          ✔
                        </span>
                      )}
                    </Link>
                  );
                })}

                {upcomingForScene.map((ug) => (
                  <div
                    key={ug.id}
                    className="scene-game-card scene-game-card-upcoming"
                  >
                    <span className="scene-card-number">{ug.number}</span>
                    <span className="scene-card-icon">{ug.icon}</span>
                    <div className="scene-card-info">
                      <SceneText
                        text={ug.title}
                        mode={displayMode}
                        variant="word"
                        className="scene-card-title"
                      />
                    </div>
                    <span className="scene-card-upcoming-badge">
                      {t('scenes.comingSoon')}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

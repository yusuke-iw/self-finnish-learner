import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { findGameById, getNextRecommended } from '../data/scenes/index';
import OutfitGame from '../components/scenes/OutfitGame';
import SortGame from '../components/scenes/SortGame';
import ProcedureSim from '../components/scenes/ProcedureSim';
import DialogueScene from '../components/scenes/DialogueScene';
import SceneResult from '../components/scenes/SceneResult';
import SceneText from '../components/scenes/SceneText';
import SceneTextToggle from '../components/scenes/SceneTextToggle';
import {
  getSceneTextMode,
  setSceneTextMode,
  hasJapanese,
  resolveMode
} from '../utils/sceneText';
import { markGamePlayed } from '../utils/sceneProgress';
import { getStudyStats } from '../utils/studyStats';
import { saveProgress } from '../services/api';
import { useLanguage } from '../context/useLanguage';

const GAME_COMPONENTS = {
  outfit: OutfitGame,
  sort: SortGame,
  procedure: ProcedureSim
};

// Keyed by gameId so that moving to the next recommended game (same route, new id)
// starts fresh instead of keeping the previous game's finished state.
export default function SceneGame() {
  const { gameId } = useParams();
  return <SceneGameBody key={gameId} gameId={gameId} />;
}

function SceneGameBody({ gameId }) {
  const { t } = useLanguage();

  const [mode, setMode] = useState(() => getSceneTextMode());
  const [replayKey, setReplayKey] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const game = findGameById(gameId);

  if (!game) {
    return (
      <div className="scene-not-found">
        <h2>{t('scenes.notFound')}</h2>
        <Link to="/scenes" className="btn-primary">
          {t('scenes.backToList')}
        </Link>
      </div>
    );
  }

  const gameHasJa = hasJapanese(game);
  const displayMode = resolveMode(mode, gameHasJa);

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setSceneTextMode(nextMode);
  };

  const handleFinish = () => {
    markGamePlayed(game.id);

    try {
      const p = saveProgress({ studyStats: getStudyStats() });
      if (p && typeof p.catch === 'function') {
        p.catch((err) => {
          console.warn('[INFO] Failed to save scene progress to server:', err?.message);
        });
      }
    } catch (err) {
      console.warn('[INFO] Failed to save scene progress to server:', err?.message);
    }

    setIsFinished(true);
  };

  const handleRetry = () => {
    setReplayKey((k) => k + 1);
    setIsFinished(false);
  };

  const nextRecommended = getNextRecommended(game.id);
  const GameComponent = GAME_COMPONENTS[game.type] || DialogueScene;

  return (
    <div className="scene-game-page">
      <header className="scene-game-header">
        <Link to="/scenes" className="scene-back-btn">
          ← {t('scenes.back')}
        </Link>
        <h2 className="scene-game-title">
          <span className="scene-game-header-icon">{game.icon}</span>
          <SceneText text={game.title} mode={displayMode} variant="word" />
        </h2>
        <div className="scene-game-toggle">
          <SceneTextToggle
            mode={displayMode}
            onChange={handleModeChange}
            showJapanese={gameHasJa}
          />
        </div>
      </header>

      <main className="scene-game-content">
        {!isFinished ? (
          <GameComponent
            key={replayKey}
            game={game}
            mode={displayMode}
            onFinish={handleFinish}
          />
        ) : (
          <SceneResult
            game={game}
            mode={displayMode}
            onRetry={handleRetry}
            next={nextRecommended}
          />
        )}
      </main>
    </div>
  );
}

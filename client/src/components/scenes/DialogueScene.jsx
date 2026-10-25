import React, { useState, useEffect, useRef, useCallback } from 'react';
import SceneText from './SceneText';
import {
  startDialogue,
  getCurrentNode,
  getNodeCount,
  answerDialogue,
  nextDialogueNode,
  getSpokenNotes
} from '../../utils/dialogue';
import { playAudio } from '../../utils/audio';
import { getSpeakerById, DEFAULT_SPEAKER } from '../../utils/speakers';
import {
  playCorrectSound,
  playIncorrectSound,
  playLessonCompleteSound
} from '../../utils/feedbackSounds';
import { recordAnswer } from '../../utils/studyStats';
import { useLanguage } from '../../context/useLanguage';

export default function DialogueScene({ game, mode, onFinish }) {
  const { t } = useLanguage();
  const [state, setState] = useState(() => startDialogue(game));
  const [speechForm, setSpeechForm] = useState('spoken'); // 'spoken' | 'written'
  const [wrongChoiceIds, setWrongChoiceIds] = useState([]);
  const [feedbackChoice, setFeedbackChoice] = useState(null);

  const playedNodeKeysRef = useRef(new Set());

  const currentNode = getCurrentNode(state);
  const totalNodes = getNodeCount(state);

  const character =
    game && Array.isArray(game.characters) && currentNode
      ? game.characters.find((c) => c.id === currentNode.speaker)
      : null;
  const speakerProfile = getSpeakerById(character?.speakerId);

  const handlePlayAudio = useCallback(
    (text, id, speed = 1.0, speaker = DEFAULT_SPEAKER) => {
      try {
        const p = playAudio(text, id, 'fi-FI', speed, speaker);
        if (p && typeof p.catch === 'function') {
          p.catch(() => {});
        }
      } catch {
        // ignore audio errors
      }
    },
    []
  );

  useEffect(() => {
    if (!state) return;
    const node = getCurrentNode(state);
    if (!node) return;

    const nodeKey = `${state.dialogue.id}:${node.id}`;
    if (playedNodeKeysRef.current.has(nodeKey)) {
      return;
    }
    playedNodeKeysRef.current.add(nodeKey);

    const char =
      game && Array.isArray(game.characters)
        ? game.characters.find((c) => c.id === node.speaker)
        : null;
    const speaker = getSpeakerById(char?.speakerId);

    const textToPlay = speechForm === 'spoken' ? node.line.spoken : node.line.fi;
    const audioId = `${game.id}-${state.dialogue.id}-${node.id}-${speechForm}`;
    handlePlayAudio(textToPlay, audioId, 1.0, speaker);
  }, [state, game, speechForm, handlePlayAudio]);

  if (!state || !currentNode) {
    return null;
  }

  const lineText = {
    fi: speechForm === 'spoken' ? currentNode.line.spoken : currentNode.line.fi,
    en: currentNode.line.en,
    ja: currentNode.line.ja
  };

  const handleChoiceClick = (choice) => {
    if (state.resolvedChoiceId) return;

    const result = answerDialogue(state, choice.id);
    if (result.isNewNode) {
      recordAnswer();
    }
    setState(result.state);
    setFeedbackChoice(choice);

    if (result.quality === 'good' || result.quality === 'ok') {
      playCorrectSound();
    } else if (result.quality === 'bad') {
      playIncorrectSound();
      setWrongChoiceIds((prev) => (prev.includes(choice.id) ? prev : [...prev, choice.id]));
    } else if (result.quality === 'repeat') {
      const textToPlay = speechForm === 'spoken' ? currentNode.line.spoken : currentNode.line.fi;
      const audioId = `${game.id}-${state.dialogue.id}-${currentNode.id}-${speechForm}-repeat`;
      handlePlayAudio(textToPlay, audioId, 0.6, speakerProfile);
    }
  };

  const resolvedChoice =
    state.resolvedChoiceId && Array.isArray(currentNode.choices)
      ? currentNode.choices.find((c) => c.id === state.resolvedChoiceId)
      : null;

  const isFinished =
    Boolean(resolvedChoice) &&
    (resolvedChoice.next === null ||
      resolvedChoice.next === undefined ||
      !state.dialogue.nodes.some((n) => n.id === resolvedChoice.next));

  const handleNext = () => {
    if (isFinished) {
      playLessonCompleteSound();
      onFinish();
      return;
    }

    setState((prev) => nextDialogueNode(prev));
    setFeedbackChoice(null);
    setWrongChoiceIds([]);
  };

  const betterChoice =
    feedbackChoice && feedbackChoice.quality === 'ok'
      ? currentNode.choices.find((c) => c.quality === 'good')
      : null;

  const spokenNotes = getSpokenNotes(currentNode, feedbackChoice);

  return (
    <div className="dialogue-scene">
      <div className="dialogue-header">
        <div className="dialogue-speaker">
          {character && (
            <>
              <span className="dialogue-speaker-icon">{character.icon}</span>
              <div className="dialogue-speaker-info">
                <span className="dialogue-speaker-name">{character.name}</span>
                {character.role && (
                  <SceneText
                    text={character.role}
                    mode={mode}
                    variant="word"
                    className="dialogue-speaker-role"
                  />
                )}
              </div>
            </>
          )}
        </div>

        <div className="dialogue-meta">
          <span className="scene-round-counter">
            {state.visited.length} / {totalNodes}
          </span>
          <div
            className="dialogue-speech-toggle"
            role="group"
            aria-label={t('scenes.dialogue.speechLabel')}
          >
            <button
              type="button"
              className={`dialogue-toggle-btn ${speechForm === 'spoken' ? 'active' : ''}`}
              aria-pressed={speechForm === 'spoken'}
              onClick={() => setSpeechForm('spoken')}
            >
              {t('scenes.dialogue.spoken')}
            </button>
            <button
              type="button"
              className={`dialogue-toggle-btn ${speechForm === 'written' ? 'active' : ''}`}
              aria-pressed={speechForm === 'written'}
              onClick={() => setSpeechForm('written')}
            >
              {t('scenes.dialogue.written')}
            </button>
          </div>
        </div>
      </div>

      <div className="dialogue-line-card">
        <div className="dialogue-line">
          <SceneText text={lineText} mode={mode} className="dialogue-line-text" />
          <div className="dialogue-line-audio">
            <button
              type="button"
              className="btn-audio"
              aria-label={t('scenes.listen')}
              onClick={() =>
                handlePlayAudio(
                  lineText.fi,
                  `${game.id}-${state.dialogue.id}-${currentNode.id}-${speechForm}`,
                  1.0,
                  speakerProfile
                )
              }
            >
              🔊
            </button>
            <button
              type="button"
              className="btn-audio"
              aria-label={t('scenes.slowListen')}
              onClick={() =>
                handlePlayAudio(
                  lineText.fi,
                  `${game.id}-${state.dialogue.id}-${currentNode.id}-${speechForm}`,
                  0.6,
                  speakerProfile
                )
              }
            >
              🐢
            </button>
          </div>
        </div>
      </div>

      <div className="dialogue-choices-section">
        <p className="dialogue-choices-prompt">{t('scenes.dialogue.pickReply')}</p>
        <div
          className="dialogue-choices"
          role="group"
          aria-label={t('scenes.dialogue.choicesLabel')}
        >
          {currentNode.choices.map((choice) => {
            const choiceText = {
              fi: speechForm === 'spoken' ? choice.text.spoken : choice.text.fi,
              en: choice.text.en,
              ja: choice.text.ja
            };
            const isResolved = Boolean(state.resolvedChoiceId);
            const isChosenGood = state.resolvedChoiceId === choice.id;
            const isWrong = wrongChoiceIds.includes(choice.id);
            const isDisabled = isResolved || isWrong;

            return (
              <div key={choice.id} className="dialogue-choice-row">
                <button
                  type="button"
                  className={`choice-btn dialogue-choice-btn ${
                    isChosenGood ? 'correct-choice' : ''
                  } ${isWrong ? 'wrong-choice' : ''}`}
                  disabled={isDisabled}
                  onClick={() => handleChoiceClick(choice)}
                >
                  <SceneText text={choiceText} mode={mode} />
                </button>
                <button
                  type="button"
                  className="btn-audio dialogue-choice-audio-btn"
                  aria-label={t('scenes.listen')}
                  onClick={() => {
                    const audioId = `${game.id}-${state.dialogue.id}-${currentNode.id}-${choice.id}-${speechForm}`;
                    handlePlayAudio(choiceText.fi, audioId, 1.0, DEFAULT_SPEAKER);
                  }}
                >
                  🔊
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {feedbackChoice && (
        <div className="dialogue-feedback" role="status">
          <SceneText text={feedbackChoice.feedback} mode={mode} />

          {betterChoice && (
            <div className="dialogue-better">
              <span className="dialogue-better-label">{t('scenes.dialogue.better')}:</span>{' '}
              <SceneText
                text={{
                  fi: speechForm === 'spoken' ? betterChoice.text.spoken : betterChoice.text.fi,
                  en: betterChoice.text.en,
                  ja: betterChoice.text.ja
                }}
                mode={mode}
              />
            </div>
          )}

          {(feedbackChoice.quality === 'good' || feedbackChoice.quality === 'ok') && (
            <div className="spoken-variant">
              <div>
                <span>
                  {speechForm === 'spoken'
                    ? `${t('scenes.dialogue.writtenLabel')} ${feedbackChoice.text.fi}`
                    : `${t('session.spokenLabel')} ${feedbackChoice.text.spoken}`}
                </span>
              </div>
              {spokenNotes && (
                <p className="spoken-notes">
                  {mode === 'ja'
                    ? spokenNotes.ja || spokenNotes.en
                    : spokenNotes.en}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {state.resolvedChoiceId && (
        <div className="scene-game-actions">
          <button
            type="button"
            className="btn-primary scene-next-btn"
            onClick={handleNext}
          >
            {isFinished ? t('scenes.done') : t('scenes.next')}
          </button>
        </div>
      )}
    </div>
  );
}

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/useLanguage';
import { addWord, getWords, removeWord } from '../utils/wordBook';
import { getDueKeys, getReviewSchedule, recordReviewResult } from '../utils/reviewSchedule';
import { recordAnswer } from '../utils/studyStats';
import { playAudio } from '../utils/audio';
import { saveProgress } from '../services/api';

function meaning(word, language) {
  return language === 'ja' ? word.translationJa || word.translation : word.translation || word.translationJa;
}

async function listen(word) {
  try {
    await playAudio(word);
  } catch {
    // Autoplay may be denied; the listen button allows a manual retry.
  }
}

function dueWords(words) {
  const dueIds = new Set(getDueKeys('word'));
  return words.filter(word => dueIds.has(word.id));
}

function shuffled(words) {
  const cards = [...words];
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

function Source({ word }) {
  const { t } = useLanguage();
  const isTitledSource = word.source.type === 'passage' || word.source.type === 'scene';
  return <span className="wordbook-source">{isTitledSource ? word.source.title : t('wordBook.manualSource')}</span>;
}

function Flashcards({ cards, isReview, onBack }) {
  const { language, t } = useLanguage();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [remembered, setRemembered] = useState(0);
  const lastPlayed = useRef(null);
  const answered = useRef(false);
  const word = cards[index];

  useEffect(() => {
    answered.current = false;
    if (word && lastPlayed.current !== word.id) {
      lastPlayed.current = word.id;
      void listen(word.word);
    }
  }, [word]);

  const answer = useCallback((isCorrect) => {
    if (!word || !flipped || answered.current) return;
    answered.current = true;
    if (isReview) recordReviewResult(`word:${word.id}`, isCorrect);
    const studyStats = recordAnswer();
    try {
      const pending = saveProgress({
        studyStats,
        ...(isReview && { reviewSchedule: getReviewSchedule() })
      });
      pending?.catch((err) => console.warn('Failed to save word practice:', err?.message));
    } catch (err) {
      console.warn('Failed to save word practice:', err?.message);
    }
    if (isCorrect) setRemembered(count => count + 1);
    setFlipped(false);
    setIndex(current => current + 1);
  }, [word, flipped, isReview]);

  useEffect(() => {
    const handleKey = (event) => {
      if (!word || event.isComposing || event.keyCode === 229 || event.repeat) return;
      if (event.target instanceof HTMLElement &&
          (event.target.matches('input, textarea, select') || event.target.isContentEditable)) return;
      if (event.key === ' ') {
        event.preventDefault();
        setFlipped(true);
      } else if (flipped && ['ArrowRight', '1', 'ArrowLeft', '2'].includes(event.key)) {
        event.preventDefault();
        answer(event.key === 'ArrowRight' || event.key === '1');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [word, flipped, answer]);

  if (!word) {
    return (
      <div className="wordbook-page wordbook-summary">
        <h2>{t('wordBook.result', { count: remembered, total: cards.length })}</h2>
        <button type="button" className="btn-primary" onClick={onBack}>{t('wordBook.back')}</button>
      </div>
    );
  }

  return (
    <div className="wordbook-page">
      <h2>{t('wordBook.title')}</h2>
      <p>{t('wordBook.cardProgress', { count: index + 1, total: cards.length })}</p>
      <div className="wordbook-flashcard">
        <div className="wordbook-card-heading">
          <h3 lang="fi">{word.word}</h3>
          <button type="button" className="btn-audio" aria-label={t('common.listen')} onClick={() => void listen(word.word)}>🔊</button>
        </div>
        {flipped ? (
          <>
            <p className="wordbook-meaning">{meaning(word, language)}</p>
            {word.note && <p className="wordbook-note">{word.note}</p>}
            <Source word={word} />
            <div className="wordbook-actions">
              <button type="button" className="btn-primary" onClick={() => answer(true)}>{t('wordBook.remembered')}</button>
              <button type="button" className="btn-secondary" onClick={() => answer(false)}>{t('wordBook.again')}</button>
            </div>
            <p className="wordbook-hint">{t('wordBook.answerHint')}</p>
          </>
        ) : (
          <>
            <button type="button" className="btn-primary" onClick={() => setFlipped(true)}>{t('wordBook.showAnswer')}</button>
            <p className="wordbook-hint">{t('wordBook.flipHint')}</p>
          </>
        )}
      </div>
      <button type="button" className="btn-secondary" onClick={onBack}>{t('wordBook.back')}</button>
    </div>
  );
}

export default function WordBook() {
  const { language, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [words, setWords] = useState(getWords);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ word: '', translationJa: '', translation: '', note: '' });
  const [session, setSession] = useState(() => {
    const cards = searchParams.get('review') === '1' ? dueWords(getWords()) : [];
    return cards.length ? { cards, isReview: true } : null;
  });

  if (session) {
    return <Flashcards {...session} onBack={() => { setSession(null); setWords(getWords()); }} />;
  }

  const due = dueWords(words);
  const query = search.trim().toLowerCase();
  const visibleWords = words.filter(word => [word.word, word.translation, word.translationJa]
    .some(text => text.toLowerCase().includes(query)));
  const handleAdd = (event) => {
    event.preventDefault();
    if (!form.word.trim() || !form.translationJa.trim()) return;
    addWord({ ...form, source: { type: 'manual' } });
    setWords(getWords());
    setForm({ word: '', translationJa: '', translation: '', note: '' });
  };

  return (
    <div className="wordbook-page">
      <h2>{t('wordBook.title')}</h2>
      <div className="wordbook-actions">
        <button type="button" className="btn-primary" disabled={!due.length} onClick={() => setSession({ cards: due, isReview: true })}>
          {t('wordBook.reviewToday', { count: due.length })}
        </button>
        <button type="button" className="btn-secondary" disabled={!words.length} onClick={() => setSession({ cards: shuffled(words), isReview: false })}>
          {t('wordBook.practiceAll')}
        </button>
      </div>
      <label className="wordbook-search">
        {t('wordBook.search')}
        <input type="search" value={search} onChange={event => setSearch(event.target.value)} />
      </label>
      <p role="status">{t('wordBook.count', { count: visibleWords.length })}</p>
      {!words.length && <p className="wordbook-empty">{t('wordBook.empty')}</p>}
      {words.length > 0 && !visibleWords.length && <p>{t('wordBook.noMatches')}</p>}
      <ul className="wordbook-list">
        {visibleWords.map(word => (
          <li key={word.id} className="wordbook-item">
            <div className="wordbook-item-text">
              <strong lang="fi">{word.word}</strong>
              <span>{meaning(word, language)}</span>
              <Source word={word} />
            </div>
            <div className="wordbook-actions">
              <button type="button" className="btn-audio" aria-label={`${t('common.listen')}: ${word.word}`} onClick={() => void listen(word.word)}>🔊</button>
              <button type="button" className="btn-secondary" aria-label={`${t('wordBook.delete')}: ${word.word}`} onClick={() => setWords(removeWord(word.id))}>{t('wordBook.delete')}</button>
            </div>
          </li>
        ))}
      </ul>
      <form className="wordbook-form" onSubmit={handleAdd}>
        <h3>{t('wordBook.manualAdd')}</h3>
        {['word', 'translationJa', 'translation', 'note'].map(field => (
          <label key={field}>
            {t(`wordBook.${field}`)}
            <input value={form[field]} required={field === 'word' || field === 'translationJa'} onChange={event => setForm({ ...form, [field]: event.target.value })} />
          </label>
        ))}
        <button type="submit" className="btn-primary">{t('wordBook.add')}</button>
      </form>
    </div>
  );
}

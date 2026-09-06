import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LanguageProvider, useLanguage } from '../LanguageContext';

function TestConsumer() {
  const { language, setLanguage, t, getTranslation } = useLanguage();
  return (
    <div>
      <span data-testid="current-lang">{language}</span>
      <span data-testid="translated-home">{t('nav.home')}</span>
      <span data-testid="custom-translation">
        {getTranslation({ ja: 'こんにちは', en: 'Hello' })}
      </span>
      <button onClick={() => setLanguage('en')}>Switch to English</button>
      <button onClick={() => setLanguage('ja')}>Switch to Japanese</button>
    </div>
  );
}

describe('LanguageContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides default language as Japanese (ja) when no localStorage is set', () => {
    render(
      <LanguageProvider defaultLanguage="ja">
        <TestConsumer />
      </LanguageProvider>
    );

    expect(screen.getByTestId('current-lang').textContent).toBe('ja');
    expect(screen.getByTestId('translated-home').textContent).toBe('ホーム');
    expect(screen.getByTestId('custom-translation').textContent).toBe('こんにちは');
  });

  it('allows changing language and persists to localStorage', () => {
    render(
      <LanguageProvider defaultLanguage="ja">
        <TestConsumer />
      </LanguageProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Switch to English'));
    });

    expect(screen.getByTestId('current-lang').textContent).toBe('en');
    expect(screen.getByTestId('translated-home').textContent).toBe('Home');
    expect(screen.getByTestId('custom-translation').textContent).toBe('Hello');
    expect(localStorage.getItem('finnishLearner_language')).toBe('en');

    act(() => {
      fireEvent.click(screen.getByText('Switch to Japanese'));
    });

    expect(screen.getByTestId('current-lang').textContent).toBe('ja');
    expect(screen.getByTestId('translated-home').textContent).toBe('ホーム');
    expect(localStorage.getItem('finnishLearner_language')).toBe('ja');
  });

  it('restores language from localStorage on initial render', () => {
    localStorage.setItem('finnishLearner_language', 'en');

    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );

    expect(screen.getByTestId('current-lang').textContent).toBe('en');
    expect(screen.getByTestId('translated-home').textContent).toBe('Home');
  });

  it('falls back to key if translation is missing', () => {
    function MissingConsumer() {
      const { t } = useLanguage();
      return <span data-testid="missing">{t('non.existent.key')}</span>;
    }

    render(
      <LanguageProvider>
        <MissingConsumer />
      </LanguageProvider>
    );

    expect(screen.getByTestId('missing').textContent).toBe('non.existent.key');
  });
});

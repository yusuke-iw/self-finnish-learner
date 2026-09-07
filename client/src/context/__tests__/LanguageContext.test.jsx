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

  it('interpolates parameters correctly with {key} syntax', () => {
    function ParamConsumer() {
      const { t } = useLanguage();
      return (
        <div>
          <span data-testid="interpolated">
            {t('session.questionOf', { current: 3, total: 10 })}
          </span>
        </div>
      );
    }

    render(
      <LanguageProvider defaultLanguage="en">
        <ParamConsumer />
      </LanguageProvider>
    );

    expect(screen.getByTestId('interpolated').textContent).toBe('Question 3 of 10');
  });

  it('handles getTranslation edge cases: null, string, preferredField, and various property names', () => {
    function TranslationConsumer() {
      const { getTranslation, setLanguage } = useLanguage();
      return (
        <div>
          <span data-testid="null-trans">{getTranslation(null)}</span>
          <span data-testid="str-trans">{getTranslation('Just a string')}</span>
          <span data-testid="pref-trans">{getTranslation({ myField: 'Custom', ja: 'Ja' }, 'myField')}</span>
          <span data-testid="text-ja">{getTranslation({ textJa: 'テキストJA', textEn: 'TextEN' })}</span>
          <span data-testid="explanation-ja">{getTranslation({ explanationJa: '解説JA' })}</span>
          <span data-testid="fallback-text">{getTranslation({ text: 'Common Text' })}</span>
          <button onClick={() => setLanguage('en')}>To EN</button>
        </div>
      );
    }

    const { rerender } = render(
      <LanguageProvider defaultLanguage="ja">
        <TranslationConsumer />
      </LanguageProvider>
    );

    expect(screen.getByTestId('null-trans').textContent).toBe('');
    expect(screen.getByTestId('str-trans').textContent).toBe('Just a string');
    expect(screen.getByTestId('pref-trans').textContent).toBe('Custom');
    expect(screen.getByTestId('text-ja').textContent).toBe('テキストJA');
    expect(screen.getByTestId('explanation-ja').textContent).toBe('解説JA');
    expect(screen.getByTestId('fallback-text').textContent).toBe('Common Text');

    // Switch to English and test en property resolution
    fireEvent.click(screen.getByText('To EN'));
    expect(screen.getByTestId('text-ja').textContent).toBe('TextEN');
  });

  it('handles localStorage errors gracefully on load and save', () => {
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage disabled');
    });
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded');
    });
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    function ErrorConsumer() {
      const { language, setLanguage } = useLanguage();
      return (
        <div>
          <span data-testid="lang">{language}</span>
          <button onClick={() => setLanguage('en')}>Set EN</button>
          <button onClick={() => setLanguage('invalid_lang')}>Set Invalid</button>
        </div>
      );
    }

    render(
      <LanguageProvider>
        <ErrorConsumer />
      </LanguageProvider>
    );

    // Initial render should not throw
    expect(screen.getByTestId('lang')).toBeInTheDocument();

    // Setting language with storage error should catch and log
    fireEvent.click(screen.getByText('Set EN'));
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(screen.getByTestId('lang').textContent).toBe('en');

    // Setting invalid language should be a no-op
    fireEvent.click(screen.getByText('Set Invalid'));
    expect(screen.getByTestId('lang').textContent).toBe('en');

    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('detects navigator.language correctly when no stored preference exists', () => {
    const originalNavigator = window.navigator;

    // Test Japanese navigator language
    Object.defineProperty(window, 'navigator', {
      value: { language: 'ja-JP' },
      configurable: true
    });

    function NavConsumer() {
      const { language } = useLanguage();
      return <span data-testid="nav-lang">{language}</span>;
    }

    const { unmount } = render(
      <LanguageProvider>
        <NavConsumer />
      </LanguageProvider>
    );
    expect(screen.getByTestId('nav-lang').textContent).toBe('ja');
    unmount();

    // Test English/other navigator language
    Object.defineProperty(window, 'navigator', {
      value: { language: 'fr-FR' },
      configurable: true
    });

    render(
      <LanguageProvider>
        <NavConsumer />
      </LanguageProvider>
    );
    expect(screen.getByTestId('nav-lang').textContent).toBe('en');

    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      configurable: true
    });
  });

  it('provides safe fallback implementation when useLanguage is called without LanguageProvider', () => {
    function StandaloneConsumer() {
      const { language, setLanguage, t, getTranslation } = useLanguage();
      return (
        <div>
          <span data-testid="standalone-lang">{language}</span>
          <span data-testid="standalone-t">{t('nav.home')}</span>
          <span data-testid="standalone-get-null">{getTranslation(null)}</span>
          <span data-testid="standalone-get-str">{getTranslation('Hello')}</span>
          <span data-testid="standalone-get-obj">{getTranslation({ en: 'Cat', ja: '猫' })}</span>
          <button onClick={() => setLanguage('ja')}>No-op Button</button>
        </div>
      );
    }

    render(<StandaloneConsumer />);

    expect(screen.getByTestId('standalone-lang')).toBeInTheDocument();
    expect(screen.getByTestId('standalone-t')).toBeInTheDocument();
    expect(screen.getByTestId('standalone-get-null').textContent).toBe('');
    expect(screen.getByTestId('standalone-get-str').textContent).toBe('Hello');
    expect(screen.getByTestId('standalone-get-obj')).toBeInTheDocument();

    // Calling setLanguage outside provider should not throw
    expect(() => fireEvent.click(screen.getByText('No-op Button'))).not.toThrow();
  });

  it('handles standalone useLanguage when navigator is ja', () => {
    const origNav = window.navigator;
    Object.defineProperty(window, 'navigator', {
      value: { language: 'ja' },
      configurable: true
    });

    function StandaloneJaConsumer() {
      const { language, getTranslation } = useLanguage();
      return (
        <div>
          <span data-testid="ja-lang">{language}</span>
          <span data-testid="ja-obj">{getTranslation({ japanese: '猫' })}</span>
        </div>
      );
    }

    render(<StandaloneJaConsumer />);
    expect(screen.getByTestId('ja-lang').textContent).toBe('ja');
    expect(screen.getByTestId('ja-obj').textContent).toBe('猫');

    Object.defineProperty(window, 'navigator', {
      value: origNav,
      configurable: true
    });
  });
});


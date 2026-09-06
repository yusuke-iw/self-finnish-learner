import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import LanguageToggle from '../LanguageToggle';
import { LanguageProvider } from '../../context/LanguageContext';

describe('LanguageToggle Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders language toggle buttons', () => {
    render(
      <LanguageProvider defaultLanguage="ja">
        <LanguageToggle />
      </LanguageProvider>
    );

    const jaBtn = screen.getByRole('button', { name: /日本語/i });
    const enBtn = screen.getByRole('button', { name: /English/i });

    expect(jaBtn).toBeInTheDocument();
    expect(enBtn).toBeInTheDocument();
    expect(jaBtn).toHaveClass('active');
    expect(enBtn).not.toHaveClass('active');
  });

  it('switches active language when clicked', () => {
    render(
      <LanguageProvider defaultLanguage="ja">
        <LanguageToggle />
      </LanguageProvider>
    );

    const enBtn = screen.getByRole('button', { name: /English/i });
    fireEvent.click(enBtn);

    expect(enBtn).toHaveClass('active');
    expect(localStorage.getItem('finnishLearner_language')).toBe('en');
  });
});

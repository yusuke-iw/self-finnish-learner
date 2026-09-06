import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('App Component', () => {
  it('renders without crashing and displays the navbar', () => {
    render(<App />);
    expect(screen.getByText('Finnish Learner')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Passages')).toBeInTheDocument();
  });

  it('renders drill studio when navigating to /grammar/practice', () => {
    window.history.pushState({}, 'Test page', '/grammar/practice');
    render(<App />);
    expect(screen.getByText(/🎯 (文法演習スタジオ|Grammar Drill Studio)/i)).toBeInTheDocument();
  });

  it('switches UI language when language toggle in navbar is clicked', () => {
    render(<App />);
    const jaBtn = screen.getByRole('button', { name: /日本語/i });
    fireEvent.click(jaBtn);
    expect(screen.getByText('ホーム')).toBeInTheDocument();
    expect(screen.getByText('演習スタジオ')).toBeInTheDocument();

    const enBtn = screen.getByRole('button', { name: /English/i });
    fireEvent.click(enBtn);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Drill Studio')).toBeInTheDocument();
  });
});


import React from 'react';
import { render, screen } from '@testing-library/react';
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
    expect(screen.getByText(/🎯 文法演習スタジオ（Drill Studio）/i)).toBeInTheDocument();
  });
});


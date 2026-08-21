import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Home from '../Home';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../../api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn()
  }
}));

describe('Home Component', () => {
  it('renders the vertical path syllabus', async () => {
    // Mock user progress
    const mockState = {
      progress: {
        completedModules: ['m1']
      }
    };
    
    // Quick mock for zustand store? Actually Home doesn't use Zustand directly in the component, it gets it from props or hooks if it existed.
    // Wait, let's see how Home gets user data. It doesn't, it uses static syllabus in Home.jsx and no global state!
    
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    expect(screen.getByText(/Finnish Learner/)).toBeInTheDocument();
    expect(screen.getByText(/Unit 1/)).toBeInTheDocument();
    
    // Verify modules are rendered
    const modules = screen.getAllByText(/Module/i);
    expect(modules.length).toBeGreaterThan(0);
  });
});

import React, { useRef, useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SpecialCharBar from '../SpecialCharBar';
import { LanguageProvider } from '../../context/LanguageContext';

function TestHarness({ initialValue = '', disabled = false, lang = 'en' }) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef(null);

  return (
    <LanguageProvider defaultLanguage={lang}>
      <div>
        <input
          ref={inputRef}
          data-testid="target-input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <SpecialCharBar
          inputRef={inputRef}
          value={value}
          onChange={setValue}
          disabled={disabled}
        />
      </div>
    </LanguageProvider>
  );
}

describe('SpecialCharBar', () => {
  it('renders ä and ö buttons with localized aria-labels', () => {
    const { unmount } = render(<TestHarness lang="en" />);
    expect(screen.getByRole('button', { name: 'Insert ä' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Insert ö' })).toBeInTheDocument();
    unmount();

    render(<TestHarness lang="ja" />);
    expect(screen.getByRole('button', { name: 'ä を入力' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ö を入力' })).toBeInTheDocument();
  });

  it('inserts ä and ö at cursor position and restores focus with cursor after inserted char', () => {
    render(<TestHarness initialValue="Mina" />);
    const input = screen.getByTestId('target-input');
    input.focus();
    input.setSelectionRange(3, 4); // replace 'a' in 'Mina'

    const aBtn = screen.getByRole('button', { name: 'Insert ä' });
    fireEvent.click(aBtn);

    expect(input.value).toBe('Minä');
    expect(document.activeElement).toBe(input);
    expect(input.selectionStart).toBe(4);
    expect(input.selectionEnd).toBe(4);

    // Insert in the middle without selection
    input.setSelectionRange(2, 2);
    const oBtn = screen.getByRole('button', { name: 'Insert ö' });
    fireEvent.click(oBtn);

    expect(input.value).toBe('Miönä');
    expect(input.selectionStart).toBe(3);
    expect(input.selectionEnd).toBe(3);
  });

  it('inserts uppercase Ä and Ö when Shift key is held on click', () => {
    render(<TestHarness initialValue="" />);
    const input = screen.getByTestId('target-input');
    const aBtn = screen.getByRole('button', { name: 'Insert ä' });
    const oBtn = screen.getByRole('button', { name: 'Insert ö' });

    fireEvent.click(aBtn, { shiftKey: true });
    expect(input.value).toBe('Ä');

    fireEvent.click(oBtn, { shiftKey: true });
    expect(input.value).toBe('ÄÖ');
  });

  it('prevents default on mouseDown so input does not lose focus', () => {
    render(<TestHarness initialValue="test" />);
    const aBtn = screen.getByRole('button', { name: 'Insert ä' });
    const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    const preventDefaultSpy = vi.spyOn(mouseDownEvent, 'preventDefault');

    aBtn.dispatchEvent(mouseDownEvent);
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('disables buttons when disabled prop is true', () => {
    render(<TestHarness initialValue="hei" disabled={true} />);
    const aBtn = screen.getByRole('button', { name: 'Insert ä' });
    const oBtn = screen.getByRole('button', { name: 'Insert ö' });

    expect(aBtn).toBeDisabled();
    expect(oBtn).toBeDisabled();
  });
});

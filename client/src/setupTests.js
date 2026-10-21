import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Lazy-loaded pages can take over 1s to import when many test files run in parallel.
configure({ asyncUtilTimeout: 5000 });

// Mock browser APIs that might be missing in JSDOM
if (typeof window.SpeechRecognition === 'undefined') {
  window.SpeechRecognition = class {
    constructor() {}
    start() {}
    stop() {}
  };
}
if (typeof window.webkitSpeechRecognition === 'undefined') {
  window.webkitSpeechRecognition = window.SpeechRecognition;
}

// Mock Audio
window.HTMLMediaElement.prototype.play = () => { /* do nothing */ };

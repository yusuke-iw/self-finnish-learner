import '@testing-library/jest-dom';

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

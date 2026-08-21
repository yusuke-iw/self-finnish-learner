/**
 * Plays the given text using the browser's native SpeechSynthesis API.
 * Uses a basic hash function on the `seedString` to dynamically alter
 * the pitch slightly, giving each sentence/article its own "identity".
 * 
 * @param {string} text - The text to speak.
 * @param {string} seedString - A unique identifier (e.g., ID or title) to seed the pitch.
 * @param {string} lang - The language code (default 'fi-FI').
 */
export const playAudio = (text, seedString = '', lang = 'fi-FI') => {
  if (!('speechSynthesis' in window)) {
    console.warn("Speech Synthesis API not supported in this browser.");
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;

  // Simple string hash function to generate a pseudo-random but deterministic number
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = seedString.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert hash to a 0-1 range
  const randomScale = Math.abs(Math.sin(hash));

  // Base pitch is 1. We vary it from 0.8 to 1.3 to create different identities.
  const pitch = 0.8 + (randomScale * 0.5);
  utterance.pitch = pitch;

  // We can also slightly vary the rate (speed). Default is 1. Range: 0.9 to 1.1
  const rate = 0.9 + (randomScale * 0.2);
  utterance.rate = rate;

  // Try to find a specific native voice for the language if available
  const voices = window.speechSynthesis.getVoices();
  const targetVoice = voices.find(voice => voice.lang.includes(lang.split('-')[0]));
  if (targetVoice) {
    utterance.voice = targetVoice;
  }

  window.speechSynthesis.speak(utterance);
};

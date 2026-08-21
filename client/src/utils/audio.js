// Cache to store the base64 audio strings so we don't repeatedly fetch the same text
const audioCache = new Map();

/**
 * Plays the given text by fetching MP3 audio from the backend Google Cloud TTS proxy.
 * 
 * @param {string} text - The text to speak.
 * @param {string} seedString - (Ignored in GCP TTS, kept for API compatibility)
 * @param {string} lang - The language code (default 'fi-FI').
 * @param {number} speed - The speaking rate (e.g., 1.0 for normal, 0.6 for slow)
 */
export const playAudio = async (text, seedString = '', lang = 'fi-FI', speed = 1.0) => {
  if (!text) return;

  const cacheKey = `${text}_${speed}`;

  // Use the cached audio if we've already fetched it
  if (audioCache.has(cacheKey)) {
    playBase64Audio(audioCache.get(cacheKey));
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, speed })
    });

    const data = await response.json();

    if (data.success && data.audioContent) {
      // Store in cache
      audioCache.set(cacheKey, data.audioContent);
      // Play it
      playBase64Audio(data.audioContent);
    } else {
      console.error('Failed to fetch TTS audio:', data.error);
      alert(`TTS Error: ${data.error}. Please check your GOOGLE_TTS_API_KEY.`);
    }
  } catch (error) {
    console.error('Network error fetching TTS:', error);
  }
};

/**
 * Helper to play a base64 encoded MP3 string
 * @param {string} base64Audio 
 */
function playBase64Audio(base64Audio) {
  const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
  audio.play().catch(e => console.error("Error playing audio:", e));
}

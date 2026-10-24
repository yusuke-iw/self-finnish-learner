// Cache to store the base64 audio strings so we don't repeatedly fetch the same text
const audioCache = new Map();

/**
 * Plays the given text by fetching MP3 audio from the backend Google Cloud TTS proxy.
 * 
 * @param {string} text - The text to speak.
 * @param {string} seedString - (Ignored in GCP TTS, kept for API compatibility)
 * @param {string} lang - The language code (default 'fi-FI').
 * @param {number} speed - The speaking rate (e.g., 1.0 for normal, 0.6 for slow)
 * @param {object} speaker - Optional speaker profile { id, pitch, voiceName }
 */
export const playAudio = async (text, seedString = '', lang = 'fi-FI', speed = 1.0, speaker = null) => {
  if (!text) return;

  const speakerId = speaker?.id || 'default';
  const cacheKey = `${text}_${speed}_${speakerId}`;

  // Use the cached audio if we've already fetched it
  if (audioCache.has(cacheKey)) {
    playBase64Audio(audioCache.get(cacheKey));
    return;
  }

  try {
    const payload = { text, speed };
    if (speaker) {
      if (speaker.pitch !== undefined) payload.pitch = speaker.pitch;
      if (speaker.voiceName) payload.voiceName = speaker.voiceName;
    }

    // Relative URL so requests go through the Vite proxy (works from other devices on the LAN)
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.success && data.audioContent) {
      // Store in cache
      audioCache.set(cacheKey, data.audioContent);
      // Play it
      playBase64Audio(data.audioContent);
    } else {
      // Log only: an alert() here would repeat on every auto-played line when the API key is missing
      console.error('Failed to fetch TTS audio:', data.error);
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

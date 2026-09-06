/**
 * Finnish Voice Profiles (Speakers)
 *
 * Provides multiple distinct speaker personas by combining Google TTS voice models
 * with custom pitch, speed, and avatar/gender metadata.
 */

export const SPEAKERS = [
  {
    id: 'aino',
    name: 'Aino',
    gender: 'female',
    icon: '👩',
    description: 'Selkeä ja luonnollinen standardiääni (Standard natural voice)',
    pitch: 0.0,
    speed: 1.0,
    voiceName: 'fi-FI-Wavenet-A'
  },
  {
    id: 'matti',
    name: 'Matti',
    gender: 'male',
    icon: '👨',
    description: 'Syvä ja rauhallinen miehen ääni (Deep, calm male voice)',
    pitch: -5.0,
    speed: 0.95,
    voiceName: 'fi-FI-Wavenet-A'
  },
  {
    id: 'eevi',
    name: 'Eevi',
    gender: 'female',
    icon: '👧',
    description: 'Pirteä ja nuorekas naisen ääni (Bright, youthful female voice)',
    pitch: 2.8,
    speed: 1.05,
    voiceName: 'fi-FI-Wavenet-A'
  },
  {
    id: 'juho',
    name: 'Juho',
    gender: 'male',
    icon: '🧑',
    description: 'Energinen ja reipas nuoren miehen ääni (Brisk, energetic young male voice)',
    pitch: -3.5,
    speed: 1.15,
    voiceName: 'fi-FI-Wavenet-A'
  },
  {
    id: 'helmi',
    name: 'Helmi',
    gender: 'female',
    icon: '👩‍🏫',
    description: 'Rauhallinen ja huolellisesti artikuloiva opettajan ääni (Articulate instructor voice)',
    pitch: 1.0,
    speed: 0.85,
    voiceName: 'fi-FI-Standard-A'
  }
];

export const DEFAULT_SPEAKER = SPEAKERS[0];

/**
 * Returns a random speaker from the list of available speakers.
 * @returns {object} Speaker profile
 */
export const getRandomSpeaker = () => {
  const index = Math.floor(Math.random() * SPEAKERS.length);
  return SPEAKERS[index];
};

/**
 * Gets a speaker profile by its ID, falling back to DEFAULT_SPEAKER if not found.
 * @param {string} id - Speaker ID
 * @returns {object} Speaker profile
 */
export const getSpeakerById = (id) => {
  if (!id) return DEFAULT_SPEAKER;
  const found = SPEAKERS.find(s => s.id === id);
  return found || DEFAULT_SPEAKER;
};

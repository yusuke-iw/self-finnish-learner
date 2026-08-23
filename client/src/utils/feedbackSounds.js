export const getAudioContext = () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  return new AudioContext();
};

export const playCorrectSound = () => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.type = 'sine';
    
    // Duolingo style "ding-ding" (C5 to E5)
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); 
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); 

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch(e) {
    console.error("Audio API not supported", e);
  }
};

export const playIncorrectSound = () => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Sawtooth for a slightly harsher "buzzer" feel
    osc.type = 'sawtooth';
    
    // Low double-buzzer
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.setValueAtTime(130, ctx.currentTime + 0.15);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.02);
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime + 0.15);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch(e) {
    console.error("Audio API not supported", e);
  }
};

export const playLessonCompleteSound = () => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Square wave for a slightly more retro/gamey fanfare
    osc.type = 'square';
    
    // Fanfare: C4, E4, G4, C5
    osc.frequency.setValueAtTime(261.63, ctx.currentTime); 
    osc.frequency.setValueAtTime(329.63, ctx.currentTime + 0.15); 
    osc.frequency.setValueAtTime(392.00, ctx.currentTime + 0.3); 
    osc.frequency.setValueAtTime(523.25, ctx.currentTime + 0.45); 

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.02);
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime + 0.6);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.0);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.0);
  } catch(e) {
    console.error("Audio API not supported", e);
  }
};

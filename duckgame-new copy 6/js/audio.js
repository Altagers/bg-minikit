// Audio module
let audioCtx;
try {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
} catch (e) {
  console.warn('AudioContext not supported:', e);
}

function playSound(frequency, type = 'sine', duration = 0.1) {
  if (!audioCtx) return;
  try {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.warn('Failed to play sound:', e);
  }
}

function playEpicSound() {
  playSound(1200, 'triangle', 0.3);
  setTimeout(() => playSound(1400, 'triangle', 0.3), 100);
}

function playDeathSound() {
  playSound(200, 'sine', 0.5);
}
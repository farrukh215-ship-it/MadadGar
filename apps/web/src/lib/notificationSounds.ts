export const NOTIFICATION_SOUNDS = [
  { id: 'default', label: 'Default', desc: 'Standard tone' },
  { id: 'chime', label: 'Chime', desc: 'Soft chime' },
  { id: 'bell', label: 'Bell', desc: 'Classic bell' },
  { id: 'pop', label: 'Pop', desc: 'Short pop' },
  { id: 'ding', label: 'Ding', desc: 'Clear ding' },
] as const;

export type NotificationSoundId = (typeof NOTIFICATION_SOUNDS)[number]['id'];

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
  if (typeof window === 'undefined') return;
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = frequency;
    osc.type = type;
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

export function playNotificationSound(soundId: string) {
  switch (soundId) {
    case 'chime':
      playTone(523.25, 0.15);
      setTimeout(() => playTone(659.25, 0.2), 100);
      break;
    case 'bell':
      playTone(783.99, 0.25, 'triangle');
      break;
    case 'pop':
      playTone(800, 0.08, 'square');
      break;
    case 'ding':
      playTone(880, 0.2, 'sine');
      setTimeout(() => playTone(1108.73, 0.15), 80);
      break;
    default:
      playTone(440, 0.15);
      playTone(554.37, 0.12);
  }
}

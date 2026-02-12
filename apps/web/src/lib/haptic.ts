/**
 * Haptic feedback (vibration) for mobile - professional app feel
 * Uses navigator.vibrate when available. Safe no-op on unsupported devices.
 */

const VIBRATION = {
  /** Light tap feedback (buttons, toggles) */
  light: [10],
  /** Medium feedback (like, save, selection) */
  medium: [15, 10, 15],
  /** Success feedback (action completed) */
  success: [20, 30, 20],
  /** Error/warning feedback */
  error: [50, 50, 50],
} as const;

function vibrate(pattern: number | readonly number[]): boolean {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return false;
  try {
    const p = typeof pattern === 'number' ? pattern : [...pattern];
    return navigator.vibrate(p);
  } catch {
    return false;
  }
}

export function hapticLight(): boolean {
  return vibrate(VIBRATION.light);
}

export function hapticMedium(): boolean {
  return vibrate(VIBRATION.medium);
}

export function hapticSuccess(): boolean {
  return vibrate(VIBRATION.success);
}

export function hapticError(): boolean {
  return vibrate(VIBRATION.error);
}

/**
 * The end-of-timer sound, synthesised rather than downloaded. An audio file
 * would be one more thing to fetch, cache and get blocked by autoplay policy;
 * three oscillator beeps triggered from a user-initiated timer are neither.
 */
export function playChime(enabled = true): void {
  if (!enabled || typeof window === "undefined") return;

  const AudioContextClass =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;

  try {
    const context = new AudioContextClass();
    const now = context.currentTime;

    // A rising three-note figure — attention-getting without being an alarm.
    [
      { at: 0, frequency: 660 },
      { at: 0.18, frequency: 880 },
      { at: 0.36, frequency: 1174 },
    ].forEach(({ at, frequency }) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = frequency;

      // Shaped envelope, because a raw square-edged tone clicks.
      gain.gain.setValueAtTime(0, now + at);
      gain.gain.linearRampToValueAtTime(0.22, now + at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + at + 0.34);

      oscillator.connect(gain).connect(context.destination);
      oscillator.start(now + at);
      oscillator.stop(now + at + 0.36);
    });

    setTimeout(() => void context.close().catch(() => {}), 1200);
  } catch {
    // Audio blocked or unavailable. The vibration and the visible "TIME!" carry it.
  }
}

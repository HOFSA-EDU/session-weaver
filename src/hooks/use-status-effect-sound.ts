import { useEffect, useRef } from "react";

export function useStatusEffectSound(statusEffects: string[]) {
  const prevEffects = useRef<string[]>(statusEffects);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const prev = prevEffects.current;
    const added = statusEffects.filter(e => !prev.includes(e));
    prevEffects.current = statusEffects;

    if (added.length > 0) {
      playEffectSound();
    }
  }, [statusEffects]);

  function playEffectSound() {
    try {
      const ctx = audioCtxRef.current || new AudioContext();
      audioCtxRef.current = ctx;
      const now = ctx.currentTime;

      // Dark two-note warning: D4 → Bb3
      const notes = [293.66, 233.08];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now + i * 0.12);
        gain.gain.linearRampToValueAtTime(0.15, now + i * 0.12 + 0.04);
        gain.gain.linearRampToValueAtTime(0, now + i * 0.12 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.4);
      });
    } catch {
      // Audio not available
    }
  }
}

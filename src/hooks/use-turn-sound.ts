import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "arcane-table-turn-sound";

export function useTurnSound(isMyTurn: boolean) {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === null ? true : stored === "true";
    } catch {
      return true;
    }
  });

  const prevTurn = useRef(isMyTurn);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const toggleSound = () => {
    setSoundEnabled(prev => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  useEffect(() => {
    // Play sound only on transition from not-my-turn → my-turn
    if (isMyTurn && !prevTurn.current && soundEnabled) {
      playTurnChime();
    }
    prevTurn.current = isMyTurn;
  }, [isMyTurn, soundEnabled]);

  function playTurnChime() {
    try {
      const ctx = audioCtxRef.current || new AudioContext();
      audioCtxRef.current = ctx;

      const now = ctx.currentTime;

      // Two-note chime: a rising fifth
      const notes = [523.25, 783.99]; // C5, G5
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now + i * 0.15);
        gain.gain.linearRampToValueAtTime(0.3, now + i * 0.15 + 0.05);
        gain.gain.linearRampToValueAtTime(0, now + i * 0.15 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.15);
        osc.stop(now + i * 0.15 + 0.5);
      });
    } catch {
      // Audio not available
    }
  }

  return { soundEnabled, toggleSound };
}

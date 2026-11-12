import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface SoundContextType {
  isSoundEnabled: boolean;
  toggleSound: () => void;
  playPopSound: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('gomeat_sound_enabled');
    // Default state: Sound ON
    return saved !== null ? saved === 'true' : true;
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioElemRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    localStorage.setItem('gomeat_sound_enabled', String(isSoundEnabled));
  }, [isSoundEnabled]);

  useEffect(() => {
    try {
      const audio = new Audio('/sounds/pop.mp3');
      audio.volume = 0.22; // Low, pleasant, non-intrusive volume
      audioElemRef.current = audio;
    } catch {
      // Audio element not supported in this runtime
    }
  }, []);

  const toggleSound = () => {
    setIsSoundEnabled(prev => {
      const nextState = !prev;
      if (nextState) {
        // Confirmation chirp when turning ON
        setTimeout(() => triggerPop(true), 30);
      }
      return nextState;
    });
  };

  const triggerPop = (force = false) => {
    if (!isSoundEnabled && !force) return;

    try {
      // 1. Web Audio API - Instantaneous, zero-lag, soft bubble pop (~0.22s)
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
          audioCtxRef.current = new AudioCtx();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // 540Hz down to 290Hz soft organic pop
        osc.type = 'sine';
        osc.frequency.setValueAtTime(540, now);
        osc.frequency.exponentialRampToValueAtTime(290, now + 0.16);

        // Soft, gentle decay
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.25);
        return;
      }
    } catch {
      // Fall through to HTML5 audio
    }

    // 2. Fallback to /sounds/pop.mp3
    try {
      if (audioElemRef.current) {
        audioElemRef.current.currentTime = 0;
        audioElemRef.current.volume = 0.22;
        audioElemRef.current.play().catch(() => {});
      }
    } catch {
      // Silent fail if browser policy blocks
    }
  };

  const playPopSound = () => {
    triggerPop(false);
  };

  return (
    <SoundContext.Provider value={{ isSoundEnabled, toggleSound, playPopSound }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    return {
      isSoundEnabled: true,
      toggleSound: () => {},
      playPopSound: () => {}
    };
  }
  return context;
};

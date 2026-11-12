import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface SoundContextType {
  isSoundEnabled: boolean;
  toggleSound: () => void;
  playSound: () => void;
  playDingSound: () => void;
  playPopSound: () => void; // Maintained for backwards compatibility across components
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

  // Preload ding.wav fallback
  useEffect(() => {
    try {
      const audio = new Audio('/sounds/ding.wav');
      audio.volume = 0.28;
      audioElemRef.current = audio;
    } catch {
      // Audio element not supported in this runtime
    }
  }, []);

  const triggerDing = (forcePlay = false) => {
    if (!isSoundEnabled && !forcePlay) return;

    // 1. Instant zero-latency Web Audio API synthesis (Harmonic crystal chime E6 1318.5Hz + E7 2637Hz)
    try {
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
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        const gain2 = ctx.createGain();

        // Fundamental tone: E6 (1318.5 Hz)
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1318.5, now);

        // Harmonic overtone: E7 (2637.0 Hz)
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(2637.0, now);

        // Shimmering, smooth acoustic decay
        gain1.gain.setValueAtTime(0.01, now);
        gain1.gain.linearRampToValueAtTime(0.28, now + 0.003);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        gain2.gain.setValueAtTime(0.01, now);
        gain2.gain.linearRampToValueAtTime(0.12, now + 0.003);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

        osc1.connect(gain1);
        osc2.connect(gain2);
        gain1.connect(ctx.destination);
        gain2.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.38);
        osc2.stop(now + 0.38);
        return;
      }
    } catch {
      // Fall through to HTML5 audio element
    }

    // 2. Pre-rendered ding.wav audio fallback
    try {
      if (audioElemRef.current) {
        audioElemRef.current.currentTime = 0;
        audioElemRef.current.play().catch(() => {});
      }
    } catch {
      // Browser autoplay policy silent fallback
    }
  };

  const toggleSound = () => {
    setIsSoundEnabled(prev => {
      const nextState = !prev;
      if (nextState) {
        // Confirmation ding when unmuting
        setTimeout(() => triggerDing(true), 30);
      }
      return nextState;
    });
  };

  const playDingSound = () => {
    triggerDing(false);
  };

  return (
    <SoundContext.Provider 
      value={{ 
        isSoundEnabled, 
        toggleSound, 
        playSound: playDingSound,
        playDingSound, 
        playPopSound: playDingSound 
      }}
    >
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
      playSound: () => {},
      playDingSound: () => {},
      playPopSound: () => {}
    };
  }
  return context;
};

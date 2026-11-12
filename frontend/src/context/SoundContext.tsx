import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export type SoundEffectType = 'pop' | 'click' | 'ding';

interface SoundContextType {
  isSoundEnabled: boolean;
  soundType: SoundEffectType;
  toggleSound: () => void;
  setSoundType: (type: SoundEffectType) => void;
  playSound: (overrideType?: SoundEffectType) => void;
  playPopSound: () => void; // Backward compatibility with previous references
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('gomeat_sound_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  const [soundType, setSoundTypeState] = useState<SoundEffectType>(() => {
    if (typeof window === 'undefined') return 'pop';
    const saved = localStorage.getItem('gomeat_sound_type') as SoundEffectType;
    return ['pop', 'click', 'ding'].includes(saved) ? saved : 'pop';
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioCacheRef = useRef<Record<SoundEffectType, HTMLAudioElement | null>>({
    pop: null,
    click: null,
    ding: null
  });

  useEffect(() => {
    localStorage.setItem('gomeat_sound_enabled', String(isSoundEnabled));
  }, [isSoundEnabled]);

  useEffect(() => {
    localStorage.setItem('gomeat_sound_type', soundType);
  }, [soundType]);

  // Preload audio fallbacks
  useEffect(() => {
    try {
      (['pop', 'click', 'ding'] as SoundEffectType[]).forEach(type => {
        const audio = new Audio(`/sounds/${type}.wav`);
        audio.volume = type === 'click' ? 0.35 : 0.25;
        audioCacheRef.current[type] = audio;
      });
    } catch {
      // Audio element not supported in this runtime
    }
  }, []);

  const setSoundType = (type: SoundEffectType) => {
    setSoundTypeState(type);
    // Preview selected sound immediately
    triggerAudio(type, true);
  };

  const toggleSound = () => {
    setIsSoundEnabled(prev => {
      const nextState = !prev;
      if (nextState) {
        // Confirmation preview chirp when turning ON
        setTimeout(() => triggerAudio(soundType, true), 30);
      }
      return nextState;
    });
  };

  const triggerAudio = (targetType: SoundEffectType, forcePlay = false) => {
    if (!isSoundEnabled && !forcePlay) return;

    // 1. Try zero-latency Web Audio API synthesis
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

        if (targetType === 'pop') {
          // Acoustic Cork / Bubble Pop (880Hz down to 320Hz with resonance)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, now);
          osc.frequency.exponentialRampToValueAtTime(320, now + 0.12);

          gain.gain.setValueAtTime(0.01, now);
          gain.gain.linearRampToValueAtTime(0.35, now + 0.005);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.18);
          return;
        }

        if (targetType === 'click') {
          // Crisp Tactile Haptic Switch / Mechanical Click (2400Hz sharp transient)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(2400, now);
          osc.frequency.exponentialRampToValueAtTime(900, now + 0.035);

          gain.gain.setValueAtTime(0.01, now);
          gain.gain.linearRampToValueAtTime(0.32, now + 0.002);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.06);
          return;
        }

        if (targetType === 'ding') {
          // Crystalline Success Bell / Service Chime (Harmonic E6 + E7 chord)
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain1 = ctx.createGain();
          const gain2 = ctx.createGain();

          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(1318.5, now); // E6

          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(2637.0, now); // E7 overtone

          // Smooth chime decay
          gain1.gain.setValueAtTime(0.01, now);
          gain1.gain.linearRampToValueAtTime(0.28, now + 0.003);
          gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

          gain2.gain.setValueAtTime(0.01, now);
          gain2.gain.linearRampToValueAtTime(0.12, now + 0.003);
          gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

          osc1.connect(gain1);
          osc2.connect(gain2);
          gain1.connect(ctx.destination);
          gain2.connect(ctx.destination);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 0.35);
          osc2.stop(now + 0.35);
          return;
        }
      }
    } catch {
      // Fallback to pre-generated WAV audio element
    }

    // 2. Fallback to HTML5 audio element
    try {
      const audio = audioCacheRef.current[targetType];
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    } catch {
      // Browser autoplay policy silent fallback
    }
  };

  const playSound = (overrideType?: SoundEffectType) => {
    triggerAudio(overrideType || soundType, false);
  };

  const playPopSound = () => {
    playSound();
  };

  return (
    <SoundContext.Provider 
      value={{ 
        isSoundEnabled, 
        soundType, 
        toggleSound, 
        setSoundType, 
        playSound, 
        playPopSound 
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
      soundType: 'pop' as SoundEffectType,
      toggleSound: () => {},
      setSoundType: () => {},
      playSound: () => {},
      playPopSound: () => {}
    };
  }
  return context;
};

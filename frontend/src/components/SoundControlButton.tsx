import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Check, ChevronDown, Music, Bell, MousePointerClick, Sparkles } from 'lucide-react';
import { useSound, SoundEffectType } from '../context/SoundContext';

export const SoundControlButton: React.FC = () => {
  const { isSoundEnabled, soundType, toggleSound, setSoundType } = useSound();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const soundOptions: Array<{ id: SoundEffectType; label: string; icon: any; desc: string }> = [
    { id: 'pop', label: 'Pop Sound', icon: Sparkles, desc: 'Crisp organic cork / bubble pop' },
    { id: 'click', label: 'Click Sound', icon: MousePointerClick, desc: 'Snappy tactile haptic switch' },
    { id: 'ding', label: 'Ding Sound', icon: Bell, desc: 'Melodic crystal service chime' },
  ];

  return (
    <aside aria-label="Sound Preferences" className="fixed top-2 sm:top-2.5 right-2 sm:right-3.5 z-45" ref={containerRef}>
      <div className="relative inline-flex items-center">
        {/* Main Pill Button */}
        <div
          className={`h-8 sm:h-8.5 px-2.5 sm:px-3 rounded-full flex items-center gap-1.5 text-xs font-bold transition-all duration-200 shadow-md select-none border backdrop-blur-md ${
            isSoundEnabled
              ? 'bg-white/95 dark:bg-slate-900/95 text-emerald-700 dark:text-emerald-400 border-emerald-400/70 dark:border-emerald-600/70 hover:bg-emerald-50 dark:hover:bg-slate-800 ring-2 ring-emerald-400/20'
              : 'bg-white/90 dark:bg-slate-900/90 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800'
          }`}
        >
          {/* Mute / Unmute Toggle Button */}
          <button
            onClick={toggleSound}
            type="button"
            title={isSoundEnabled ? 'Sound is ON (Click to mute)' : 'Sound is OFF (Click to unmute)'}
            aria-label={isSoundEnabled ? 'Mute sounds' : 'Unmute sounds'}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            {isSoundEnabled ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-[11px] font-black tracking-tight">Sound ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
                <span className="text-[11px] font-bold tracking-tight text-gray-500 dark:text-gray-400">Sound OFF</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="h-3 w-px bg-gray-300 dark:bg-slate-700 mx-0.5" />

          {/* Sound Profile Switcher Dropdown Trigger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            title="Choose sound: Pop, Click, or Ding"
            aria-expanded={isOpen}
            className="flex items-center gap-1 hover:text-[#d11243] cursor-pointer text-[10px] uppercase font-black tracking-wider transition"
          >
            <span className="capitalize">{soundType}</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Floating Sound Selection Menu */}
        {isOpen && (
          <div className="absolute right-0 top-10 w-56 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50 text-xs animate-scale-up">
            <div className="px-2 py-1.5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                Choose Sound
              </span>
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                Click to Test
              </span>
            </div>

            <div className="mt-1 space-y-1">
              {soundOptions.map((opt) => {
                const isSelected = soundType === opt.id;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSoundType(opt.id);
                    }}
                    className={`w-full p-2 rounded-xl text-left flex items-center justify-between transition cursor-pointer ${
                      isSelected
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-[#d11243] dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 font-bold'
                        : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-[#d11243] text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-500'
                      }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-tight">{opt.label}</div>
                        <div className="text-[10px] text-gray-400 font-normal">{opt.desc}</div>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#d11243] dark:text-rose-400 shrink-0 ml-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

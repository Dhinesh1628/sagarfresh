import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useSound } from '../context/SoundContext';

export const SoundControlButton: React.FC = () => {
  const { isSoundEnabled, toggleSound } = useSound();

  return (
    <aside aria-label="Sound Preferences">
      <button
        onClick={toggleSound}
        type="button"
        title={isSoundEnabled ? 'Sound is ON (Click to mute)' : 'Sound is OFF (Click to unmute)'}
        aria-label={isSoundEnabled ? 'Mute pop sounds' : 'Unmute pop sounds'}
        className={`fixed top-2 sm:top-2.5 right-2 sm:right-3.5 z-45 h-8 sm:h-8.5 px-2.5 sm:px-3 rounded-full flex items-center gap-1.5 text-xs font-bold transition-all duration-200 cursor-pointer shadow-md select-none border backdrop-blur-md ${
          isSoundEnabled
            ? 'bg-white/95 dark:bg-slate-900/95 text-emerald-700 dark:text-emerald-400 border-emerald-400/70 dark:border-emerald-600/70 hover:bg-emerald-50 dark:hover:bg-slate-800 ring-2 ring-emerald-400/20 active:scale-95'
            : 'bg-white/90 dark:bg-slate-900/90 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 active:scale-95'
        }`}
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
    </aside>
  );
};

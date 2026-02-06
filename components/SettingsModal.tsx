
import React, { useState, useEffect } from 'react';
import { Terminal, AlertTriangle, Volume2, VolumeX } from 'lucide-react';
import { DeveloperModal } from './DeveloperModal';
import { WorshipperType } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  musicEnabled: boolean;
  musicVolume?: number; // Optional to handle legacy saves if not immediately passed, though logic handles it
  toggleSound: () => void;
  toggleMusic: () => void;
  setMusicVolume: (volume: number) => void;
  debugAddWorshippers?: (type: WorshipperType, amount: number) => void;
  resetSave: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  soundEnabled,
  musicEnabled,
  musicVolume = 0.3,
  toggleSound, 
  toggleMusic,
  setMusicVolume,
  debugAddWorshippers,
  resetSave
}) => {
  const [isDeveloper, setIsDeveloper] = useState(false);
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('developer') === '1') {
      setIsDeveloper(true);
    }
  }, []);

  if (!isOpen) return null;

  if (showResetConfirm) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="w-80 border-2 border-red-900/50 bg-eldritch-dark p-6 shadow-[0_0_50px_rgba(220,38,38,0.2)] text-center animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-center mb-4"><AlertTriangle className="h-10 w-10 text-red-500" /></div>
                <h2 className="mb-4 font-serif text-xl text-red-500 font-bold">Hard Reset</h2>
                <p className="mb-6 text-sm text-gray-400">
                    Are you sure? This will wipe your save data completely. You will lose all progress and start from the beginning.
                </p>
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={() => {
                            resetSave();
                            onClose();
                            setShowResetConfirm(false);
                        }}
                        className="w-full bg-red-900/50 border border-red-500/50 py-2 text-red-200 font-bold hover:bg-red-900 transition-colors"
                    >
                        Yes, Wipe It
                    </button>
                    <button 
                        onClick={() => setShowResetConfirm(false)}
                        className="w-full bg-gray-800 border border-gray-600 py-2 text-gray-300 hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
      )
  }

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-80 border-2 border-eldritch-gold/50 bg-eldritch-dark p-6 shadow-[0_0_50px_rgba(197,160,89,0.2)]">
        <h2 className="mb-6 text-center font-serif text-2xl text-eldritch-gold">Settings</h2>
        
        <div className="mb-6 flex items-center justify-between">
          <span className="text-lg text-gray-300">Sound Effects</span>
          <button 
            onClick={toggleSound}
            className={`flex h-6 w-12 items-center rounded-full px-1 transition-colors ${soundEnabled ? 'bg-eldritch-crimson' : 'bg-gray-600'}`}
          >
            <div className={`h-4 w-4 rounded-full bg-white transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
                <span className="text-lg text-gray-300">Music</span>
                <button 
                    onClick={toggleMusic}
                    className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    title={musicEnabled ? "Mute Music" : "Unmute Music"}
                >
                    {musicEnabled && musicVolume > 0 ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                </button>
            </div>
            <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05" 
                value={musicVolume} 
                onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-eldritch-gold hover:accent-yellow-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>{Math.round(musicVolume * 100)}%</span>
            </div>
        </div>
        
        {isDeveloper && (
           <button 
             onClick={() => setIsDevModalOpen(true)}
             className="w-full flex items-center justify-center gap-2 border border-eldritch-lilac/50 bg-eldritch-lilac/20 py-2 font-serif text-eldritch-lilac font-bold hover:bg-eldritch-lilac/30 transition-colors mb-4"
           >
             <Terminal className="h-4 w-4" />
             Developer Mode
           </button>
        )}

        <button 
          onClick={() => setShowResetConfirm(true)}
          className="w-full border border-red-900/40 bg-red-950/20 py-2 font-serif text-red-500 hover:bg-red-900/30 transition-colors mb-4 text-xs font-bold uppercase tracking-wider"
        >
          Hard Reset
        </button>

        <button 
          onClick={onClose}
          className="w-full border border-eldritch-gold/30 bg-black py-2 font-serif text-eldritch-gold hover:bg-eldritch-gold/10 transition-colors mb-4"
        >
          Close
        </button>

        <div className="text-center text-[10px] text-gray-500 italic">
          Music: Incesante by <a href="https://pixabay.com/users/anrocomposer-26029862/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=119658" target="_blank" rel="noopener noreferrer" className="text-eldritch-gold hover:underline">Andres Rodriguez</a>
        </div>
      </div>
    </div>
    {debugAddWorshippers && (
        <DeveloperModal 
            isOpen={isDevModalOpen} 
            onClose={() => setIsDevModalOpen(false)} 
            debugAddWorshippers={debugAddWorshippers} 
        />
    )}
    </>
  );
};

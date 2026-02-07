import React, { useState, useEffect } from 'react';
import { Terminal, Volume2, VolumeX, AlertTriangle } from 'lucide-react';
import { DeveloperModal } from './DeveloperModal';
import { WorshipperType } from '../types';
import { BaseModal } from './BaseModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  musicEnabled: boolean;
  musicVolume?: number; 
  toggleSound: () => void;
  toggleMusic: () => void;
  setMusicVolume: (volume: number) => void;
  debugAddWorshippers?: (type: WorshipperType, amount: number) => void;
  debugUnlockFeature?: (feature: 'GEMS' | 'VESSELS' | 'END_TIMES' | 'ASSISTANT') => void;
  debugAddSouls?: (amount: number) => void;
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
  debugUnlockFeature,
  debugAddSouls,
  resetSave
}) => {
  const [isDeveloper, setIsDeveloper] = useState(false);
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);
  const [resetConfirmStep, setResetConfirmStep] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('developer') === '1' || window.location.pathname.includes('usercontent.goog')) setIsDeveloper(true);
  }, []);

  // Reset confirmation state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setResetConfirmStep(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleResetClick = () => {
    if (resetConfirmStep === 0) {
      setResetConfirmStep(1);
    } else {
      resetSave();
      onClose();
    }
  };

  return (
    <>
    <BaseModal onClose={onClose} zIndex={50} containerClassName="max-w-sm w-full border-eldritch-gold/50 p-6">
      <h2 className="mb-6 text-center font-serif text-2xl text-eldritch-gold">Settings</h2>
      
      <div className="mb-6 flex items-center justify-between">
        <span className="text-gray-300">Sound Effects</span>
        <button onClick={toggleSound} className={`flex h-6 w-12 items-center rounded-full px-1 ${soundEnabled ? 'bg-eldritch-crimson' : 'bg-gray-600'}`}>
          <div className={`h-4 w-4 rounded-full bg-white transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
      </div>
      
      <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300">Music</span>
              <button onClick={toggleMusic} className="p-1.5 rounded hover:bg-white/10 text-gray-400">
                {musicEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </button>
          </div>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.05" 
            value={musicVolume} 
            onChange={(e) => setMusicVolume(parseFloat(e.target.value))} 
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-eldritch-gold" 
          />
      </div>

      {isDeveloper && (
        <button onClick={() => setIsDevModalOpen(true)} className="w-full flex items-center justify-center gap-2 border border-eldritch-lilac/50 bg-eldritch-lilac/20 py-2 font-serif text-eldritch-lilac mb-4 rounded-lg">
          <Terminal className="h-4 w-4" /> Developer Mode
        </button>
      )}

      <button 
        onClick={handleResetClick} 
        className={`w-full border py-2 font-serif mb-4 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 flex items-center justify-center gap-2
          ${resetConfirmStep === 1 
            ? 'border-red-500 bg-red-900/40 text-white animate-pulse' 
            : 'border-red-900/40 bg-red-950/20 text-red-500'
          }`}
      >
        {resetConfirmStep === 1 ? (
          <>
            <AlertTriangle className="h-4 w-4" /> Confirm Wipe?
          </>
        ) : (
          'Hard Reset'
        )}
      </button>

      <button onClick={onClose} className="w-full border border-eldritch-gold/30 bg-black py-2 font-serif text-eldritch-gold rounded-lg hover:bg-eldritch-gold/10 transition-colors">
        Close
      </button>
    </BaseModal>
    
    {isDevModalOpen && (
      <DeveloperModal 
        isOpen={isDevModalOpen} 
        onClose={() => setIsDevModalOpen(false)} 
        debugAddWorshippers={debugAddWorshippers!} 
        debugUnlockFeature={debugUnlockFeature}
        debugAddSouls={debugAddSouls}
      />
    )}
    </>
  );
};

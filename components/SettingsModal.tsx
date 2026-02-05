import React from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  soundEnabled, 
  toggleSound 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-80 border-2 border-eldritch-gold/50 bg-eldritch-dark p-6 shadow-[0_0_50px_rgba(197,160,89,0.2)]">
        <h2 className="mb-6 text-center font-serif text-2xl text-eldritch-gold">Settings</h2>
        
        <div className="mb-8 flex items-center justify-between">
          <span className="text-lg text-gray-300">Sound Effects</span>
          <button 
            onClick={toggleSound}
            className={`flex h-6 w-12 items-center rounded-full px-1 transition-colors ${soundEnabled ? 'bg-eldritch-crimson' : 'bg-gray-600'}`}
          >
            <div className={`h-4 w-4 rounded-full bg-white transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        <button 
          onClick={onClose}
          className="w-full border border-eldritch-gold/30 bg-black py-2 font-serif text-eldritch-gold hover:bg-eldritch-gold/10 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
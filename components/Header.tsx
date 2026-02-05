import React, { useState } from 'react';
import { GameState } from '../types';
import { Settings, Users } from 'lucide-react';
import { SettingsModal } from './SettingsModal';

interface HeaderProps {
  gameState: GameState;
  toggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({ gameState, toggleSound }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <header className="flex h-[10%] w-full items-center justify-between border-b border-eldritch-grey/30 bg-eldritch-black px-4 lg:px-8 shadow-2xl z-20 relative">
      <div className="flex items-center gap-2">
        <h1 className="font-serif text-2xl font-black uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-eldritch-gold via-yellow-600 to-yellow-800 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] lg:text-3xl">
          Shattered Dogma
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 rounded-lg bg-eldritch-dark/50 px-4 py-2 border border-eldritch-grey/20">
          <Users className="h-5 w-5 text-gray-400" />
          <span className="font-mono text-xl font-bold text-white">
            {gameState.totalWorshippers.toLocaleString()}
          </span>
          <span className="hidden text-sm text-gray-500 sm:inline">Total Cult</span>
        </div>

        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="rounded-full p-2 text-gray-400 hover:bg-eldritch-grey/20 hover:text-white transition-colors"
        >
          <Settings className="h-6 w-6" />
        </button>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        soundEnabled={gameState.settings.soundEnabled}
        toggleSound={toggleSound}
      />
    </header>
  );
};
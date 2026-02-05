import React, { useState } from 'react';
import { GameState } from '../types';
import { Settings, Users, Activity } from 'lucide-react';
import { SettingsModal } from './SettingsModal';

interface HeaderProps {
  gameState: GameState;
  toggleSound: () => void;
  passiveIncome?: number;
}

export const Header: React.FC<HeaderProps> = ({ gameState, toggleSound, passiveIncome = 0 }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <header className="flex h-[10%] w-full items-center justify-between border-b border-eldritch-grey/30 bg-eldritch-black px-3 sm:px-8 shadow-2xl z-20 relative">
      <div className="flex items-center gap-2">
        <h1 className="font-serif text-base sm:text-2xl lg:text-3xl font-black uppercase tracking-widest sm:tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-eldritch-gold via-yellow-600 to-yellow-800 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] whitespace-nowrap">
          Shattered Dogma
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-6">
        {passiveIncome > 0 && (
          <div className="hidden md:flex items-center gap-1.5 rounded-lg bg-black/50 px-3 py-1 border border-eldritch-grey/10 animate-fade-in">
             <Activity className="h-4 w-4 text-green-500" />
             <span className="font-mono text-sm font-bold text-green-400">+{passiveIncome}/s</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 sm:gap-2 rounded-lg bg-eldritch-dark/50 px-2 py-1 sm:px-4 sm:py-2 border border-eldritch-grey/20">
          <Users className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          <span className="font-mono text-sm sm:text-xl font-bold text-white">
            {gameState.totalWorshippers.toLocaleString()}
          </span>
          <span className="hidden text-sm text-gray-500 sm:inline">Total Cult</span>
        </div>

        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="rounded-full p-1.5 sm:p-2 text-gray-400 hover:bg-eldritch-grey/20 hover:text-white transition-colors"
        >
          <Settings className="h-5 w-5 sm:h-6 sm:w-6" />
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
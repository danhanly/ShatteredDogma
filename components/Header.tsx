
import React, { useState } from 'react';
import { GameState, WorshipperType } from '../types';
import { Settings, Users, Activity, Orbit, Coffee } from 'lucide-react';
import { SettingsModal } from './SettingsModal';
import { formatNumber } from '../utils/format';

interface HeaderProps {
  gameState: GameState;
  toggleSound: () => void;
  toggleMusic: () => void;
  setMusicVolume: (volume: number) => void;
  setActiveTab: (tab: 'MIRACLES' | 'VESSELS' | 'CULT' | 'END_TIMES') => void;
  passiveIncome?: number;
  debugAddWorshippers?: (type: WorshipperType, amount: number) => void;
  debugUnlockFeature?: (feature: 'GEMS' | 'VESSELS' | 'END_TIMES' | 'ASSISTANT') => void;
  debugAddSouls?: (amount: number) => void;
  resetSave: () => void;
}

export const Header: React.FC<HeaderProps> = ({ gameState, toggleSound, toggleMusic, setMusicVolume, setActiveTab, passiveIncome = 0, debugAddWorshippers, debugUnlockFeature, debugAddSouls, resetSave }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <header className="flex h-[10%] w-full items-center justify-between border-b border-eldritch-grey/30 bg-eldritch-black px-3 sm:px-8 shadow-2xl z-20 relative">
      <div className="flex items-center gap-2">
        <h1 className="font-gothic text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-widest sm:tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-eldritch-gold via-yellow-600 to-yellow-800 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] whitespace-nowrap">
          Shattered Dogma
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-6">
        {gameState.souls > 0 && (
           <div className="flex items-center gap-1.5 rounded-lg bg-indigo-950/50 px-3 py-1 border border-indigo-500/30 animate-fade-in shadow-[0_0_10px_rgba(99,102,241,0.2)]">
             <Orbit className="h-4 w-4 text-indigo-400" />
             <span className="font-mono text-sm font-bold text-indigo-300">{formatNumber(gameState.souls)}</span>
          </div>
        )}

        {passiveIncome > 0 && (
          <div className="hidden md:flex items-center gap-1.5 rounded-lg bg-black/50 px-3 py-1 border border-eldritch-grey/10 animate-fade-in">
             <Activity className="h-4 w-4 text-green-500" />
             <span className="font-mono text-sm font-bold text-green-400">+{formatNumber(passiveIncome)}/s</span>
          </div>
        )}

        <div 
          onClick={() => setActiveTab('CULT')}
          className="flex items-center gap-1.5 sm:gap-2 sm:rounded-lg sm:bg-eldritch-dark/50 px-0 sm:px-4 py-1 sm:py-2 sm:border sm:border-eldritch-grey/20 cursor-pointer hover:bg-white/5 transition-colors"
        >
          <Users className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          <span className="font-mono text-sm sm:text-xl font-bold text-white">
            {formatNumber(gameState.totalWorshippers)}
          </span>
          <span className="hidden text-sm text-gray-500 sm:inline">Total Cult</span>
        </div>

        <a 
          href="https://ko-fi.com/danhanly" 
          target="_blank" 
          rel="noopener noreferrer"
          className="rounded-full p-1.5 sm:p-2 text-gray-400 hover:bg-eldritch-grey/20 hover:text-white transition-colors"
          title="Buy the Developer a Coffee"
        >
          <Coffee className="h-5 w-5 sm:h-6 sm:w-6" />
        </a>

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
        musicEnabled={gameState.settings.musicEnabled}
        soundEnabled={gameState.settings.soundEnabled}
        musicVolume={gameState.settings.musicVolume}
        toggleSound={toggleSound}
        toggleMusic={toggleMusic}
        setMusicVolume={setMusicVolume}
        debugAddWorshippers={debugAddWorshippers}
        debugUnlockFeature={debugUnlockFeature}
        debugAddSouls={debugAddSouls}
        resetSave={resetSave}
      />
    </header>
  );
};
